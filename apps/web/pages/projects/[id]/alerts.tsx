import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getAlerts, checkAlerts, updateAlert, deleteAlert } from '@/lib/api';
import ProjectLayout from '@/components/layouts/ProjectLayout';

interface Alert {
  id: string;
  project_id: string;
  type: string;
  severity: string;
  message: string;
  module_id: string | null;
  is_read: boolean;
  created_at: string;
}

const severityMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
  high:   { label: 'Alta',  color: 'var(--status-alert)',    bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)' },
  medium: { label: 'Média', color: 'var(--status-progress)', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)' },
  low:    { label: 'Baixa', color: 'var(--accent)',           bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.25)' },
};

const typeMap: Record<string, string> = {
  story_without_code: '📝 Story sem código',
  code_without_story: '💻 Código sem story',
  stagnation:         '⏸ Estagnação',
};

export default function AlertsList() {
  const router = useRouter();
  const { status } = useSession();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string | undefined>();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (router.isReady && status === 'authenticated') loadAlerts();
  }, [router.isReady, status, filterSeverity, showUnreadOnly]);

  const loadAlerts = async () => {
    try {
      setLoading(true); setError(null);
      const { id } = router.query;
      if (!id || typeof id !== 'string') { setError('Invalid project ID'); return; }
      const result = await getAlerts(id, showUnreadOnly);
      if (result.success && result.data) {
        setAlerts(filterSeverity ? result.data.filter(a => a.severity === filterSeverity) : result.data);
      } else setError(result.error || 'Failed to load');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setLoading(false); }
  };

  const handleCheckAlerts = async () => {
    try {
      setChecking(true);
      const { id } = router.query;
      if (!id || typeof id !== 'string') return;
      const result = await checkAlerts(id);
      if (result.success) { setError(null); await loadAlerts(); }
      else setError(result.error || 'Failed');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setChecking(false); }
  };

  const handleToggleRead = async (alertId: string, isRead: boolean) => {
    try {
      const result = await updateAlert(alertId, !isRead);
      if (result.success) await loadAlerts();
      else setError(result.error || 'Failed');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Deletar este alerta?')) return;
    try {
      const result = await deleteAlert(alertId);
      if (result.success) await loadAlerts();
      else setError(result.error || 'Failed');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="df-spinner" />
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>Carregando alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 28px' }}>

      {/* Toolbar */}
      <div className="animate-fade-up animate-delay-1" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={handleCheckAlerts} disabled={checking} className="df-btn-primary">
          {checking ? '🔄 Verificando...' : '🔍 Verificar Agora'}
        </button>
        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={showUnreadOnly ? 'df-btn-primary' : 'df-btn-ghost'}
          style={showUnreadOnly ? {} : {}}
        >
          {showUnreadOnly ? '✓ Não Lidos' : 'Todos'}
        </button>
        {['high', 'medium', 'low'].map(s => {
          const active = filterSeverity === s;
          const cfg = severityMap[s];
          return (
            <button
              key={s}
              onClick={() => setFilterSeverity(active ? undefined : s)}
              style={{
                padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 13, fontFamily: 'var(--font-sans)', transition: 'all 150ms',
                background: active ? cfg.bg : 'var(--bg-elevated)',
                color: active ? cfg.color : 'var(--text-secondary)',
              }}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--status-alert)' }}>
          ⚠ {error}
        </div>
      )}

      {/* Stats */}
      <div className="animate-fade-up animate-delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',    value: alerts.length,                              color: 'var(--text-primary)' },
          { label: 'Não Lidos', value: unreadCount,                               color: 'var(--status-alert)' },
          { label: 'Críticos', value: alerts.filter(a => a.severity === 'high').length, color: 'var(--status-progress)' },
        ].map((s, i) => (
          <div key={i} className="df-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Alert list */}
      <div className="animate-fade-up animate-delay-3">
        {alerts.length === 0 ? (
          <div className="df-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Nenhum alerta</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Seu projeto está em bom estado!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map(alert => {
              const cfg = severityMap[alert.severity] || severityMap['low'];
              return (
                <div key={alert.id} style={{
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                  borderRadius: 10, padding: '14px 18px',
                  opacity: alert.is_read ? 0.65 : 1,
                  transition: 'opacity 200ms',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {typeMap[alert.type] || alert.type}
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: cfg.bg, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {cfg.label}
                        </span>
                        {!alert.is_read && (
                          <span className="df-badge df-badge-accent">Novo</span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{alert.message}</p>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>
                        {new Date(alert.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => handleToggleRead(alert.id, alert.is_read)} className="df-btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}>
                        {alert.is_read ? 'Novo' : '✓ Lido'}
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 14, padding: '4px 6px', transition: 'color 150ms' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--status-alert)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="df-card animate-fade-up animate-delay-4" style={{ marginTop: 24 }}>
        <div className="df-card-header">
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Tipos de Alertas</span>
        </div>
        <div className="df-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { icon: '📝', title: 'Story sem código', desc: 'Story marcada como concluída mas sem implementação encontrada' },
            { icon: '💻', title: 'Código sem story', desc: 'Código novo encontrado que não está mapeado em nenhuma story' },
            { icon: '⏸', title: 'Estagnação', desc: 'Módulo com 0% progresso por mais de 7 dias' },
          ].map((l, i) => (
            <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ marginRight: 6 }}>{l.icon}</span>
              <strong style={{ color: 'var(--text-primary)' }}>{l.title}:</strong> {l.desc}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

AlertsList.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
