import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';

let app: FastifyInstance;

beforeEach(async () => {
  app = buildApp();
  await app.ready();
});

afterEach(async () => {
  await app.close();
});

async function registerUser(
  email: string,
  password: string,
  fullName: string,
  companyName: string,
) {
  return app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email, password, fullName, companyName },
  });
}

async function createCompany(accessToken: string, name: string) {
  return app.inject({
    method: 'POST',
    url: '/companies',
    headers: { authorization: `Bearer ${accessToken}` },
    payload: { name, industry: 'Tecnologia' },
  });
}

async function listCompanies(accessToken: string) {
  return app.inject({
    method: 'GET',
    url: '/companies',
    headers: { authorization: `Bearer ${accessToken}` },
  });
}

describe('Multi-tenant company isolation', () => {
  it('tenant A cannot see companies created by tenant B', async () => {
    const suffix = String(Date.now());

    // Tenant A
    const aRegister = await registerUser(
      `a-${suffix}@test.com`,
      'password123',
      'User A',
      `Tenant A ${suffix}`,
    );
    expect(aRegister.statusCode).toBe(201);
    const aBody = aRegister.json();
    expect(aBody.accessToken).toBeDefined();
    const aToken = aBody.accessToken as string;

    // Tenant B
    const bRegister = await registerUser(
      `b-${suffix}@test.com`,
      'password123',
      'User B',
      `Tenant B ${suffix}`,
    );
    expect(bRegister.statusCode).toBe(201);
    const bBody = bRegister.json();
    const bToken = bBody.accessToken as string;

    // A creates a company
    const created = await createCompany(aToken, 'Acme A Corp');
    expect(created.statusCode).toBe(201);
    const createdBody = created.json();
    expect(createdBody.tenantId).toBe(aBody.tenant.id);

    // B lists companies
    const bList = await listCompanies(bToken);
    expect(bList.statusCode).toBe(200);
    const bCompanies = bList.json() as Array<{ id: string; name: string; tenantId: string }>;

    // B must not see A's company
    expect(bCompanies.some((c) => c.id === createdBody.id)).toBe(false);
    expect(bCompanies.every((c) => c.tenantId === bBody.tenant.id)).toBe(true);

    // A still sees own company
    const aList = await listCompanies(aToken);
    const aCompanies = aList.json() as Array<{ id: string; name: string; tenantId: string }>;
    expect(aCompanies.some((c) => c.id === createdBody.id)).toBe(true);
  });
});
