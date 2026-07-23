import { apiClient } from '../lib/apiClient';
import type { AgentPlan } from '../types';

export async function planAgentAction(userPrompt: string): Promise<AgentPlan> {
  return apiClient<AgentPlan>('/agent-runs', {
    method: 'POST',
    body: JSON.stringify({ userPrompt }),
  });
}
