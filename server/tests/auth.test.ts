import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { prisma } from '../src/shared/prisma';
import { hashToken } from '../src/shared/security/tokens';

const TEST_JWT_ACCESS_SECRET = 'test-access-secret-at-least-32-characters-long';

let app: FastifyInstance;

beforeEach(async () => {
  app = buildApp();
  await app.ready();
});

afterEach(async () => {
  await app.close();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRefreshTokenFromResponse(response: {
  headers: Record<string, string | string[] | undefined>;
}): string | undefined {
  const setCookie = response.headers['set-cookie'];
  if (!setCookie) return undefined;
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const cookie of cookies) {
    const match = /refreshToken=([^;]+)/.exec(cookie);
    if (match) return match[1];
  }
  return undefined;
}

async function registerUser(
  email = 'test@example.com',
  password = 'password123',
  fullName = 'Test User',
  companyName = 'Test Co',
) {
  return app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email, password, fullName, companyName },
  });
}

async function loginUser(email = 'test@example.com', password = 'password123') {
  return app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email, password },
  });
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

describe('POST /auth/register', () => {
  it('creates a tenant and an owner user', async () => {
    const response = await registerUser();
    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.accessToken).toBeDefined();
    expect(body.user).toBeDefined();
    expect(body.tenant).toBeDefined();
    expect(body.user.role).toBe('owner');
    expect(body.user.status).toBe('active');
    expect(body.tenant.name).toBe('Test Co');

    // Verify in database
    const dbUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: { tenant: true },
    });
    expect(dbUser).toBeTruthy();
    expect(dbUser!.role).toBe('owner');
    expect(dbUser!.status).toBe('active');
    expect(dbUser!.passwordHash).not.toBeNull();
    expect(dbUser!.tenant.name).toBe('Test Co');
  });
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await registerUser();
  });

  it('works for an active user', async () => {
    const response = await loginUser();
    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.accessToken).toBeDefined();
    expect(body.user.email).toBe('test@example.com');

    // lastLoginAt should have been updated
    const dbUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    expect(dbUser!.lastLoginAt).not.toBeNull();
  });

  it('returns 401 for a wrong password', async () => {
    const response = await loginUser('test@example.com', 'wrongpassword');
    expect(response.statusCode).toBe(401);
    expect(response.json().code).toBe('INVALID_CREDENTIALS');
  });

  it('blocks a suspended user', async () => {
    await prisma.user.update({
      where: { email: 'test@example.com' },
      data: { status: 'suspended' },
    });

    const response = await loginUser();
    expect(response.statusCode).toBe(401);
    expect(response.json().code).toBe('INVALID_CREDENTIALS');

    // lastLoginAt should NOT have been updated
    const dbUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    expect(dbUser!.lastLoginAt).toBeNull();
  });

  it('blocks an inactive user', async () => {
    await prisma.user.update({
      where: { email: 'test@example.com' },
      data: { status: 'inactive' },
    });

    const response = await loginUser();
    expect(response.statusCode).toBe(401);
    expect(response.json().code).toBe('INVALID_CREDENTIALS');
  });
});

// ---------------------------------------------------------------------------
// Refresh
// ---------------------------------------------------------------------------

