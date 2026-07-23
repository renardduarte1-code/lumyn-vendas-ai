import { apiClient } from '../lib/apiClient';
import type { User, Tenant } from '../types';

interface MeResponse {
  accessToken: string;
  user: User;
  tenant: Tenant;
}

export async function getMyProfile(): Promise<{ user: User; tenant: Tenant }> {
  const data = await apiClient<MeResponse>('/auth/me');
  localStorage.setItem('accessToken', data.accessToken);
  return { user: data.user, tenant: data.tenant };
}
