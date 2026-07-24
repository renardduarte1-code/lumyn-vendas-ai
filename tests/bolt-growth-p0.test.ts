import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { listCompanies, createCompany } from '../src/services/companyService';
import { useAuthStore } from '../src/state/authStore';
import { useNavigationStore } from '../src/state/navigationStore';
import { getAccessToken, setAccessToken } from '../src/lib/tokenStore';
import { MetricCard } from '../src/components/ui/MetricCard';
import { StatusBadge, ScoreBadge } from '../src/components/ui/StatusBadge';
import type { Company } from '../src/types';

const SRC_DIR = path.resolve(__dirname, '../src');

function listSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(full));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

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

function mockFetch(body: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue(mockFetchResponse(body, status));
}

let container: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;

function render(node: React.ReactElement) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root!.render(node));
  return container;
}

function cleanup() {
  if (root) {
    act(() => root!.unmount());
    root = null;
  }
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
    container = null;
  }
}

beforeEach(() => {
  setAccessToken(null);
  global.fetch = vi.fn() as unknown as typeof fetch;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// 1. Autenticação bloqueia usuário não autenticado
// ---------------------------------------------------------------------------

describe('Auth gate', () => {
  it('keeps user unauthenticated when refresh fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.tenant).toBeNull();
    expect(state.loading).toBe(false);
    expect(getAccessToken()).toBeNull();
  });
});

// 2. Sessão é restaurada após reload
// ---------------------------------------------------------------------------

describe('Session restore', () => {
  it('restores user and tenant through POST /auth/refresh', async () => {
    const auth = {
      accessToken: 'restored-token',
      user: { id: 'u1', tenantId: 't1', email: 'restored@test.com', role: 'owner', status: 'active', createdAt: '', updatedAt: '' },
      tenant: { id: 't1', name: 'Restored Co', plan: 'pro', status: 'active', creditsBalance: 500, createdAt: '', updatedAt: '' },
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockFetchResponse(auth));

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe('restored@test.com');
    expect(state.tenant?.name).toBe('Restored Co');
    expect(getAccessToken()).toBe('restored-token');
  });
});

// 3. Navegação funcional não quebra
// ---------------------------------------------------------------------------

describe('Navigation', () => {
  it('allows switching between functional pages', () => {
    const { setPage } = useNavigationStore.getState();
    setPage('companies');
    expect(useNavigationStore.getState().page).toBe('companies');
    setPage('lists');
    expect(useNavigationStore.getState().page).toBe('lists');
  });
});

// 4. Lista de empresas usa API real
// ---------------------------------------------------------------------------

describe('Companies API integration', () => {
  it('fetches from /companies with Authorization header', async () => {
    setAccessToken('token-123');
    mockFetch([{ id: 'c1', name: 'Acme' }]);

    await listCompanies();

    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls as [string, RequestInit][];
    expect(calls[0][0]).toContain('/companies');
    expect(calls[0][1].headers).toMatchObject({ Authorization: 'Bearer token-123' });
  });
});

// 5. Erro da API não injeta dados fictícios
// ---------------------------------------------------------------------------

describe('API error handling', () => {
  it('listCompanies propagates API errors without injecting fallback data', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Server down'));

    await expect(listCompanies()).rejects.toThrow('Server down');
  });
});

// 6. tenantId não é incluído como autoridade no payload
// ---------------------------------------------------------------------------

describe('Tenant authority', () => {
  it('createCompany does not send tenantId in the request body', async () => {
    setAccessToken('token-123');
    mockFetch({ id: 'c1' }, 201);

    await createCompany({
      name: 'Acme',
      tenantId: 'malicious-tenant-id',
    } as Partial<Company>);

    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls as [string, RequestInit][];
    const body = JSON.parse(calls[0][1].body as string);
    expect(body).toHaveProperty('name', 'Acme');
    expect(body).not.toHaveProperty('tenantId');
  });
});

// 7. Componentes importados renderizam sem regressão
// ---------------------------------------------------------------------------

describe('Imported UI components', () => {
  it('renders MetricCard with label, value and icon', () => {
    const node = createElement(MetricCard, {
      label: 'Créditos',
      value: 42,
      icon: createElement('span', null, '★'),
    });
    const el = render(node);
    expect(el.textContent).toContain('Créditos');
    expect(el.textContent).toContain('42');
    expect(el.textContent).toContain('★');
    cleanup();
  });

  it('renders ScoreBadge and StatusBadge', () => {
    const node = createElement('div', null,
      createElement(ScoreBadge, { score: 87 }),
      createElement(StatusBadge, { status: 'verified' }),
    );
    const el = render(node);
    expect(el.textContent).toContain('IA 87');
    expect(el.textContent).toContain('Verificado');
    cleanup();
  });
});

// 8. Nenhum import runtime de mockData
// ---------------------------------------------------------------------------

describe('No runtime mockData', () => {
  it('has no imports from mockData.ts in the active source tree', () => {
    const files = listSourceFiles(SRC_DIR);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('mockData')) {
        throw new Error(`mockData reference found in ${file}`);
      }
    }
    expect(files.length).toBeGreaterThan(0);
  });
});

// 9. Nenhum Supabase no frontend ativo
// ---------------------------------------------------------------------------

describe('No active Supabase usage', () => {
  it('has no Supabase imports or identifiers in the active source tree', () => {
    const files = listSourceFiles(SRC_DIR);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('supabase') || content.includes('@supabase')) {
        throw new Error(`Supabase reference found in ${file}`);
      }
    }
    expect(files.length).toBeGreaterThan(0);
  });
});

// 10. Módulos não implementados não aparecem como funcionais
// ---------------------------------------------------------------------------

describe('Unimplemented modules hidden from navigation', () => {
  it('does not expose SDR, Autopilot, Social Growth or Campaigns in the layout', () => {
    const layout = fs.readFileSync(path.join(SRC_DIR, 'components/Layout.tsx'), 'utf-8');
    const forbidden = ['sdr', 'autopilot', 'social', 'campaigns', 'pipeline', 'reports'];
    for (const term of forbidden) {
      expect(layout.toLowerCase()).not.toContain(term);
    }
  });
});
