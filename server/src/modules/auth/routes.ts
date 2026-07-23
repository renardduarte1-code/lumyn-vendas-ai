import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../shared/prisma';
import { env } from '../../config';
import { hashPassword, verifyPassword } from '../../shared/security/password';
import { signAccessToken } from '../../shared/security/jwt';
import { generateRefreshTokenValue, hashToken } from '../../shared/security/tokens';
import { registerSchema, loginSchema } from '../../shared/validation/zod';
import { getAuth } from '../../shared/types/auth';
import { authenticate } from '../../middleware/auth';
import { createAuditLog } from '../audit/service';
import { AppError } from '../../shared/errors';
import { AuditAction } from '@prisma/client';

const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function setRefreshTokenCookie(reply: FastifyReply, token: string): void {
  reply.setCookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV === 'production',
    path: '/auth',
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

function clearRefreshTokenCookie(reply: FastifyReply): void {
  reply.clearCookie('refreshToken', { path: '/auth' });
}

async function createSessionAndRefreshToken(userId: string) {
  const session = await prisma.userSession.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    },
  });

  const rawToken = generateRefreshTokenValue();
  const tokenHash = hashToken(rawToken);

  await prisma.refreshToken.create({
    data: {
      sessionId: session.id,
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    },
  });

  return { session, rawToken, tokenHash };
}

async function buildAuthResponse(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true },
  });

  if (!user || user.status !== 'active' || user.tenant.status !== 'active') {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const accessToken = signAccessToken({
    sub: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    tenant: {
      id: user.tenant.id,
      name: user.tenant.name,
      document: user.tenant.document,
      plan: user.tenant.plan,
      status: user.tenant.status,
      creditsBalance: user.tenant.creditsBalance,
      createdAt: user.tenant.createdAt,
      updatedAt: user.tenant.updatedAt,
    },
  };
}

/**
 * Revokes a session and all its refresh tokens.
 * Used when a user/tenant is no longer valid during refresh.
 */
async function revokeSession(sessionId: string): Promise<void> {
  await prisma.$transaction([
    prisma.refreshToken.updateMany({
      where: { sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/register',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '10 minutes' },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = registerSchema.parse(request.body);
      const normalizedEmail = normalizeEmail(body.email);

      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existing) {
        throw new AppError('Email already registered', 409, 'EMAIL_IN_USE');
      }

      const passwordHash = await hashPassword(body.password);

      const tenant = await prisma.tenant.create({
        data: {
          name: body.companyName,
          plan: 'free',
          status: 'active',
        },
      });

      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: normalizedEmail,
          emailNormalized: normalizedEmail,
          passwordHash,
          fullName: body.fullName,
          role: 'owner',
          status: 'active',
        },
      });

      const { rawToken } = await createSessionAndRefreshToken(user.id);
      setRefreshTokenCookie(reply, rawToken);

      await createAuditLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'user_registered' as AuditAction,
        entityType: 'User',
        entityId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] as string | undefined,
      });

      const authResponse = await buildAuthResponse(user.id);
      return reply.status(201).send(authResponse);
    },
  );

  app.post(
    '/login',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = loginSchema.parse(request.body);
      const normalizedEmail = normalizeEmail(body.email);

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      // Generic error — do not reveal whether the email exists.
      if (!user || !user.passwordHash) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      const valid = await verifyPassword(user.passwordHash, body.password);
      if (!valid) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      // Only active users can open a session.
      if (user.status !== 'active') {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      // Only update lastLoginAt on successful authentication.
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const { rawToken } = await createSessionAndRefreshToken(user.id);
      setRefreshTokenCookie(reply, rawToken);

      await createAuditLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'user_login' as AuditAction,
        entityType: 'User',
        entityId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] as string | undefined,
      });

      const authResponse = await buildAuthResponse(user.id);
      return reply.send(authResponse);
    },
  );

  app.post(
    '/refresh',
    {
      config: {
        rateLimit: { max: 20, timeWindow: '1 minute' },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const rawToken = request.cookies.refreshToken;
      if (!rawToken) {
        return reply.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const tokenHash = hashToken(rawToken);

      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          tokenHash,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: {
          session: {
            include: {
              user: {
                select: {
                  id: true,
                  tenantId: true,
                  status: true,
                  tenant: { select: { status: true } },
                },
              },
            },
          },
        },
      });

      if (
        !storedToken ||
        storedToken.session.revokedAt ||
        storedToken.session.expiresAt < new Date()
      ) {
        clearRefreshTokenCookie(reply);
        return reply.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const user = storedToken.session.user;

      // If user or tenant is no longer active, revoke the session and deny refresh.
      // Never create an AuditLog with an empty/invalid tenantId.
      if (!user || user.status !== 'active' || user.tenant.status !== 'active') {
        await revokeSession(storedToken.sessionId);
        clearRefreshTokenCookie(reply);
        return reply.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      // Rotate: revoke old token, issue new one.
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      const newRawToken = generateRefreshTokenValue();
      const newTokenHash = hashToken(newRawToken);

      await prisma.refreshToken.create({
        data: {
          sessionId: storedToken.sessionId,
          userId: storedToken.userId,
          tokenHash: newTokenHash,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
        },
      });

      setRefreshTokenCookie(reply, newRawToken);

      await createAuditLog({
        tenantId: user.tenantId,
        userId: storedToken.userId,
        action: 'user_refreshed' as AuditAction,
        entityType: 'UserSession',
        entityId: storedToken.sessionId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] as string | undefined,
      });

      const authResponse = await buildAuthResponse(storedToken.userId);
      return reply.send(authResponse);
    },
  );

  app.post('/logout', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth(request);
    const rawToken = request.cookies.refreshToken;

    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      });
    }

    clearRefreshTokenCookie(reply);

    await createAuditLog({
      tenantId: auth.tenantId,
      userId: auth.userId,
      action: 'user_logout' as AuditAction,
      entityType: 'User',
      entityId: auth.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] as string | undefined,
    });

    return reply.send({ message: 'Logged out' });
  });

  app.get('/me', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth(request);
    const authResponse = await buildAuthResponse(auth.userId);
    return reply.send(authResponse);
  });
}
