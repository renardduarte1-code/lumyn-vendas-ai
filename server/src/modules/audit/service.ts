import { prisma } from '../../shared/prisma';
import { AuditAction, Prisma } from '@prisma/client';

export type AuditLogInput = {
  tenantId: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
};

export async function createAuditLog(input: AuditLogInput) {
  return prisma.auditLog.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      action: input.action as AuditAction,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: (input.metadata as unknown as Prisma.InputJsonValue) ?? undefined,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}
