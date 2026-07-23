import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authenticate } from '../../middleware/auth';
import { companyCreateSchema } from '../../shared/validation/zod';
import { getAuth } from '../../shared/types/auth';
import { prisma } from '../../shared/prisma';
import { calculateCompanyScore } from '../../shared/scoring';
import { createAuditLog } from '../audit/service';
import { AppError } from '../../shared/errors';
import { AuditAction } from '@prisma/client';

export async function companyRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth(request);
    const { segment, city, limit = '100' } = request.query as Record<string, string | undefined>;

    const take = Math.min(Number(limit) || 100, 500);

    const companies = await prisma.company.findMany({
      where: {
        tenantId: auth.tenantId,
        deletedAt: null,
        ...(segment
          ? { industry: { contains: segment, mode: 'insensitive' } }
          : {}),
        ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      },
      orderBy: { leadScore: 'desc' },
      take,
    });

    return reply.send(companies);
  });

  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth(request);
    const body = companyCreateSchema.parse(request.body);

    const leadScore = calculateCompanyScore({
      industry: body.industry ?? null,
      city: body.city ?? null,
      phone: body.phone ?? null,
      whatsapp: body.whatsapp ?? null,
      website: body.website ?? null,
      instagram: body.instagram ?? null,
      email: body.email ?? null,
      optOut: false,
    });

    const company = await prisma.company.create({
      data: {
        tenantId: auth.tenantId,
        createdById: auth.userId,
        name: body.name,
        legalName: body.legalName,
        cnpj: body.cnpj,
        website: body.website,
        phone: body.phone,
        whatsapp: body.whatsapp,
        email: body.email,
        instagram: body.instagram,
        linkedin: body.linkedin,
        city: body.city,
        state: body.state,
        country: body.country ?? 'Brasil',
        address: body.address,
        industry: body.industry,
        keywords: body.keywords ?? [],
        employeeCountEstimate: body.employeeCountEstimate,
        leadScore,
        source: 'manual',
        dataQualityStatus: 'unverified',
      },
    });

    await createAuditLog({
      tenantId: auth.tenantId,
      userId: auth.userId,
      action: 'company_created' as AuditAction,
      entityType: 'Company',
      entityId: company.id,
      metadata: { name: company.name, industry: company.industry },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] as string | undefined,
    });

    return reply.status(201).send(company);
  });
}
