import { apiClient } from '../lib/apiClient';
import type { LeadList, LeadListItem } from '../types';

export async function listLeadLists(): Promise<LeadList[]> {
  return apiClient<LeadList[]>('/lead-lists');
}

export async function createLeadList(input: { name: string; description?: string; type?: string }): Promise<LeadList> {
  return apiClient<LeadList>('/lead-lists', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function addCompanyToList(listId: string, companyId: string): Promise<LeadListItem> {
  return apiClient<LeadListItem>(`/lead-lists/${listId}/companies`, {
    method: 'POST',
    body: JSON.stringify({ companyId }),
  });
}
