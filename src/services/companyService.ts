import { apiClient } from '../lib/apiClient';
import type { Company } from '../types';

export async function listCompanies(filters?: { segment?: string; city?: string }): Promise<Company[]> {
  const params = new URLSearchParams();
  if (filters?.segment) params.set('segment', filters.segment);
  if (filters?.city) params.set('city', filters.city);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiClient<Company[]>(`/companies${query}`);
}

// O backend deriva tenantId e userId do token/jwt validado no banco;
// nunca aceitamos esses valores do payload enviado pelo frontend.
export async function createCompany(input: Partial<Company>): Promise<Company> {
  const { tenantId: _, id: __, ...payload } = input;
  return apiClient<Company>('/companies', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
