import type { Company } from '../types';

const CSV_HEADERS = [
  'nome_empresa',
  'cidade',
  'estado',
  'site',
  'telefone',
  'whatsapp',
  'instagram',
  'email',
  'segmento',
  'score',
  'fonte',
  'data_coleta',
];

export function companiesToCsv(companies: Company[]): string {
  const rows = companies
    .filter((company) => !company.optOut)
    .map((company) => [
      company.name,
      company.city ?? '',
      company.state ?? '',
      company.website ?? '',
      company.phone ?? '',
      company.whatsapp ?? '',
      company.instagram ?? '',
      company.email ?? '',
      company.industry ?? '',
      String(company.leadScore ?? 0),
      company.source ?? '',
      company.createdAt ?? '',
    ]);

  return [CSV_HEADERS, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}
