import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../shared/security/jwt';
import { prisma } from '../shared/prisma';
import type { AuthContext } from '../shared/types/auth';

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
  }

  const token = authHeader.slice(7);

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return reply.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
  }

  // Fetch current user state from DB — do not trust tenantId/role from JWT payload.
  // Ensures suspended/inactive users and tenants are blocked immediately.
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      tenantId: true,
      email: true,
      role: true,
      status: true,
      tenant: { select: { status: true } },
    },
  });

  if (!user || user.status !== 'active' || user.tenant.status !== 'active') {
    return reply.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
  }

  (request as unknown as { user: AuthContext }).user = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  };
}
