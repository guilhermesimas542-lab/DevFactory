import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getProgress } from '@/lib/api';
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

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Load progress data
    if (router.isReady && status === 'authenticated') {
      loadProgress();
    }
  }, [router.isReady, status]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const { id } = router.query;

      if (!id || typeof id !== 'string') {
        setError('Invalid project ID');
        return;
      }

      const result = await getProgress(id);

      if (result.success && result.data) {
        setProgress(result.data);
      } else {
        setError(result.error || 'Failed to load progress');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (pollingInterval) clearInterval(pollingInterval);

    const interval = setInterval(() => {
      loadProgress();
    }, 30000); // Poll every 30 seconds

    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const getDeviationsForModule = (moduleId: string) => {
    return progress?.deviations.filter(d => d.moduleId === moduleId) || [];
  };

  const hierarchyOrder = {
    critico: 1,
    importante: 2,
    necessario: 3,
    desejavel: 4,
    opcional: 5,
  };

  const sortedModules = progress?.modules.sort((a, b) =>
    (hierarchyOrder[a.hierarchy as keyof typeof hierarchyOrder] ?? 99) -
    (hierarchyOrder[b.hierarchy as keyof typeof hierarchyOrder] ?? 99)
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Carregando progresso...</p>
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-gray-700 mb-6">{error || 'Progresso não encontrado'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Voltar para Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={loadProgress}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            🔄 Atualizar
          </button>
          {pollingInterval ? (
            <button
              onClick={stopPolling}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              ⏸️ Parar Polling
            </button>
          ) : (
            <button
              onClick={startPolling}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              ▶️ Iniciar Polling
            </button>
          )}
        </div>
        {/* Overall Progress Card */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Progresso Geral</h2>
          <div className="flex items-end gap-8">
            <div className="flex-1">
              <ProgressBar
                current={progress.overall}
                showLabel={true}
                size="lg"
              />
              <p className="text-sm text-gray-600 mt-4">
                Última atualização: {new Date(progress.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-blue-600">{progress.overall}%</div>
              <p className="text-gray-600 mt-2">Completude do Projeto</p>
            </div>
          </div>
        </div>

        {/* Deviations Alert */}
        {progress.deviations.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-red-700 mb-4">
              ⚠️ {progress.deviations.length} Módulo(s) com Desvio
            </h3>
            <div className="space-y-2">
              {progress.deviations.map(deviation => (
                <div key={deviation.moduleId} className="text-red-600">
                  <p className="font-medium">{deviation.name}</p>
                  <p className="text-sm">
                    {deviation.currentProgress}% (esperado: {deviation.expectedProgress}%) — Gap: {deviation.gap}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modules Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Stats Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo por Hierarquia</h3>
          <div className="grid grid-cols-5 gap-4">
            {['critico', 'importante', 'necessario', 'desejavel', 'opcional'].map(hierarchy => {
              const hierarchyModules = progress.modules.filter(m => m.hierarchy === hierarchy);
              const avgProgress = hierarchyModules.length > 0
                ? Math.round(hierarchyModules.reduce((sum, m) => sum + m.progress, 0) / hierarchyModules.length)
                : 0;

              return (
                <div key={hierarchy} className="bg-gray-50 rounded p-4 text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2 capitalize">{hierarchy}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{hierarchyModules.length}</p>
                  <p className="text-xs text-gray-600">Média: {avgProgress}%</p>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}

ProjectProgress.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