describe('POST /auth/refresh', () => {
  it('rotates the refresh token on a valid refresh', async () => {
    const regResponse = await registerUser();
    const oldRefreshToken = getRefreshTokenFromResponse(regResponse);
    expect(oldRefreshToken).toBeDefined();

    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      cookies: { refreshToken: oldRefreshToken! },
    });

    expect(refreshResponse.statusCode).toBe(200);
    const body = refreshResponse.json();
    expect(body.accessToken).toBeDefined();

    const newRefreshToken = getRefreshTokenFromResponse(refreshResponse);
    expect(newRefreshToken).toBeDefined();
    expect(newRefreshToken).not.toBe(oldRefreshToken);
  });

  it('prevents reuse of an old refresh token', async () => {
    const regResponse = await registerUser();
    const oldRefreshToken = getRefreshTokenFromResponse(regResponse);

    // First refresh — succeeds and rotates
    const firstRefresh = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      cookies: { refreshToken: oldRefreshToken! },
    });
    expect(firstRefresh.statusCode).toBe(200);

    // Reuse old token — must fail
    const reuseResponse = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      cookies: { refreshToken: oldRefreshToken! },
    });
    expect(reuseResponse.statusCode).toBe(401);
  });

  it('rejects refresh for a suspended user and revokes the session', async () => {
    const regResponse = await registerUser();
    const refreshToken = getRefreshTokenFromResponse(regResponse);
    const regBody = regResponse.json();

    // Suspend the user
    await prisma.user.update({
      where: { id: regBody.user.id },
      data: { status: 'suspended' },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      cookies: { refreshToken: refreshToken! },
    });

    expect(response.statusCode).toBe(401);

    // Session should have been revoked
    const sessions = await prisma.userSession.findMany({
      where: { userId: regBody.user.id },
    });
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions.every((s) => s.revokedAt !== null)).toBe(true);
  });

  it('does not create an audit log with empty tenantId when user is missing', async () => {
    const regResponse = await registerUser();
    const refreshToken = getRefreshTokenFromResponse(regResponse);
    const regBody = regResponse.json();
    const tenantId = regBody.tenant.id;

    // Audit log from registration should exist
    const beforeCount = await prisma.auditLog.count({ where: { tenantId } });
    expect(beforeCount).toBeGreaterThan(0);

    // Delete the user — cascade removes sessions and refresh tokens
    await prisma.user.delete({ where: { id: regBody.user.id } });

    // Attempt refresh — token record no longer exists
    const response = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      cookies: { refreshToken: refreshToken! },
    });

    expect(response.statusCode).toBe(401);

    // No new audit log should have been created
    const afterCount = await prisma.auditLog.count({ where: { tenantId } });
    expect(afterCount).toBe(beforeCount);

    // Verify no audit log anywhere has an empty/invalid tenantId
    const allLogs = await prisma.auditLog.findMany();
    for (const log of allLogs) {
      expect(log.tenantId).toBeTruthy();
      expect(log.tenantId).not.toBe('');
    }
  });
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

describe('POST /auth/logout', () => {
  it('revokes the session and refresh token on logout', async () => {
    const regResponse = await registerUser();
    const regBody = regResponse.json();
    const accessToken = regBody.accessToken;
    const refreshToken = getRefreshTokenFromResponse(regResponse);

    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: { authorization: `Bearer ${accessToken}` },
      cookies: { refreshToken: refreshToken! },
    });

    expect(logoutResponse.statusCode).toBe(200);

    // Refresh token should be revoked
    const tokenHash = hashToken(refreshToken!);
    const token = await prisma.refreshToken.findFirst({ where: { tokenHash } });
    expect(token).toBeTruthy();
    expect(token!.revokedAt).not.toBeNull();

    // Old refresh token should no longer work
    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      cookies: { refreshToken: refreshToken! },
    });
    expect(refreshResponse.statusCode).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// /auth/me
// ---------------------------------------------------------------------------

describe('GET /auth/me', () => {
  it('requires an access token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
    });
    expect(response.statusCode).toBe(401);
  });

  it('does not accept tenantId from the JWT payload', async () => {
    const regResponse = await registerUser();
    const regBody = regResponse.json();
    const userId = regBody.user.id;
    const realTenantId = regBody.tenant.id;

    // Create a second tenant
    const otherTenant = await prisma.tenant.create({
      data: { name: 'Other Co', plan: 'free', status: 'active' },
    });

    // Sign a JWT with the user's sub but a tampered tenantId
    const tamperedToken = jwt.sign(
      { sub: userId, tenantId: otherTenant.id, email: 'test@example.com', role: 'owner' },
      TEST_JWT_ACCESS_SECRET,
      { expiresIn: '15m', algorithm: 'HS256' },
    );

    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${tamperedToken}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    // tenantId must come from the DB, not from the JWT payload
    expect(body.tenant.id).toBe(realTenantId);
    expect(body.tenant.id).not.toBe(otherTenant.id);
  });
});

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

describe('Rate limiting on POST /auth/login', () => {
  it('returns 429 after exceeding the login rate limit', async () => {
    // Make 5 failed login attempts (limit is 5 per minute)
    for (let i = 0; i < 5; i++) {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'nobody@example.com', password: 'wrong' },
      });
      expect(response.statusCode).toBe(401);
    }

    // 6th attempt should be rate-limited
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'nobody@example.com', password: 'wrong' },
    });
    expect(response.statusCode).toBe(429);
  });
});
