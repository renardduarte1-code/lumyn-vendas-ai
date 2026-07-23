import { apiClient } from '../lib/apiClient';

export async function createAuditLog(input: {
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  return apiClient('/audit-logs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
