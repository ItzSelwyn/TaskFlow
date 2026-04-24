import { Request, Response, NextFunction } from 'express';
import * as orgService from '../services/org.service';
import { sendSuccess } from '../utils/response';
import { z } from 'zod';
import { Role } from '../types/enums';

export const getOrg = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await orgService.getOrganization((req.user! as any).orgId);
    sendSuccess(res, org);
  } catch (err) {
    next(err);
  }
};

export const updateOrg = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = z.object({ name: z.string().optional(), description: z.string().optional() }).parse(req.body);
    const org = await orgService.updateOrganization((req.user! as any), data);
    sendSuccess(res, org);
  } catch (err) {
    next(err);
  }
};

export const invite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = z.object({ email: z.string().email(), role: z.nativeEnum(Role).default(Role.MEMBER) }).parse(req.body);
    const inv = await orgService.inviteMember((req.user! as any), data);
    sendSuccess(res, inv, 'Invite sent', 201);
  } catch (err) {
    next(err);
  }
};

export const acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = z.object({ token: z.string() }).parse(req.params);
    const org = await orgService.acceptInvite(token, (req.user! as any).userId);
    sendSuccess(res, org, 'Joined organization');
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orgService.removeMember((req.user! as any), req.params.userId);
    sendSuccess(res, null, 'Member removed');
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = z.object({ role: z.nativeEnum(Role) }).parse(req.body);
    const member = await orgService.updateMemberRole((req.user! as any), req.params.userId, role);
    sendSuccess(res, member);
  } catch (err) {
    next(err);
  }
};

export const auditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = z.object({
      page: z.string().optional().transform((v) => v ? parseInt(v) : 1),
      limit: z.string().optional().transform((v) => v ? parseInt(v) : 30),
    }).parse(req.query);
    const logs = await orgService.getAuditLogs((req.user! as any).orgId, page, limit);
    sendSuccess(res, logs);
  } catch (err) {
    next(err);
  }
};

export const stats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orgService.getDashboardStats((req.user! as any).orgId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
