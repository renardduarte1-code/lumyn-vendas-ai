import { vi, beforeEach } from 'vitest';
import { clearAccessToken } from '../src/lib/tokenStore';

// Reset in-memory token and all mocks before each test.
beforeEach(() => {
  clearAccessToken();
  global.fetch = vi.fn() as unknown as typeof fetch;
  vi.restoreAllMocks();
});
