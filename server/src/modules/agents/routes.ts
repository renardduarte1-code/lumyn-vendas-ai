import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authenticate } from '../../middleware/auth';
import { agentRunSchema } from '../../shared/validation/zod';
import { getAuth } from '../../shared/types/auth';
import { prisma } from '../../shared/prisma';
import { parseLeadSearchIntent, estimateCredits } from '../../shared/ai';
import { createAuditLog } from '../audit/service';
import { AuditAction, Prisma } from '@prisma/client';

export async function agentRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth(request);
    const body = agentRunSchema.parse(request.body);

    const parsed = parseLeadSearchIntent(body.userPrompt);
    const creditEstimate = estimateCredits('search_company_basic', parsed.quantity ?? 20);

    const run = await prisma.aiAgentRun.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        userPrompt: body.userPrompt,
        interpretedIntent: parsed.intent,
        extractedFilters: parsed as unknown as Prisma.InputJsonValue,
        actionsPlanned: {
          action: parsed.intent,
          requiresConfirmation: creditEstimate.requiresConfirmation,
        },
        creditsEstimated: creditEstimate.estimatedCredits,
        status: 'planned',
      },
    });

    let response = 'Não consegui identificar uma ação operacional segura. Tente: "Encontre 20 clínicas de estética em Brasília com WhatsApp".';
    if (parsed.intent === 'search_companies') {
      response = 'Entendi. Vou buscar ' + (parsed.quantity ?? 20) + ' lead(s) do segmento ' + (parsed.segment ?? 'não especificado') + (parsed.city ? ' em ' + parsed.city : '') + '. Custo estimado: ' + creditEstimate.estimatedCredits + ' crédito(s).';
    }

    await createAuditLog({
      tenantId: auth.tenantId,
      userId: auth.userId,
      action: 'agent_run_created' as AuditAction,
      entityType: 'AiAgentRun',
      entityId: run.id,
      metadata: { intent: parsed.intent, creditsEstimated: run.creditsEstimated },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] as string | undefined,
    });

    return reply.status(201).send({
      id: run.id,
      parsed,
      estimatedCredits: creditEstimate.estimatedCredits,
      requiresConfirmation: creditEstimate.requiresConfirmation,
      response,
    });
  });
}
