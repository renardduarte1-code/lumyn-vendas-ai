// Env vars must be set before any src/ module is imported by tests.
// This file is loaded by vitest before test files.
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/lumyn_prospect_test?schema=public';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || 'test-access-secret-at-least-32-characters-long';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-at-least-32-characters-long';
process.env.COOKIE_SECRET = process.env.COOKIE_SECRET || 'test-cookie-secret-16ch';
process.env.NODE_ENV = 'test';
process.env.PORT = '3099';
process.env.CORS_ORIGIN = 'http://localhost:5173';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./tests/globalSetup.ts'],
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'forks',
  },
});
