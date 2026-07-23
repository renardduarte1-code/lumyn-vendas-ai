import type { CreditEstimate } from '../types';

const BASE_COSTS: Record<string, number> = {
  search_company_basic: 1,
  enrich_phone: 2,
  enrich_email: 2,
  verify_email: 1,
  generate_copy: 1,
  export_csv: 0,
};

export function estimateCredits(action: string, quantity = 1): CreditEstimate {
  const unitCost = BASE_COSTS[action] ?? 1;
  const estimatedCredits = Math.max(0, unitCost * Math.max(1, quantity));

  return {
    estimatedCredits,
    requiresConfirmation: estimatedCredits > 0,
    explanation: `Ação "${action}" estimada em ${estimatedCredits} crédito(s).`,
  };
}
