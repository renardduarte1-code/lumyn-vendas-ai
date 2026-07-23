import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2),
  companyName: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const companyCreateSchema = z.object({
  name: z.string().min(2),
  legalName: z.string().optional(),
  cnpj: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  industry: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  employeeCountEstimate: z.number().int().optional(),
});

export const leadListCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().optional(),
});

export const leadListAddCompanySchema = z.object({
  companyId: z.string().uuid(),
});

export const agentRunSchema = z.object({
  userPrompt: z.string().min(1),
});

export const auditLogSchema = z.object({
  action: z.string(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});
