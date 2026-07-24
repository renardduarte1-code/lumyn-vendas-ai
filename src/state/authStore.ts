import { create } from 'zustand';
import { apiClient, setSessionLostHandler } from '../lib/apiClient';
import { setAccessToken, clearAccessToken } from '../lib/tokenStore';
import type { User, Tenant } from '../types';

interface AuthResponse {
  accessToken: string;
  user: User;
  tenant: Tenant;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenant: null,
  loading: true,

  signIn: async (email, password) => {
    const data = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.accessToken);
    set({ user: data.user, tenant: data.tenant, loading: false });
  },

  signUp: async (email, password, fullName, companyName) => {
    const data = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, companyName }),
    });
    // Backend returns a session on registration — auto-login.
    setAccessToken(data.accessToken);
    set({ user: data.user, tenant: data.tenant, loading: false });
  },

  signOut: async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore API errors — clear local state regardless.
    }
    clearAccessToken();
    set({ user: null, tenant: null, loading: false });
  },

  initialize: async () => {
    // Register session-lost handler so apiClient can notify us.
    setSessionLostHandler(() => {
      clearAccessToken();
      set({ user: null, tenant: null, loading: false });
    });

    // Try to restore the session via the HttpOnly refresh cookie.
    try {
      const data = await apiClient<AuthResponse>('/auth/refresh', {
        method: 'POST',
      });
      // Refresh succeeded — fetch the full profile.
      setAccessToken(data.accessToken);
      set({ user: data.user, tenant: data.tenant, loading: false });
    } catch {
      // No valid session — stay unauthenticated.
      clearAccessToken();
      set({ user: null, tenant: null, loading: false });
    }
  },
}));
