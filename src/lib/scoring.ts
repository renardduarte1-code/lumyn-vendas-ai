import type { Company } from '../types';

export function calculateCompanyScore(input: Partial<Company>): number {
  let score = 0;

  if (input.industry) score += 25;
  if (input.city) score += 15;
  if (input.phone) score += 10;
  if (input.whatsapp) score += 20;
  if (input.website) score += 10;
  if (input.instagram) score += 10;
  if (input.email) score += 5;

  const missingCriticalData = !input.phone && !input.whatsapp && !input.email;
  if (missingCriticalData) score -= 15;

  if (input.optOut) score = 0;

  return Math.max(0, Math.min(100, score));
}

export function explainCompanyScore(company: Partial<Company>): string[] {
  const reasons: string[] = [];

  if (company.industry) reasons.push('Segmento identificado.');
  if (company.city) reasons.push('Localização identificada.');
  if (company.whatsapp) reasons.push('Possui WhatsApp ou provável WhatsApp.');
  if (company.phone) reasons.push('Possui telefone.');
  if (company.website) reasons.push('Possui site.');
  if (company.instagram) reasons.push('Possui Instagram.');
  if (!company.phone && !company.whatsapp && !company.email) reasons.push('Dados de contato incompletos.');
  if (company.optOut) reasons.push('Lead marcado como opt-out.');

  return reasons;
}
