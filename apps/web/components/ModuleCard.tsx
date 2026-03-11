import ProgressBar from './ProgressBar';

interface ModuleCardProps {
  name: string;
  hierarchy: 'critico' | 'importante' | 'necessario' | 'desejavel' | 'opcional';
  progress: number;
  componentCount: number;
  deviations?: Array<{ gap: number; expectedProgress: number }>;
  onClick?: () => void;
}

const hierarchyConfig = {
  critico:    { label: 'Crítico',    color: 'var(--status-alert)',    target: 100 },
  importante: { label: 'Importante', color: 'var(--status-progress)', target: 80 },
  necessario: { label: 'Necessário', color: 'var(--accent)',           target: 60 },
  desejavel:  { label: 'Desejável',  color: 'var(--status-done)',      target: 40 },
  opcional:   { label: 'Opcional',   color: 'var(--text-tertiary)',    target: 20 },
};

export default function ModuleCard({ name, hierarchy, progress, componentCount, deviations, onClick }: ModuleCardProps) {
  const config = hierarchyConfig[hierarchy] ?? hierarchyConfig['necessario'];
  const isDeviated = deviations && deviations.length > 0;
  const deviation = deviations?.[0];

  return (
    <div
      onClick={onClick}
      className="df-card"
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: `3px solid ${config.color}`,
        transition: 'border-color 200ms, transform 150ms',
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { if (onClick) (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      <div style={{ padding: '16px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{name}</h3>
            <span style={{ fontSize: 11, color: config.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {config.label}
            </span>
          </div>
          {isDeviated && (
            <span className="df-badge df-badge-alert" style={{ marginLeft: 8 }}>Desvio</span>
          )}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 14 }}>
          <ProgressBar current={progress} target={config.target} showLabel size="sm" color={config.color} />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: isDeviated ? 12 : 0 }}>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Componentes</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{componentCount}</div>
          </div>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Status</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: progress === 100 ? 'var(--status-done)' : 'var(--text-primary)' }}>
              {progress === 100 ? '✓' : `${progress}%`}
            </div>
          </div>
        </div>

        {/* Deviation */}
        {isDeviated && deviation && (
          <div style={{ padding: '8px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, fontSize: 12 }}>
            <p style={{ color: 'var(--status-alert)', fontWeight: 600, marginBottom: 2 }}>
              ⚠ Abaixo do esperado por {deviation.gap}%
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
              Esperado: {deviation.expectedProgress}% · Atual: {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
