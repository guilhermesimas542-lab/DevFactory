import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getStories, getStoryTimeline, createStory, updateStory, deleteStory } from '@/lib/api';
import ProjectLayout from '@/components/layouts/ProjectLayout';
import KanbanBoard from '@/components/KanbanBoard';

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

const statusMap: Record<string, { label: string; cls: string }> = {
  completed:   { label: 'Concluída',    cls: 'df-badge-done' },
  in_progress: { label: 'Em Progresso', cls: 'df-badge-progress' },
  pending:     { label: 'Pendente',     cls: 'df-badge-pending' },
};

export default function StoriesList() {
  const router = useRouter();
  const { status } = useSession();
  const [stories, setStories] = useState<Story[]>([]);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [newStory, setNewStory] = useState({ title: '', description: '', epic: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('pending');
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (router.isReady && status === 'authenticated') loadData();
  }, [router.isReady, status, filterStatus]);

  useEffect(() => {
    if (!router.isReady || status !== 'authenticated') return;
    const interval = setInterval(loadData, 120000); // 2 minutos
    return () => clearInterval(interval);
  }, [router.isReady, status]);

  const loadData = async () => {
    try {
      setLoading(true); setError(null);
      const { id } = router.query;
      if (!id || typeof id !== 'string') { setError('Invalid project ID'); return; }
      const [sr, tr] = await Promise.all([
        getStories(id, filterStatus ? { status: filterStatus } : undefined),
        getStoryTimeline(id),
      ]);
      if (sr.success && sr.data) setStories(sr.data);
      else setError(sr.error || 'Failed to load stories');
      if (tr.success && tr.data) setTimeline(tr.data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSince = (date: Date) => {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) return `${s}s atrás`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m atrás`;
    return `${Math.floor(m / 60)}h atrás`;
  };

  const handleCreateStory = async () => {
    if (!newStory.title.trim()) { setError('Título obrigatório'); return; }
    const { id } = router.query;
    if (!id || typeof id !== 'string') return;
    try {
      const result = await createStory({ projectId: id, title: newStory.title, description: newStory.description, epic: newStory.epic });
      if (result.success) { setNewStory({ title: '', description: '', epic: '' }); setShowForm(false); await loadData(); }
      else setError(result.error || 'Failed to create');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
  };

  const handleUpdateStatus = async (storyId: string, newStatus: string) => {
    try {
      const result = await updateStory(storyId, {
        status: newStatus,
        ...(newStatus === 'in_progress' && { startedAt: new Date().toISOString() }),
        ...(newStatus === 'completed'   && { completedAt: new Date().toISOString() }),
      });
      if (result.success) { await loadData(); setEditingId(null); }
      else setError(result.error || 'Failed to update');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Deletar esta story?')) return;
    try {
      const result = await deleteStory(storyId);
      if (result.success) await loadData();
      else setError(result.error || 'Failed to delete');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="df-spinner" />
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>Carregando stories...</p>
        </div>
      </div>
    );
  }

  const filters = [
    { value: undefined, label: 'Todas' },
    { value: 'pending',     label: 'Pendentes' },
    { value: 'in_progress', label: 'Em Progresso' },
    { value: 'completed',   label: 'Concluídas' },
  ];

  return (
    <div style={{ padding: '28px 28px' }}>

      {/* Top bar */}
      <div className="animate-fade-up animate-delay-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        {/* View toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 8, padding: 3, gap: 2 }}>
          {(['lista', 'kanban'] as const).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              style={{
                padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, transition: 'all 150ms',
                background: viewMode === v ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === v ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {v === 'lista' ? 'Lista' : 'Kanban'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastUpdate && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', background: 'var(--bg-elevated)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--bg-border)' }}>
              {formatTimeSince(lastUpdate)}
            </span>
          )}
          <button onClick={() => setShowForm(!showForm)} className="df-btn-primary">
            + Nova Story
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--status-alert)' }}>
          ⚠ {error}
        </div>
      )}

      {/* Timeline stats */}
      {timeline && (
        <div className="animate-fade-up animate-delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Total',       value: timeline.total,           color: 'var(--text-primary)' },
            { label: 'Concluídas',  value: timeline.totalCompleted,  color: 'var(--status-done)' },
            { label: 'Progresso',   value: timeline.totalInProgress, color: 'var(--accent)' },
            { label: 'Pendentes',   value: timeline.totalPending,    color: 'var(--text-secondary)' },
            { label: 'Conclusão',   value: `${timeline.completionRate}%`, color: 'var(--type-backend)' },
          ].map((s, i) => (
            <div key={i} className="df-card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* New story form */}
      {showForm && (
        <div className="df-card animate-fade-up" style={{ marginBottom: 20 }}>
          <div className="df-card-header">
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Nova Story</span>
          </div>
          <div className="df-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="text"
              placeholder="Título da story"
              value={newStory.title}
              onChange={e => setNewStory({ ...newStory, title: e.target.value })}
              className="df-input"
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={newStory.description}
              onChange={e => setNewStory({ ...newStory, description: e.target.value })}
              rows={2}
              className="df-input"
              style={{ resize: 'vertical' }}
            />
            <input
              type="text"
              placeholder="Épico (ex: UI, Backend, IA)"
              value={newStory.epic}
              onChange={e => setNewStory({ ...newStory, epic: e.target.value })}
              className="df-input"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreateStory} className="df-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                Criar
              </button>
              <button onClick={() => setShowForm(false)} className="df-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban view */}
      {viewMode === 'kanban' ? (
        <KanbanBoard stories={stories} onUpdateStatus={handleUpdateStatus} onDelete={handleDeleteStory} loading={loading} />
      ) : (
        <div className="animate-fade-up animate-delay-3">
          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {filters.map(f => {
              const active = filterStatus === f.value;
              return (
                <button
                  key={String(f.value)}
                  onClick={() => setFilterStatus(f.value)}
                  style={{
                    padding: '4px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500, transition: 'all 150ms', fontFamily: 'var(--font-sans)',
                    background: active ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: active ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Stories list */}
          {stories.length === 0 ? (
            <div className="df-card" style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Nenhuma story encontrada</p>
            </div>
          ) : (
            <div className="df-card">
              {stories.map((story, i) => {
                const sm = statusMap[story.status] || statusMap['pending'];
                return (
                  <div key={story.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px',
                    borderBottom: i < stories.length - 1 ? '1px solid var(--bg-border)' : 'none',
                    transition: 'background 150ms',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--accent)', minWidth: 90, flexShrink: 0, paddingTop: 2 }}>
                      {story.id}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 6 }}>{story.title}</p>
                      {story.description && (
                        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                          {story.description}
                        </p>
                      )}
                    </div>

                    {editingId === story.id ? (
                      <select
                        value={editingStatus}
                        onChange={e => { setEditingStatus(e.target.value); handleUpdateStatus(story.id, e.target.value); }}
                        className="df-input"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
                      >
                        <option value="pending">Pendente</option>
                        <option value="in_progress">Em Progresso</option>
                        <option value="completed">Concluída</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => { setEditingId(story.id); setEditingStatus(story.status); }}
                        className={`df-badge ${sm.cls}`}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        {sm.label}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 14, padding: '2px 4px', transition: 'color 150ms' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--status-alert)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
                    >
                      🗑
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

StoriesList.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
