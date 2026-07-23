import dotenv from 'dotenv';
dotenv.config();

import { buildApp } from './app';
import { env } from './config';
import { prisma } from './shared/prisma';

const app = buildApp();

async function start() {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info('Lumyn Prospect AI server listening on port ' + env.PORT);
  } catch (err) {
    app.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

start();
