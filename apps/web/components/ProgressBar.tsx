interface ProgressBarProps {
  current: number;
  target?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const getColor = (pct: number) => {
  if (pct >= 80) return 'var(--status-done)';
  if (pct >= 60) return 'var(--accent)';
  if (pct >= 40) return 'var(--status-progress)';
  return 'var(--status-alert)';
};

const heights = { sm: 4, md: 6, lg: 8 };
const labelSizes = { sm: 11, md: 12, lg: 13 };

export default function ProgressBar({ current, target, showLabel = true, size = 'md', color, className = '' }: ProgressBarProps) {
  const pct = Math.min(Math.max(current, 0), 100);
  const fill = color || getColor(pct);
  const h = heights[size];
  const ls = labelSizes[size];

  return (
    <div className={className}>
      <div style={{
        position: 'relative', width: '100%',
        height: h, background: 'var(--bg-elevated)',
        borderRadius: 999, overflow: 'hidden',
      }}>
        {target != null && (
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            width: 1, background: 'var(--text-tertiary)', opacity: 0.5,
            left: `${Math.min(Math.max(target, 0), 100)}%`,
          }} title={`Meta: ${target}%`} />
        )}
        <div style={{
          height: '100%', width: `${pct}%`,
          background: fill, borderRadius: 999,
          transition: 'width 600ms ease',
        }} />
      </div>

      {showLabel && (
        <div style={{ marginTop: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: ls }}>
          <span style={{ fontWeight: 600, color: fill }}>{pct}%</span>
          {target != null && (
            <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              meta: {target}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
