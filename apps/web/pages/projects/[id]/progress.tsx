import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getProgress, analyzeProject } from '@/lib/api';
import ProgressBar from '@/components/ProgressBar';
import ModuleCard from '@/components/ModuleCard';
import ProjectLayout from '@/components/layouts/ProjectLayout';

interface ProgressData {
  projectId: string;
  projectName: string;
  overall: number;
  by_module: Record<string, number>;
  modules: Array<{
    moduleId: string;
    name: string;
    hierarchy: string;
    progress: number;
    componentCount: number;
  }>;
  deviations: Array<{
    moduleId: string;
    name: string;
    currentProgress: number;
    expectedProgress: number;
    gap: number;
  }>;
  timestamp: string;
}

export default function ProjectProgress() {
  const router = useRouter();
  const { status } = useSession();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeMessage, setAnalyzeMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (router.isReady && status === 'authenticated') loadProgress();
  }, [router.isReady, status]);

  const loadProgress = async () => {
    try {
      setLoading(true); setError(null);
      const { id } = router.query;
      if (!id || typeof id !== 'string') { setError('Invalid project ID'); return; }
      const result = await getProgress(id);
      if (result.success && result.data) setProgress(result.data);
      else setError(result.error || 'Failed to load progress');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (pollingInterval) clearInterval(pollingInterval);
    setPollingInterval(setInterval(loadProgress, 30000));
  };

  const stopPolling = () => {
    if (pollingInterval) { clearInterval(pollingInterval); setPollingInterval(null); }
  };

  const handleAnalyze = async () => {
    const { id } = router.query;
    if (!id || typeof id !== 'string') return;
    try {
      setIsAnalyzing(true); setAnalyzeMessage(null);
      const result = await analyzeProject(id);
      if (result.success && result.data) {
        setAnalyzeMessage(`✓ Análise concluída! ${result.data.patternsFound} padrões encontrados.`);
        await loadProgress();
        setTimeout(() => setAnalyzeMessage(null), 8000);
      } else {
        setAnalyzeMessage(`❌ ${result.error || 'Erro na análise'}`);
      }
    } catch (err) {
      setAnalyzeMessage(`❌ ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDeviationsForModule = (moduleId: string) =>
    progress?.deviations.filter(d => d.moduleId === moduleId) || [];

  const hierarchyOrder = { critico: 1, importante: 2, necessario: 3, desejavel: 4, opcional: 5 };
  const sortedModules = progress?.modules.slice().sort((a, b) =>
    (hierarchyOrder[a.hierarchy as keyof typeof hierarchyOrder] ?? 99) -
    (hierarchyOrder[b.hierarchy as keyof typeof hierarchyOrder] ?? 99)
  );

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="df-spinner" />
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>Carregando progresso...</p>
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 16 }}>
        <div className="df-card" style={{ maxWidth: 400, width: '100%', padding: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--status-alert)', marginBottom: 12 }}>Erro</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{error || 'Progresso não encontrado'}</p>
          <button onClick={() => router.push('/dashboard')} className="df-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 28px' }}>

      {/* Toolbar */}
      <div className="animate-fade-up animate-delay-1" style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={loadProgress} className="df-btn-ghost">
          ↺ Atualizar
        </button>
        {pollingInterval ? (
          <button onClick={stopPolling} className="df-btn-ghost" style={{ color: 'var(--status-progress)', borderColor: 'rgba(245,158,11,0.3)' }}>
            ⏸ Parar Polling
          </button>
        ) : (
          <button onClick={startPolling} className="df-btn-ghost" style={{ color: 'var(--status-done)', borderColor: 'rgba(16,185,129,0.3)' }}>
            ▶ Iniciar Polling
          </button>
        )}
        <button onClick={handleAnalyze} disabled={isAnalyzing} className="df-btn-primary">
          {isAnalyzing ? '⏳ Analisando...' : '🔍 Analisar Código'}
        </button>
        {pollingInterval && (
          <span className="df-badge df-badge-done" style={{ alignSelf: 'center' }}>Live</span>
        )}
      </div>

      {analyzeMessage && (
        <div style={{
          marginBottom: 20, padding: '10px 14px', borderRadius: 8, fontSize: 13,
          background: analyzeMessage.startsWith('❌') ? 'rgba(239,68,68,0.10)' : 'rgba(99,102,241,0.10)',
          border: `1px solid ${analyzeMessage.startsWith('❌') ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}`,
          color: analyzeMessage.startsWith('❌') ? 'var(--status-alert)' : 'var(--accent)',
        }}>
          {analyzeMessage}
        </div>
      )}

      {/* Overall Progress */}
      <div className="df-card animate-fade-up animate-delay-2" style={{ marginBottom: 20, padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 14 }}>
              Progresso Geral
            </div>
            <ProgressBar current={progress.overall} showLabel={false} size="lg" />
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 10, fontFamily: 'var(--font-mono)' }}>
              Atualizado {new Date(progress.timestamp).toLocaleString('pt-BR')}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--accent)', lineHeight: 1 }}>
              {progress.overall}%
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>Completude</p>
          </div>
        </div>
      </div>

      {/* Deviations alert */}
      {progress.deviations.length > 0 && (
        <div className="animate-fade-up animate-delay-2" style={{
          marginBottom: 20, padding: '16px 20px',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10,
        }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--status-alert)', marginBottom: 10 }}>
            ⚠ {progress.deviations.length} módulo(s) com desvio
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {progress.deviations.map(d => (
              <div key={d.moduleId} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{d.name}</span>
                {' · '}{d.currentProgress}% <span style={{ color: 'var(--text-tertiary)' }}>(esperado: {d.expectedProgress}%)</span>
                {' · '}Gap: <span style={{ color: 'var(--status-alert)' }}>{d.gap}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modules */}
      <div className="animate-fade-up animate-delay-3">
        <div className="df-section-label" style={{ marginBottom: 14 }}>Módulos</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 28 }}>
          {sortedModules?.map(module => (
            <ModuleCard
              key={module.moduleId}
              name={module.name}
              hierarchy={module.hierarchy as any}
              progress={module.progress}
              componentCount={module.componentCount}
              deviations={getDeviationsForModule(module.moduleId)}
              onClick={() => router.push(`/projects/${progress.projectId}`)}
            />
          ))}
        </div>
      </div>

      {/* Hierarchy summary */}
      <div className="df-card animate-fade-up animate-delay-4">
        <div className="df-card-header">
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Resumo por Hierarquia</span>
        </div>
        <div className="df-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {['critico', 'importante', 'necessario', 'desejavel', 'opcional'].map(h => {
              const mods = progress.modules.filter(m => m.hierarchy === h);
              const avg = mods.length > 0
                ? Math.round(mods.reduce((s, m) => s + m.progress, 0) / mods.length)
                : 0;
              return (
                <div key={h} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-tertiary)', marginBottom: 6 }}>{h}</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{mods.length}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>~{avg}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

ProjectProgress.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
