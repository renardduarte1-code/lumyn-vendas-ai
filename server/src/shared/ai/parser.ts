import type { ParsedLeadIntent } from './types';

const BRAZIL_STATE_BY_CITY: Record<string, string> = {
  brasília: 'DF',
  brasilia: 'DF',
  goiânia: 'GO',
  goiania: 'GO',
  'são paulo': 'SP',
  'sao paulo': 'SP',
  'rio de janeiro': 'RJ',
  'belo horizonte': 'MG',
  curitiba: 'PR',
};

const DEFAULT_OPTIONAL_FIELDS = ['site', 'instagram', 'email'];

export function parseLeadSearchIntent(prompt: string): ParsedLeadIntent {
  const normalized = prompt.trim().toLowerCase();
  const quantity = extractQuantity(normalized) ?? 20;
  const city = extractCity(normalized);
  const requiredFields = extractRequiredFields(normalized);
  const segment = extractSegment(normalized);

  const isSearch = /(encontre|gere|busque|procure|captur|listar|lista)/i.test(normalized);

  return {
    intent: isSearch ? 'search_companies' : 'unknown',
    segment,
    city,
    state: city ? BRAZIL_STATE_BY_CITY[city.toLowerCase()] : undefined,
    country: 'Brasil',
    quantity,
    requiredFields,
    optionalFields: DEFAULT_OPTIONAL_FIELDS.filter((field) => !requiredFields.includes(field)),
    confidence: isSearch ? 0.74 : 0.25,
  };
}

function extractQuantity(text: string): number | undefined {
  const match = text.match(/\b(\d{1,4})\b/);
  if (!match) return undefined;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function extractCity(text: string): string | undefined {
  const cities = Object.keys(BRAZIL_STATE_BY_CITY);
  return cities.find((city) => text.includes(city));
}

function extractRequiredFields(text: string): string[] {
  const fields: string[] = [];
  if (text.includes('whatsapp')) fields.push('whatsapp');
  if (text.includes('telefone')) fields.push('phone');
  if (text.includes('site')) fields.push('website');
  if (text.includes('instagram')) fields.push('instagram');
  if (text.includes('email') || text.includes('e-mail')) fields.push('email');
  return fields;
}

function extractSegment(text: string): string | undefined {
  const knownSegments = [
    'clínicas de estética',
    'clinicas de estetica',
    'clínica de estética',
    'clinica de estetica',
    'harmonização facial',
    'harmonizacao facial',
    'dermatologia',
    'agências de marketing',
    'agencias de marketing',
  ];

  const segment = knownSegments.find((candidate) => text.includes(candidate));
  if (!segment) return undefined;

  if (segment.includes('estetica') || segment.includes('estética')) return 'Clínicas de estética';
  if (segment.includes('harmon')) return 'Harmonização facial';
  if (segment.includes('dermatologia')) return 'Dermatologia';
  if (segment.includes('marketing')) return 'Agências de marketing';

  return segment;
}
