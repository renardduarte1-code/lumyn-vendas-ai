import { PrismaClient } from '@prisma/client';

const logOptions = ['query', 'error', 'warn'] as Array<'query' | 'error' | 'warn'>;

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? logOptions : ['error'],
});
