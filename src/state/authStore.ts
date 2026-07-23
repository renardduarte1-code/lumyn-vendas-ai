import { create } from 'zustand';
import { apiClient } from '../lib/apiClient';
import type { User, Tenant } from '../types';

interface AuthResponse {
  accessToken: string;
  user: User;
  tenant: Tenant;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tenant: null,
  accessToken: null,
  loading: true,

  signIn: async (email, password) => {
    const data = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user, tenant: data.tenant, accessToken: data.accessToken, loading: false });
  },

  signUp: async (email, password, fullName, companyName) => {
    const data = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, companyName }),
    });
    localStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user, tenant: data.tenant, accessToken: data.accessToken, loading: false });
  },

  signOut: async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem('accessToken');
    set({ user: null, tenant: null, accessToken: null, loading: false });
  },

  initialize: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ loading: false });
      return;
    }

    try {
      const data = await apiClient<AuthResponse>('/auth/me');
      localStorage.setItem('accessToken', data.accessToken);
      set({ user: data.user, tenant: data.tenant, accessToken: data.accessToken, loading: false });
    } catch {
      set({ user: null, tenant: null, accessToken: null, loading: false });
    }
  },
}));
