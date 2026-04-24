import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { prisma } from '../config/prisma';
import { Role } from '../types/enums';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: payload.orgId,
          userId: payload.userId,
        },
      },
    });

    if (!membership) return sendError(res, 'Membership revoked or not found', 401);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      orgId: payload.orgId,
      role: membership.role as Role,
    };
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as unknown as Role)) {
      return sendError(res, 'Insufficient permissions', 403);
    }
    next();
  };
};

export const requireAdmin = requireRole(Role.ADMIN);
