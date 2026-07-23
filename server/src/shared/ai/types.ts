export type ParsedLeadIntent = {
  intent: 'search_companies' | 'create_list' | 'export_list' | 'generate_copy' | 'unknown';
  segment?: string;
  city?: string;
  state?: string;
  country?: string;
  quantity?: number;
  requiredFields: string[];
  optionalFields: string[];
  confidence: number;
};

export type CreditEstimate = {
  estimatedCredits: number;
  requiresConfirmation: boolean;
  explanation: string;
};
