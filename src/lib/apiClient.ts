/// <reference types="vite/client" />
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';

export type ApiError = { message: string; code?: string };

interface AuthResponse {
  accessToken: string;
  user: unknown;
  tenant: unknown;
}

// Endpoints that must NOT trigger automatic refresh on 401.
const NO_REFRESH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

// --- Single-flight refresh -------------------------------------------------
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    clearAccessToken();
    return null;
  }

  const data = (await response.json()) as AuthResponse;
  setAccessToken(data.accessToken);
  return data.accessToken;
}

function getRefreshedToken(): Promise<string | null> {
  // Single-flight: if a refresh is already in flight, reuse the same promise.
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// --- Notify authStore on session loss -------------------------------------
// Set by authStore during initialization to avoid circular imports.
let onSessionLost: (() => void) | null = null;

export function setSessionLostHandler(handler: (() => void) | null): void {
  onSessionLost = handler;
}

// --- Core request ----------------------------------------------------------
export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const url = API_URL + endpoint;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && !NO_REFRESH_ENDPOINTS.includes(endpoint)) {
    // Attempt refresh + retry once.
    const newToken = await getRefreshedToken();
    if (newToken) {
      const retryHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
        ...(options.headers as Record<string, string>),
      };

      const retryResponse = await fetch(url, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      });

      if (retryResponse.status === 401) {
        // Retry also failed — session is definitively lost.
        clearAccessToken();
        onSessionLost?.();
        throw new Error('Sessão expirada');
      }

      const retryData = await retryResponse.json().catch(() => ({}));
      if (!retryResponse.ok) {
        const message = (retryData as ApiError).message || 'Erro na API';
        throw new Error(message);
      }
      return retryData as T;
    }

    // Refresh failed — session is lost.
    clearAccessToken();
    onSessionLost?.();
    throw new Error('Sessão expirada');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (data as ApiError).message || 'Erro na API';
    throw new Error(message);
  }

  return data as T;
}
