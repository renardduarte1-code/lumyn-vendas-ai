import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAccessToken, setAccessToken, clearAccessToken } from '../src/lib/tokenStore';
import { apiClient, setSessionLostHandler } from '../src/lib/apiClient';
import { useAuthStore } from '../src/state/authStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

function mockFetch401(): Response {
  return mockFetchResponse({ message: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
}

const AUTH_RESPONSE = {
  accessToken: 'new-access-token',
  user: { id: 'u1', tenantId: 't1', email: 'test@test.com', role: 'owner', status: 'active', createdAt: '', updatedAt: '' },
  tenant: { id: 't1', name: 'Test Co', plan: 'free', status: 'active', creditsBalance: 100, createdAt: '', updatedAt: '' },
};

/**
 * Creates a fetch mock that routes based on URL and call count per URL.
 * This avoids the ordering problem of mockResolvedValueOnce.
 */
function createRouteMock(routes: Record<string, Response[]>): ReturnType<typeof vi.fn> {
  const callCounts: Record<string, number> = {};
  return vi.fn(async (url: string) => {
    const routeKey = Object.keys(routes).find((key) => url.includes(key)) || '__default';
    const count = callCounts[routeKey] || 0;
    callCounts[routeKey] = count + 1;
    const responses = routes[routeKey] || routes['__default'];
    const response = responses[Math.min(count, responses.length - 1)];
    return response;
  }) as ReturnType<typeof vi.fn>;
}

// ---------------------------------------------------------------------------
// 1. Login keeps token only in memory
// ---------------------------------------------------------------------------

describe('Login — token in memory only', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it('stores access token in memory, not localStorage', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockFetchResponse(AUTH_RESPONSE));

    await useAuthStore.getState().signIn('test@test.com', 'password123');

    expect(getAccessToken()).toBe('new-access-token');
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(localStorage.getItem).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 2. No accessToken written to localStorage
// ---------------------------------------------------------------------------

describe('No localStorage usage for auth', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it('apiClient never reads from localStorage', async () => {
    setAccessToken('some-token');
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockFetchResponse({ ok: true }));

    await apiClient('/companies');

    expect(localStorage.getItem).not.toHaveBeenCalled();
  });

  it('signOut never writes to localStorage', async () => {
    setAccessToken('some-token');
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockFetchResponse({ message: 'Logged out' }));

    await useAuthStore.getState().signOut();

    expect(localStorage.removeItem).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3. initialize restores session via /auth/refresh
// ---------------------------------------------------------------------------

describe('initialize — session restore', () => {
  it('restores session using POST /auth/refresh', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockFetchResponse(AUTH_RESPONSE));

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.user).not.toBeNull();
    expect(state.user!.email).toBe('test@test.com');
    expect(state.tenant!.name).toBe('Test Co');
    expect(getAccessToken()).toBe('new-access-token');
    expect(state.loading).toBe(false);
  });

  it('stays unauthenticated when refresh fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockFetch401());

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.tenant).toBeNull();
    expect(getAccessToken()).toBeNull();
    expect(state.loading).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. 401 triggers refresh and retries the request once
// ---------------------------------------------------------------------------

describe('401 auto-refresh', () => {
  it('refreshes and retries on 401 for authenticated requests', async () => {
    setAccessToken('expired-token');

    const mock = createRouteMock({
      '/companies': [mockFetch401(), mockFetchResponse({ data: 'success' })],
      '/auth/refresh': [mockFetchResponse(AUTH_RESPONSE)],
    });
    global.fetch = mock as unknown as typeof fetch;

    const result = await apiClient('/companies');

    expect(result).toEqual({ data: 'success' });
    expect(getAccessToken()).toBe('new-access-token');
    expect(mock).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// 5. Two simultaneous 401s cause only one refresh
// ---------------------------------------------------------------------------

describe('Single-flight refresh', () => {
  it('two concurrent 401 requests share one refresh call', async () => {
    setAccessToken('expired-token');

    let refreshResolve!: (v: Response) => void;
    const refreshResponse = new Promise<Response>((resolve) => {
      refreshResolve = resolve;
    });

    // Track call counts per URL so first call returns 401, second returns success.
    const callCounts: Record<string, number> = {};

    const mock = vi.fn(async (url: string) => {
      if (url.includes('/auth/refresh')) {
        return refreshResponse;
      }
      const count = callCounts[url] || 0;
      callCounts[url] = count + 1;
      // First call: 401. Second call (retry): success.
      if (count === 0) {
        return mockFetch401();
      }
      return mockFetchResponse({ data: 'success' });
    });

    global.fetch = mock as unknown as typeof fetch;

    // Start both requests simultaneously
    const p1 = apiClient('/companies');
    const p2 = apiClient('/contacts');

    // Wait a tick for both to hit 401 and queue on the same refresh promise
    await new Promise((r) => setTimeout(r, 50));

    // Resolve the single refresh
    refreshResolve(mockFetchResponse(AUTH_RESPONSE));

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toEqual({ data: 'success' });
    expect(r2).toEqual({ data: 'success' });

    // Count fetch calls: 2 initial 401s + 1 refresh + 2 retries = 5
    expect(mock).toHaveBeenCalledTimes(5);

    // Verify only one refresh call was made
    const refreshCalls = mock.mock.calls.filter((c) => c[0].includes('/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// 6. Failed refresh clears the session
// ---------------------------------------------------------------------------

describe('Refresh failure', () => {
  it('clears token and triggers session-lost handler', async () => {
    setAccessToken('expired-token');
    let sessionLostCalled = false;
    setSessionLostHandler(() => {
      sessionLostCalled = true;
    });

    const mock = createRouteMock({
      '/companies': [mockFetch401()],
      '/auth/refresh': [mockFetch401()],
    });
    global.fetch = mock as unknown as typeof fetch;

    await expect(apiClient('/companies')).rejects.toThrow('Sessão expirada');

    expect(getAccessToken()).toBeNull();
    expect(sessionLostCalled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. /auth/login 401 does not trigger refresh
// ---------------------------------------------------------------------------

describe('No refresh for auth endpoints', () => {
  it('/auth/login 401 does not trigger refresh', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockFetch401());

    await expect(
      apiClient('/auth/login', { method: 'POST', body: '{}' }),
    ).rejects.toThrow();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  // 8. /auth/register 401 does not trigger refresh
  it('/auth/register 401 does not trigger refresh', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockFetch401());

    await expect(
      apiClient('/auth/register', { method: 'POST', body: '{}' }),
    ).rejects.toThrow();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  // 9. /auth/refresh 401 does not enter a loop
  it('/auth/refresh 401 does not enter a loop', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockFetch401());

    await expect(
      apiClient('/auth/refresh', { method: 'POST' }),
    ).rejects.toThrow();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// 10. Logout clears state even if API fails
// ---------------------------------------------------------------------------

describe('Logout resilience', () => {
  it('clears state even when the API call fails', async () => {
    setAccessToken('some-token');
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    await useAuthStore.getState().signOut();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.tenant).toBeNull();
    expect(getAccessToken()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 11. Registration follows the real contract (auto-login, no contradictory message)
// ---------------------------------------------------------------------------

describe('Registration contract', () => {
  it('auto-logs in after registration (backend returns session)', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockFetchResponse(AUTH_RESPONSE, 201));

    await useAuthStore.getState().signUp('test@test.com', 'password123', 'Test User', 'Test Co');

    const state = useAuthStore.getState();
    expect(state.user).not.toBeNull();
    expect(state.user!.email).toBe('test@test.com');
    expect(getAccessToken()).toBe('new-access-token');
  });
});
