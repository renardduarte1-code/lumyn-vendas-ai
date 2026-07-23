import { apiClient } from '../lib/apiClient';
import type { Company } from '../types';

export async function listCompanies(filters?: { segment?: string; city?: string }): Promise<Company[]> {
  const params = new URLSearchParams();
  if (filters?.segment) params.set('segment', filters.segment);
  if (filters?.city) params.set('city', filters.city);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiClient<Company[]>(`/companies${query}`);
}

export async function createCompany(input: Partial<Company>): Promise<Company> {
  return apiClient<Company>('/companies', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
