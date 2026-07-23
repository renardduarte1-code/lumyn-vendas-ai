import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { env } from '../config';

export async function securityPlugins(app: FastifyInstance): Promise<void> {
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(cookie, {
    secret: env.COOKIE_SECRET,
    parseOptions: {
      httpOnly: true,
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
      path: '/auth',
    },
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
}
