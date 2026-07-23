export type UserRole = 'owner' | 'admin' | 'user';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface Tenant {
  id: string;
  name: string;
  document?: string | null;
  plan: string;
  status: string;
  creditsBalance: number;
  maxUsers?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  fullName?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  legalName?: string | null;
  cnpj?: string | null;
  website?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  address?: string | null;
  industry?: string | null;
  keywords?: string[];
  employeeCountEstimate?: number | null;
  leadScore: number;
  optOut: boolean;
  source: string;
  dataQualityStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadList {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadListItem {
  id: string;
  tenantId: string;
  leadListId: string;
  companyId?: string | null;
  contactId?: string | null;
  status: string;
  createdAt: string;
}

export interface ParsedLeadIntent {
  intent: 'search_companies' | 'create_list' | 'export_list' | 'generate_copy' | 'unknown';
  segment?: string;
  city?: string;
  state?: string;
  country?: string;
  quantity?: number;
  requiredFields: string[];
  optionalFields: string[];
  confidence: number;
}

export interface CreditEstimate {
  estimatedCredits: number;
  requiresConfirmation: boolean;
  explanation: string;
}

export interface AgentPlan {
  id: string;
  parsed: ParsedLeadIntent;
  estimatedCredits: number;
  requiresConfirmation: boolean;
  response: string;
}
