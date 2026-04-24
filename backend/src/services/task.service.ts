import { prisma } from '../config/prisma';
import { AppError } from '../utils/response';
import { AuditAction, Role, TaskPriority, TaskStatus } from '../types/enums';
import { writeAuditLog } from '../middleware/audit.middleware';
import { emitToOrg } from '../utils/socket';

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  search?: string;
  tags?: string[];
  dueBefore?: Date;
  dueAfter?: Date;
  page?: number;
  limit?: number;
}

interface Actor {
  userId: string;
  orgId: string;
  role: Role;
}

export const getTasks = async (actor: Actor, filters: TaskFilters) => {
  const { page = 1, limit = 20, search, tags, ...rest } = filters;
  const skip = (page - 1) * limit;

  const andConditions: any[] = [
    { organizationId: actor.orgId },
    { deletedAt: null },
    ...(rest.status ? [{ status: rest.status }] : []),
    ...(rest.priority ? [{ priority: rest.priority }] : []),
    ...(rest.assignedToId ? [{ assignedToId: rest.assignedToId }] : []),
    ...(rest.dueBefore ? [{ dueDate: { lte: rest.dueBefore } }] : []),
    ...(rest.dueAfter ? [{ dueDate: { gte: rest.dueAfter } }] : []),
    ...(tags?.length ? [{ tags: { hasSome: tags } }] : []),
    ...(search ? [{ OR: [
      { title: { contains: search, mode: 'insensitive' as const } },
      { description: { contains: search, mode: 'insensitive' as const } },
    ]}] : []),
  ];

  // Members can only see tasks they created or are assigned to
  if (actor.role === Role.MEMBER) {
    andConditions.push({
      OR: [
        { createdById: actor.userId },
        { assignedToId: actor.userId },
      ],
    });
  }

  const where = { AND: andConditions };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getTaskById = async (actor: Actor, taskId: string) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId: actor.orgId, deletedAt: null },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      auditLogs: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  });

  if (!task) throw new AppError('Task not found', 404);

  if (
    actor.role === Role.MEMBER &&
    task.createdById !== actor.userId &&
    task.assignedToId !== actor.userId
  ) {
    throw new AppError('Access denied', 403);
  }

  return task;
};

export const createTask = async (
  actor: Actor,
  data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date;
    assignedToId?: string;
    tags?: string[];
  }
) => {
  if (data.assignedToId) {
    const member = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: actor.orgId, userId: data.assignedToId } },
    });
    if (!member) throw new AppError('Assignee is not a member of this organization', 400);
  }

  const task = await prisma.task.create({
    data: { ...data, organizationId: actor.orgId, createdById: actor.userId },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      assignedTo: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  await writeAuditLog({
    orgId: actor.orgId,
    actorId: actor.userId,
    action: AuditAction.TASK_CREATED,
    entityId: task.id,
    entityType: 'Task',
    metadata: { title: task.title },
  });

  emitToOrg(actor.orgId, 'task:created', task);
  return task;
};

export const updateTask = async (
  actor: Actor,
  taskId: string,
  data: Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date;
    assignedToId: string | null;
    tags: string[];
  }>
) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId: actor.orgId, deletedAt: null },
  });

  if (!task) throw new AppError('Task not found', 404);

  if (actor.role === Role.MEMBER && task.createdById !== actor.userId) {
    throw new AppError('You can only update tasks you created', 403);
  }

  if (data.assignedToId) {
    const member = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: actor.orgId, userId: data.assignedToId } },
    });
    if (!member) throw new AppError('Assignee is not a member of this organization', 400);
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data,
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      assignedTo: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const action =
    data.status && data.status !== task.status
      ? AuditAction.TASK_STATUS_CHANGED
      : data.assignedToId !== undefined
      ? AuditAction.TASK_ASSIGNED
      : AuditAction.TASK_UPDATED;

  await writeAuditLog({
    orgId: actor.orgId,
    actorId: actor.userId,
    action,
    entityId: task.id,
    entityType: 'Task',
    metadata: { changes: data, previous: { status: task.status, assignedToId: task.assignedToId } },
  });

  emitToOrg(actor.orgId, 'task:updated', updated);
  return updated;
};

export const deleteTask = async (actor: Actor, taskId: string) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId: actor.orgId, deletedAt: null },
  });

  if (!task) throw new AppError('Task not found', 404);

  if (actor.role === Role.MEMBER && task.createdById !== actor.userId) {
    throw new AppError('You can only delete tasks you created', 403);
  }

  await prisma.task.update({ where: { id: taskId }, data: { deletedAt: new Date() } });

  await writeAuditLog({
    orgId: actor.orgId,
    actorId: actor.userId,
    action: AuditAction.TASK_DELETED,
    entityId: task.id,
    entityType: 'Task',
    metadata: { title: task.title },
  });

  emitToOrg(actor.orgId, 'task:deleted', { id: taskId });
};

export const exportTasksCSV = async (actor: Actor): Promise<string> => {
  const tasks = await prisma.task.findMany({
    where: { organizationId: actor.orgId, deletedAt: null },
    include: {
      createdBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
  });

  const header = 'ID,Title,Status,Priority,Assigned To,Created By,Due Date,Tags,Created At';
  const rows = tasks.map((t) =>
    [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.assignedTo?.name || '',
      t.createdBy.name,
      t.dueDate ? t.dueDate.toISOString().split('T')[0] : '',
      t.tags.join(';'),
      t.createdAt.toISOString(),
    ].join(',')
  );

  return [header, ...rows].join('\n');
};
