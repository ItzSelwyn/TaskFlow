import { prisma } from '../config/prisma';
import { AppError } from '../utils/response';
import { AuditAction, Role } from '../types/enums';
import { writeAuditLog } from '../middleware/audit.middleware';
import { sendInviteEmail } from './email.service';
import crypto from 'crypto';

export const getOrganization = async (orgId: string) => {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
    },
  });
  if (!org) throw new AppError('Organization not found', 404);
  return org;
};

export const updateOrganization = async (
  actor: { userId: string; orgId: string },
  data: { name?: string; description?: string }
) => {
  const org = await prisma.organization.update({
    where: { id: actor.orgId },
    data,
  });

  await writeAuditLog({
    orgId: actor.orgId,
    actorId: actor.userId,
    action: AuditAction.ORG_UPDATED,
    entityType: 'Organization',
    metadata: data,
  });

  return org;
};

export const inviteMember = async (
  actor: { userId: string; orgId: string },
  data: { email: string; role: Role }
) => {
  // Check if already a member
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    const existingMember = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: actor.orgId, userId: existingUser.id } },
    });
    if (existingMember) throw new AppError('User is already a member', 409);
  }

  // Expire old pending invites for this email+org
  await prisma.invite.updateMany({
    where: { organizationId: actor.orgId, email: data.email, acceptedAt: null },
    data: { expiresAt: new Date() },
  });

  const token = crypto.randomUUID();
  const invite = await prisma.invite.create({
    data: {
      organizationId: actor.orgId,
      email: data.email,
      role: data.role,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    include: { organization: true },
  });

  await sendInviteEmail(data.email, invite.organization.name, token);

  await writeAuditLog({
    orgId: actor.orgId,
    actorId: actor.userId,
    action: AuditAction.MEMBER_INVITED,
    entityType: 'Invite',
    metadata: { email: data.email, role: data.role },
  });

  return invite;
};

export const acceptInvite = async (token: string, userId: string) => {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invite) throw new AppError('Invalid invite token', 404);
  if (invite.expiresAt < new Date()) throw new AppError('Invite has expired', 410);
  if (invite.acceptedAt) throw new AppError('Invite already used', 409);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.email !== invite.email) throw new AppError('Invite is for a different email', 403);

  await prisma.$transaction(async (tx) => {
    await tx.organizationMember.create({
      data: { organizationId: invite.organizationId, userId, role: invite.role },
    });
    await tx.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
  });

  return invite.organization;
};

export const removeMember = async (
  actor: { userId: string; orgId: string },
  targetUserId: string
) => {
  if (actor.userId === targetUserId) throw new AppError('Cannot remove yourself', 400);

  const member = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: actor.orgId, userId: targetUserId } },
  });
  if (!member) throw new AppError('Member not found', 404);

  await prisma.organizationMember.delete({
    where: { organizationId_userId: { organizationId: actor.orgId, userId: targetUserId } },
  });

  await writeAuditLog({
    orgId: actor.orgId,
    actorId: actor.userId,
    action: AuditAction.MEMBER_REMOVED,
    entityType: 'User',
    entityId: targetUserId,
  });
};

export const updateMemberRole = async (
  actor: { userId: string; orgId: string },
  targetUserId: string,
  role: Role
) => {
  const member = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: actor.orgId, userId: targetUserId } },
  });
  if (!member) throw new AppError('Member not found', 404);

  const updated = await prisma.organizationMember.update({
    where: { organizationId_userId: { organizationId: actor.orgId, userId: targetUserId } },
    data: { role },
  });

  await writeAuditLog({
    orgId: actor.orgId,
    actorId: actor.userId,
    action: AuditAction.MEMBER_ROLE_CHANGED,
    entityType: 'User',
    entityId: targetUserId,
    metadata: { role },
  });

  return updated;
};

export const getAuditLogs = async (orgId: string, page = 1, limit = 30) => {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true } },
      },
    }),
    prisma.auditLog.count({ where: { organizationId: orgId } }),
  ]);

  return { logs, total, page, limit };
};

export const getDashboardStats = async (orgId: string) => {
  const [totalTasks, byStatus, byPriority, overdue, recentActivity] = await Promise.all([
    prisma.task.count({ where: { organizationId: orgId, deletedAt: null } }),
    prisma.task.groupBy({
      by: ['status'],
      where: { organizationId: orgId, deletedAt: null },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: { organizationId: orgId, deletedAt: null },
      _count: true,
    }),
    prisma.task.count({
      where: {
        organizationId: orgId,
        deletedAt: null,
        dueDate: { lt: new Date() },
        status: { notIn: ['DONE', 'CANCELLED'] },
      },
    }),
    prisma.auditLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
    }),
  ]);

  return { totalTasks, byStatus, byPriority, overdue, recentActivity };
};
