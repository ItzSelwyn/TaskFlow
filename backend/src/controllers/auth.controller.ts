import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { z } from 'zod';
import { config } from '../config/env';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  orgName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  orgId: z.string().uuid().optional(),
});

const cookieOpts = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const tokens = await authService.registerUser(data);
    res.cookie('refreshToken', tokens.refreshToken, cookieOpts);
    sendSuccess(res, { accessToken: tokens.accessToken }, 'Registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.loginUser(data);
    res.cookie('refreshToken', result.refreshToken, cookieOpts);
    sendSuccess(res, {
      accessToken: result.accessToken,
      user: result.user,
      organization: result.organization,
      organizations: result.organizations,
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return sendError(res, 'No refresh token', 401);
    const tokens = await authService.refreshTokens(token);
    res.cookie('refreshToken', tokens.refreshToken, cookieOpts);
    sendSuccess(res, { accessToken: tokens.accessToken });
  } catch (err) {
    next(err);
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Logged out');
};

export const switchOrg = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = z.object({ orgId: z.string().uuid() }).parse(req.body);
    const tokens = await authService.switchOrganization(req.user!.userId, orgId);
    res.cookie('refreshToken', tokens.refreshToken, cookieOpts);
    sendSuccess(res, { accessToken: tokens.accessToken });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prisma } = await import('../config/prisma');
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, avatarUrl: true, provider: true, createdAt: true },
    });
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: req.user!.userId },
      include: { organization: { select: { id: true, name: true, slug: true } } },
    });
    sendSuccess(res, {
      user,
      currentOrg: { id: req.user!.orgId, role: req.user!.role },
      organizations: memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// OAuth callbacks
export const oauthCallback = (provider: string) => async (req: Request, res: Response) => {
  const user = req.user as any;
  res.cookie('refreshToken', user.refreshToken, cookieOpts);
  res.redirect(`${config.CLIENT_URL}/oauth/callback?token=${user.accessToken}`);
};
