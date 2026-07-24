import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: ReactNode;
  iconColor?: string;
  subtitle?: string;
  highlight?: boolean;
}

export function MetricCard({ label, value, change, trend, icon, iconColor, subtitle, highlight }: MetricCardProps) {
  const color = iconColor || '#6d5dfc';

  return (
    <div className={`metric-card ${highlight ? 'neon-border' : ''}`}>
      <div className='mb-3 flex items-start justify-between'>
        <div
          className='flex h-10 w-10 items-center justify-center rounded-lg'
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              trend === 'up'
                ? 'bg-green-400/10 text-green-400'
                : trend === 'down'
                  ? 'bg-red-400/10 text-red-400'
                  : 'bg-slate-400/10 text-slate-400'
            }`}
          >
            {trend === 'up' && <TrendingUp size={11} />}
            {trend === 'down' && <TrendingDown size={11} />}
            {change}
          </div>
        )}
      </div>
      <div className='mt-1'>
        <p className='text-2xl font-bold leading-tight text-white'>{value}</p>
        <p className='mt-1 text-sm text-slate-400'>{label}</p>
        {subtitle && <p className='mt-0.5 text-xs text-slate-500'>{subtitle}</p>}
      </div>
    </div>
  );
}
