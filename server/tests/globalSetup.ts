import { execSync } from 'child_process';

const TEST_DB_NAME = 'lumyn_prospect_test';
const TEST_DB_URL = `postgresql://postgres:postgres@localhost:5432/${TEST_DB_NAME}?schema=public`;

/**
 * Global setup: creates the test database (if missing) and applies migrations.
 * Runs once before all test files.
 */
async function setup(): Promise<void> {
  // Create test database — ignore error if it already exists.
  try {
    execSync(
      `docker exec lumyn-prospect-db psql -U postgres -c "CREATE DATABASE ${TEST_DB_NAME}"`,
      { stdio: 'pipe' },
    );
  } catch {
    // Database already exists — that's fine.
  }

  // Apply migrations to the test database.
  execSync('npx prisma migrate deploy --schema=prisma/schema.prisma', {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
  });
}

/**
 * Global teardown: no-op (leave the test database for faster re-runs).
 */
async function teardown(): Promise<void> {}

export { setup, teardown };
