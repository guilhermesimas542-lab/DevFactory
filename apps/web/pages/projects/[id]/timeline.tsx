import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getStories, getStoryTimeline } from '@/lib/api';

interface Story {
  id: string;
  title: string;
  epic: string | null;
  status: string;
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
        setStories(storiesResult.data as any);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Timeline de Stories</h1>
            <p className="text-gray-600 mt-2">Visualize o progresso das stories ao longo do tempo</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">⚠️ {error}</p>
          </div>
        )}

        {/* Stats */}
        {timeline && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 font-medium">Taxa de Conclusão</p>
              <p className="text-3xl font-bold text-blue-600">{timeline.completionRate}%</p>
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
              <p className="text-sm text-gray-600 font-medium">Dias Médios</p>
              <p className="text-3xl font-bold text-purple-600">{timeline.avgDaysToCompletion}d</p>
            </div>
          </div>
        )}

        {/* Timeline Visualization */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Timeline Gráfico</h2>

          {stories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhuma story com datas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline scale */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>{getEarliestDate().toLocaleDateString('pt-BR')}</span>
                  <span>{getLatestDate().toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="h-1 bg-gray-200 rounded-full relative">
                  <div className="absolute top-0 left-0 right-0 bottom-0 flex">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex-1 border-r border-gray-300" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Stories */}
              {stories.map(story => (
                <div key={story.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{story.title}</h3>
                      <p className="text-sm text-gray-600">
                        {getStatusLabel(story.status)}
                        {story.epic && ` • ${story.epic}`}
                      </p>
                    </div>
                    <div className="text-xs text-gray-600 ml-4 text-right">
                      {story.started_at && (
                        <div>Início: {formatDate(story.started_at)}</div>
                      )}
                      {story.completed_at && (
                        <div>Fim: {formatDate(story.completed_at)}</div>
                      )}
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStatusColor(story.status)} rounded-full transition-all`}
                      style={{
                        left: `${calculatePosition(
                          story.started_at ? new Date(story.started_at) : new Date(story.created_at)
                        )}%`,
                        width: `${calculateWidth(
                          story.started_at ? new Date(story.started_at) : null,
                          story.completed_at ? new Date(story.completed_at) : null
                        )}%`,
                        position: 'absolute',
                      }}
                      title={story.title}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Legenda</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">✅ Concluída</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">🔄 Em Progresso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600">⏳ Pendente</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push(`/projects/${router.query.id}/stories`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            ← Voltar para Stories
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            → Ir para Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
