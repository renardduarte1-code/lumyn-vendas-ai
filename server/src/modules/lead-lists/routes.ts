import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authenticate } from '../../middleware/auth';
import { leadListCreateSchema, leadListAddCompanySchema } from '../../shared/validation/zod';
import { getAuth } from '../../shared/types/auth';
import { prisma } from '../../shared/prisma';
import { createAuditLog } from '../audit/service';
import { AppError } from '../../shared/errors';
import { AuditAction } from '@prisma/client';

export async function leadListRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth(request);

    const lists = await prisma.leadList.findMany({
      where: { tenantId: auth.tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send(lists);
  });

  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth(request);
    const body = leadListCreateSchema.parse(request.body);

    const list = await prisma.leadList.create({
      data: {
        tenantId: auth.tenantId,
        createdById: auth.userId,
        name: body.name,
        description: body.description,
        type: body.type ?? 'manual',
      },
    });

    await createAuditLog({
      tenantId: auth.tenantId,
      userId: auth.userId,
      action: 'lead_list_created' as AuditAction,
      entityType: 'LeadList',
      entityId: list.id,
      metadata: { name: list.name },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] as string | undefined,
    });

    return reply.status(201).send(list);
  });

  app.post('/:id/companies', async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth(request);
    const { id } = request.params as { id: string };
    const body = leadListAddCompanySchema.parse(request.body);

    const list = await prisma.leadList.findFirst({
      where: { id, tenantId: auth.tenantId, deletedAt: null },
    });
    if (!list) {
      throw new AppError('Lead list not found', 404, 'NOT_FOUND');
    }

    const company = await prisma.company.findFirst({
      where: { id: body.companyId, tenantId: auth.tenantId, deletedAt: null },
    });
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }

    const item = await prisma.leadListItem.create({
      data: {
        tenantId: auth.tenantId,
        leadListId: list.id,
        companyId: company.id,
        status: 'saved',
      },
    });

    await createAuditLog({
      tenantId: auth.tenantId,
      userId: auth.userId,
      action: 'lead_list_item_added' as AuditAction,
      entityType: 'LeadListItem',
      entityId: item.id,
      metadata: { leadListId: list.id, companyId: company.id },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] as string | undefined,
    });

    return reply.status(201).send(item);
  });
}
