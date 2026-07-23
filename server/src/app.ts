import fastify from 'fastify';
import { env } from './config';
import { securityPlugins } from './plugins/security';
import { errorHandler } from './shared/errors';
import { healthRoutes } from './modules/health/routes';
import { authRoutes } from './modules/auth/routes';
import { companyRoutes } from './modules/companies/routes';
import { leadListRoutes } from './modules/lead-lists/routes';
import { agentRoutes } from './modules/agents/routes';
import { auditRoutes } from './modules/audit/routes';

export function buildApp() {
  const app = fastify({
    logger: env.NODE_ENV === 'development',
    trustProxy: true,
  });

  app.register(securityPlugins);
  app.setErrorHandler(errorHandler);

  app.register(healthRoutes);
  app.register(authRoutes, { prefix: '/auth' });
  app.register(companyRoutes, { prefix: '/companies' });
  app.register(leadListRoutes, { prefix: '/lead-lists' });
  app.register(agentRoutes, { prefix: '/agent-runs' });
  app.register(auditRoutes);

  return app;
}
