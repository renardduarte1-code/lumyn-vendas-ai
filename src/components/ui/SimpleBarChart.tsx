interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showValues?: boolean;
  formatValue?: (v: number) => string;
}

export function SimpleBarChart({ data, height = 120, showValues = true, formatValue }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className='w-full'>
      <div className='flex items-end gap-2' style={{ height }}>
        {data.map((item, i) => {
          const pct = max > 0 ? (item.value / max) * 100 : 0;
          return (
            <div key={i} className='group flex flex-1 flex-col items-center gap-1'>
              {showValues && (
                <span className='text-xs font-semibold text-slate-500 opacity-0 transition-colors group-hover:text-slate-300 group-hover:opacity-100'>
                  {formatValue ? formatValue(item.value) : item.value}
                </span>
              )}
              <div className='relative w-full overflow-hidden rounded-t' style={{ height: `${pct}%`, minHeight: 4 }}>
                <div
                  className='absolute inset-0 transition-all duration-500'
                  style={{
                    background: item.color
                      ? `linear-gradient(180deg, ${item.color}, ${item.color}88)`
                      : 'linear-gradient(180deg, rgba(109,93,252,0.9), rgba(138,123,253,0.7))',
                    borderRadius: '3px 3px 0 0',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className='mt-2 flex gap-2'>
        {data.map((item, i) => (
          <div key={i} className='flex-1 text-center'>
            <span className='block truncate text-xs text-slate-500'>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
