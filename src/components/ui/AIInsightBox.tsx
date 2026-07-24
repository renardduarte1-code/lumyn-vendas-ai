import { Sparkles, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';

interface AIInsightBoxProps {
  text: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  onAction?: () => void;
}

const priorityConfig = {
  high: { color: '#f97316', icon: AlertTriangle },
  medium: { color: '#f59e0b', icon: TrendingUp },
  low: { color: '#a89bfd', icon: Sparkles },
};

export function AIInsightBox({ text, priority, action, onAction }: AIInsightBoxProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <div
      className='flex items-start gap-3 rounded-xl p-3.5 transition-all'
      style={{ background: `${config.color}14`, border: `1px solid ${config.color}30` }}
    >
      <div
        className='mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg'
        style={{ background: `${config.color}18` }}
      >
        <Icon size={14} style={{ color: config.color }} />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-sm leading-relaxed text-slate-300'>{text}</p>
      </div>
      {action && (
        <button
          onClick={onAction}
          className='flex flex-shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
          style={{ color: config.color, background: `${config.color}15` }}
        >
          {action}
          <ArrowRight size={11} />
        </button>
      )}
    </div>
  );
}
