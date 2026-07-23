import { beforeEach, afterAll } from 'vitest';
import { prisma } from '../src/shared/prisma';

/**
 * Per-test cleanup: truncates all tables (except _prisma_migrations)
 * to ensure each test starts with a clean database.
 */
beforeEach(async () => {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
  `;

  const tableList = tables.map((t) => `"${t.tablename}"`).join(', ');

  if (tableList) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} CASCADE`);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
