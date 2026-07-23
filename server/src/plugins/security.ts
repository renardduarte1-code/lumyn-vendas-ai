import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { env } from '../config';

async function registerSecurityPlugins(app: FastifyInstance): Promise<void> {
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

// Wrap with fastify-plugin so decorators (reply.setCookie, etc.)
// propagate to the parent scope where routes are registered.
export const securityPlugins = fp(registerSecurityPlugins, { fastify: '4.x' });
