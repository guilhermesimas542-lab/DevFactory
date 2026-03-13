import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getStories, getStoryTimeline } from '@/lib/api';
import ProjectLayout from '@/components/layouts/ProjectLayout';

interface Story {
  id: string;
  project_id: string;
  module_id: string | null;
  title: string;
  description: string | null;
  epic: string | null;
  status: string;
  agent_responsible: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface TimelineData {
  total: number;
  completionRate: number;
  totalCompleted: number;
  totalPending: number;
  totalInProgress: number;
  avgDaysToCompletion: number;
}

export default function Timeline() {
  const router = useRouter();
  const { status } = useSession();
  const [stories, setStories] = useState<Story[]>([]);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (router.isReady && status === 'authenticated') {
      loadData();
    }
  }, [router.isReady, status]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { id } = router.query;

      if (!id || typeof id !== 'string') {
        setError('Invalid project ID');
        return;
      }

      const [storiesResult, timelineResult] = await Promise.all([
        getStories(id),
        getStoryTimeline(id),
      ]);

      if (storiesResult.success && storiesResult.data) {
        setStories(storiesResult.data);
      } else {
        setError(storiesResult.error || 'Failed to load stories');
      }

      if (timelineResult.success && timelineResult.data) {
        setTimeline(timelineResult.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getEarliestDate = () => {
    const dates = stories
      .map(s => s.started_at || s.created_at)
      .filter(Boolean)
      .map(d => new Date(d as string).getTime());
    return dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
  };

  const getLatestDate = () => {
    const dates = stories
      .map(s => s.completed_at || s.started_at || s.created_at)
      .filter(Boolean)
      .map(d => new Date(d as string).getTime());
    return dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
  };

  const calculatePosition = (date: Date | null) => {
    if (!date) return 0;
    const earliest = getEarliestDate().getTime();
    const latest = getLatestDate().getTime();
    const range = latest - earliest || 1;
    const position = (new Date(date).getTime() - earliest) / range * 100;
    return Math.max(0, Math.min(100, position));
  };

  const calculateWidth = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate) return 1;
    if (!endDate) return 5;

    const earliest = getEarliestDate().getTime();
    const latest = getLatestDate().getTime();
    const range = latest - earliest || 1;

    const startPos = (new Date(startDate).getTime() - earliest) / range * 100;
    const endPos = (new Date(endDate).getTime() - earliest) / range * 100;

    return Math.max(1, endPos - startPos);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅ Concluída';
      case 'in_progress':
        return '🔄 Em Progresso';
      case 'pending':
        return '⏳ Pendente';
      default:
        return status;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Carregando timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 0' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {error && (
          <div style={{ marginBottom: 24, padding: '12px 14px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--status-alert)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Stats */}
        {timeline && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Taxa de Conclusão</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#38BDF8' }}>{timeline.completionRate}%</p>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concluídas</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{timeline.totalCompleted}</p>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Em Progresso</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#F59E0B' }}>{timeline.totalInProgress}</p>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dias Médios</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#A78BFA' }}>{timeline.avgDaysToCompletion}d</p>
            </div>
          </div>
        )}

        {/* Timeline Visualization */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>📅 Timeline de Histórias</h2>

          {stories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
              <p>Nenhuma história com datas registradas</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Timeline scale */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8 }}>
                  <span>{getEarliestDate().toLocaleDateString('pt-BR')}</span>
                  <span>{getLatestDate().toLocaleDateString('pt-BR')}</span>
                </div>
                <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 999, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.05)' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Stories */}
              {stories.map(story => {
                const statusColorMap: Record<string, string> = {
                  completed: '#10B981',
                  in_progress: '#F59E0B',
                  pending: 'rgba(255,255,255,0.2)'
                };
                const statusColor = statusColorMap[story.status] || 'rgba(255,255,255,0.2)';

                return (
                  <div key={story.id} style={{ padding: 14, background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{story.title}</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {getStatusLabel(story.status)}
                          {story.epic && ` • ${story.epic}`}
                        </p>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right', marginLeft: 16 }}>
                        {story.started_at && (
                          <div>Início: {formatDate(story.started_at)}</div>
                        )}
                        {story.completed_at && (
                          <div>Fim: {formatDate(story.completed_at)}</div>
                        )}
                      </div>
                    </div>

                    {/* Bar */}
                    <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                      <div
                        style={{
                          position: 'absolute',
                          height: '100%',
                          background: statusColor,
                          borderRadius: 999,
                          transition: 'all 200ms',
                          left: `${calculatePosition(
                            story.started_at ? new Date(story.started_at) : new Date(story.created_at)
                          )}%`,
                          width: `${calculateWidth(
                            story.started_at ? new Date(story.started_at) : null,
                            story.completed_at ? new Date(story.completed_at) : null
                          )}%`,
                          boxShadow: `0 0 12px ${statusColor}40`
                        }}
                        title={story.title}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ marginTop: 32, background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>📊 Legenda de Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, background: '#10B981', borderRadius: '50%', boxShadow: '0 0 8px #10B98140' }}></div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>✅ Concluída</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, background: '#F59E0B', borderRadius: '50%', boxShadow: '0 0 8px #F59E0B40' }}></div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🔄 Em Progresso</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>⏳ Pendente</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

Timeline.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
