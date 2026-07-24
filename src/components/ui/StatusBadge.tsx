/**
 * Badges de status adaptados da referência Bolt Growth OS.
 * A configuração cobre somente estados reais do backend atual:
 * - dataQualityStatus da Company: unverified | verified | invalid
 * - status de Tenant/User: active | inactive | suspended | pending
 * - source da Company: manual
 */

const statusConfig: Record<string, { label: string; color: string }> = {
  unverified: { label: 'Não verificado', color: '#f59e0b' },
  verified: { label: 'Verificado', color: '#34d399' },
  invalid: { label: 'Inválido', color: '#f87171' },
  active: { label: 'Ativo', color: '#34d399' },
  inactive: { label: 'Inativo', color: '#64748b' },
  suspended: { label: 'Suspenso', color: '#f87171' },
  pending: { label: 'Pendente', color: '#f59e0b' },
  manual: { label: 'Manual', color: '#a89bfd' },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, color: '#64748b' };
  return (
    <span
      className='badge'
      style={{ color: config.color, background: `${config.color}1a`, border: `1px solid ${config.color}30` }}
    >
      <span className='h-1.5 w-1.5 rounded-full' style={{ background: config.color }} />
      {config.label}
    </span>
  );
}

interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const color = score >= 85 ? '#34d399' : score >= 70 ? '#f59e0b' : '#a89bfd';
  return (
    <span
      className='badge'
      style={{ color, background: `${color}1a`, border: `1px solid ${color}30`, minWidth: 42 }}
    >
      IA {score}
    </span>
  );
}
