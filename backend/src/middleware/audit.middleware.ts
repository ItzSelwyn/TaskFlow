import { prisma } from '../config/prisma';
import { AuditAction } from '../types/enums';
import { logger } from '../utils/logger';

interface AuditEntry {
  orgId: string;
  actorId: string;
  action: AuditAction;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}

export const writeAuditLog = async (entry: AuditEntry) => {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: entry.orgId,
        actorId: entry.actorId,
        action: entry.action as any,
        entityId: entry.entityId,
        entityType: entry.entityType,
        metadata: entry.metadata as any,
      },
    });
  } catch (err) {
    logger.error('Failed to write audit log', err);
  }
};
