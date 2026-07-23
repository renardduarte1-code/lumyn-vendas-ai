import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../shared/security/jwt';
import type { AuthContext } from '../shared/types/auth';

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);
    (request as unknown as { user: AuthContext }).user = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return reply.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
  }
}
