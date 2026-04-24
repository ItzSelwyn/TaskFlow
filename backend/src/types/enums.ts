// Mirror of Prisma enums — keeps source compilable without generated client
export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum AuditAction {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  MEMBER_INVITED = 'MEMBER_INVITED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  MEMBER_ROLE_CHANGED = 'MEMBER_ROLE_CHANGED',
  ORG_UPDATED = 'ORG_UPDATED',
}
