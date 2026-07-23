import type { FastifyRequest } from 'fastify';
import { AppError } from '../errors';

export type AuthContext = {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
};

export function getAuth(request: FastifyRequest): AuthContext {
  const user = (request as unknown as { user?: AuthContext }).user;
  if (!user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }
  return user;
}
