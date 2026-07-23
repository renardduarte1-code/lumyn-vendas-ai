import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import { auditLogSchema } from '../../shared/validation/zod';
import { getAuth } from '../../shared/types/auth';
import { createAuditLog } from './service';

export async function auditRoutes(app: FastifyInstance): Promise<void> {
  app.post('/audit-logs', { preHandler: [authenticate] }, async (request, reply) => {
    const auth = getAuth(request);
    const body = auditLogSchema.parse(request.body);

    const log = await createAuditLog({
      tenantId: auth.tenantId,
      userId: auth.userId,
      action: body.action,
      entityType: body.entityType,
      entityId: body.entityId,
      metadata: body.metadata ?? null,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] as string | undefined,
    });

    return reply.status(201).send(log);
  });
}
