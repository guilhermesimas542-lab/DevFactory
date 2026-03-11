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

  // View mode and polling states
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (router.isReady && status === 'authenticated') {
      loadData();
    }
  }, [router.isReady, status, filterStatus]);

  // Polling interval - refresh data every 30 seconds
  useEffect(() => {
    if (!router.isReady || status !== 'authenticated') return;

    const interval = setInterval(() => {
      loadData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [router.isReady, status]);

  // Update timestamp display every second
  useEffect(() => {
    if (!lastUpdate) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

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
        getStories(id, filterStatus ? { status: filterStatus } : undefined),
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

      // Record last update time
      setLastUpdate(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `há ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `há ${hours}h`;
  };

  const handleCreateStory = async () => {
    try {
      if (!newStory.title.trim()) {
        setError('Title is required');
        return;
      }

      const { id } = router.query;
      if (!id || typeof id !== 'string') return;

      const result = await createStory({
        projectId: id,
        title: newStory.title,
        description: newStory.description,
        epic: newStory.epic,
      });

      if (result.success) {
        setNewStory({ title: '', description: '', epic: '' });
        setShowForm(false);
        await loadData();
      } else {
        setError(result.error || 'Failed to create story');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    }
  };

  const handleUpdateStatus = async (storyId: string, newStatus: string) => {
    try {
      const result = await updateStory(storyId, {
        status: newStatus,
        ...(newStatus === 'in_progress' && { startedAt: new Date().toISOString() }),
        ...(newStatus === 'completed' && { completedAt: new Date().toISOString() }),
      });

      if (result.success) {
        await loadData();
        setEditingId(null);
      } else {
        setError(result.error || 'Failed to update story');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Tem certeza que quer deletar esta story?')) return;

    try {
      const result = await deleteStory(storyId);

      if (result.success) {
        await loadData();
      } else {
        setError(result.error || 'Failed to delete story');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      case 'pending':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Carregando stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Top Bar: View toggle + Last update info */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('lista')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'lista'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 Lista
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📊 Kanban
            </button>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-xs text-gray-500">⏱️ {formatTimeSince(lastUpdate)}</span>
            )}
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              + Nova Story
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">⚠️ {error}</p>
          </div>
        )}

        {/* Timeline Stats */}
        {timeline && (
          <div className="grid grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-900">{timeline.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 font-medium">Concluídas</p>
              <p className="text-3xl font-bold text-green-600">{timeline.totalCompleted}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 font-medium">Em Progresso</p>
              <p className="text-3xl font-bold text-blue-600">{timeline.totalInProgress}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 font-medium">Pendentes</p>
              <p className="text-3xl font-bold text-gray-600">{timeline.totalPending}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 font-medium">Taxa Conclusão</p>
              <p className="text-3xl font-bold text-purple-600">{timeline.completionRate}%</p>
            </div>
          </div>
        )}

        {/* New Story Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nova Story</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título da story"
                value={newStory.title}
                onChange={e => setNewStory({ ...newStory, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={newStory.description}
                onChange={e => setNewStory({ ...newStory, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Épico (ex: Épico 1)"
                value={newStory.epic}
                onChange={e => setNewStory({ ...newStory, epic: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateStory}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Criar
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE: KANBAN */}
        {viewMode === 'kanban' ? (
          <KanbanBoard
            stories={stories}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteStory}
            loading={loading}
          />
        ) : (
          <>
            {/* VIEW MODE: LISTA */}
            {/* Filters */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setFilterStatus(undefined)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  !filterStatus
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFilterStatus('in_progress')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'in_progress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Em Progresso
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Concluídas
              </button>
            </div>

            {/* Stories List */}
            {stories.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">Nenhuma story encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stories.map(story => (
                  <div
                    key={story.id}
                    className={`border rounded-lg p-4 transition-all ${getStatusColor(story.status)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{story.title}</h3>
                        {story.description && (
                          <p className="text-sm text-gray-600 mt-1">{story.description}</p>
                        )}
                      </div>
                      <div className="ml-4 flex gap-2">
                        {editingId === story.id ? (
                          <select
                            value={editingStatus}
                            onChange={e => {
                              setEditingStatus(e.target.value);
                              handleUpdateStatus(story.id, e.target.value);
                            }}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="pending">⏳ Pendente</option>
                            <option value="in_progress">🔄 Em Progresso</option>
                            <option value="completed">✅ Concluída</option>
                          </select>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(story.id);
                              setEditingStatus(story.status);
                            }}
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                          >
                            {getStatusLabel(story.status)}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs text-gray-600 mt-3">
                      {story.epic && <span>📚 {story.epic}</span>}
                      {story.started_at && (
                        <span>🚀 {new Date(story.started_at).toLocaleDateString('pt-BR')}</span>
                      )}
                      {story.completed_at && (
                        <span>✓ {new Date(story.completed_at).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}

StoriesList.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
