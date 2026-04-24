import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/response';
import { Role } from '@prisma/client';

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
}

export const registerUser = async (data: {
  email: string;
  password: string;
  name: string;
  orgName: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Email already in use', 409);

  const passwordHash = await bcrypt.hash(data.password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: data.email, name: data.name, passwordHash },
    });

    const org = await tx.organization.create({
      data: { name: data.orgName, slug: slugify(data.orgName) },
    });

    await tx.organizationMember.create({
      data: { organizationId: org.id, userId: user.id, role: Role.ADMIN },
    });

    return { user, org };
  });

  return generateTokens(result.user.id, result.user.email, result.org.id, Role.ADMIN);
};

export const loginUser = async (data: {
  email: string;
  password: string;
  orgId?: string;
}) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !user.passwordHash) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  // Get orgs user belongs to
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    include: { organization: true },
  });

  if (!memberships.length) throw new AppError('No organization found', 404);

  // Use provided orgId or default to first
  const membership = data.orgId
    ? memberships.find((m) => m.organizationId === data.orgId)
    : memberships[0];

  if (!membership) throw new AppError('Organization not found', 404);

  const tokens = await generateTokens(user.id, user.email, membership.organizationId, membership.role);

  return {
    ...tokens,
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    organization: { id: membership.organization.id, name: membership.organization.name, slug: membership.organization.slug },
    organizations: memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      role: m.role,
    })),
  };
};

export const refreshTokens = async (token: string) => {
  const payload = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.refreshToken !== token) throw new AppError('Invalid refresh token', 401);

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });
  if (!membership) throw new AppError('No membership found', 401);

  return generateTokens(user.id, user.email, membership.organizationId, membership.role);
};

export const switchOrganization = async (userId: string, orgId: string) => {
  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId } },
    include: { organization: true },
  });
  if (!membership) throw new AppError('Not a member of this organization', 403);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  return generateTokens(userId, user.email, orgId, membership.role);
};

export const handleOAuthUser = async (profile: {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: string;
}) => {
  let user = await prisma.user.findUnique({ where: { email: profile.email } });

  if (!user) {
    user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          provider: profile.provider,
          providerId: profile.id,
        },
      });

      const org = await tx.organization.create({
        data: { name: `${profile.name}'s Workspace`, slug: slugify(profile.name) },
      });

      await tx.organizationMember.create({
        data: { organizationId: org.id, userId: newUser.id, role: Role.ADMIN },
      });

      return newUser;
    });
  }

  const membership = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
  if (!membership) throw new AppError('No membership found', 401);

  return generateTokens(user.id, user.email, membership.organizationId, membership.role);
};

async function generateTokens(userId: string, email: string, orgId: string, role: Role) {
  const accessToken = signAccessToken({ userId, email, orgId, role: role as string });
  const refreshToken = signRefreshToken(userId);

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
  });

  return { accessToken, refreshToken };
}
