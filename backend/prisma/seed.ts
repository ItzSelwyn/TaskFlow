import { PrismaClient, Role, TaskStatus, TaskPriority, AuditAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Org 1
  const org1 = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'Building the future, one task at a time.',
    },
  });

  // Create Org 2
  const org2 = await prisma.organization.create({
    data: {
      name: 'Globex Inc',
      slug: 'globex-inc',
      description: 'Excellence in everything.',
    },
  });

  // Create users
  const hash = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.create({
    data: { email: 'alice@acme.com', name: 'Alice Johnson', passwordHash: hash },
  });
  const bob = await prisma.user.create({
    data: { email: 'bob@acme.com', name: 'Bob Smith', passwordHash: hash },
  });
  const carol = await prisma.user.create({
    data: { email: 'carol@globex.com', name: 'Carol White', passwordHash: hash },
  });

  // Memberships
  await prisma.organizationMember.createMany({
    data: [
      { organizationId: org1.id, userId: alice.id, role: Role.ADMIN },
      { organizationId: org1.id, userId: bob.id, role: Role.MEMBER },
      { organizationId: org2.id, userId: carol.id, role: Role.ADMIN },
    ],
  });

  // Tasks for org1
  const taskData = [
    { title: 'Set up CI/CD pipeline', status: TaskStatus.DONE, priority: TaskPriority.HIGH, assignedToId: bob.id },
    { title: 'Design new landing page', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, assignedToId: alice.id },
    { title: 'Fix authentication bug', status: TaskStatus.TODO, priority: TaskPriority.URGENT, assignedToId: bob.id },
    { title: 'Write API documentation', status: TaskStatus.TODO, priority: TaskPriority.LOW },
    { title: 'Migrate to PostgreSQL', status: TaskStatus.IN_REVIEW, priority: TaskPriority.HIGH, assignedToId: alice.id },
  ];

  for (const t of taskData) {
    const task = await prisma.task.create({
      data: {
        ...t,
        organizationId: org1.id,
        createdById: alice.id,
        dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        tags: ['backend', 'q1'],
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org1.id,
        actorId: alice.id,
        action: AuditAction.TASK_CREATED,
        entityId: task.id,
        entityType: 'Task',
        metadata: { title: task.title },
      },
    });
  }

  // Tasks for org2 (isolated)
  await prisma.task.create({
    data: {
      title: 'Globex Q1 Planning',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      organizationId: org2.id,
      createdById: carol.id,
      tags: ['planning'],
    },
  });

  console.log('✅ Seed complete');
  console.log('  alice@acme.com / password123 (admin, Acme Corp)');
  console.log('  bob@acme.com / password123 (member, Acme Corp)');
  console.log('  carol@globex.com / password123 (admin, Globex Inc)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
