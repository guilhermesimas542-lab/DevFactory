import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getProject, updateProject, syncProjectGitHub, analyzeProject } from '@/lib/api';
import ProjectLayout from '@/components/layouts/ProjectLayout';
import PRDViewer from '@/components/PRDViewer';

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  github_repo_url: string | null;
  github_last_sync: string | null;
  prd_original: {
    rawContent: string;
    originalFileName: string;
    uploadedAt: string;
    fileSize: number;
    mimeType: string;
  };
  created_at: string;
  updated_at: string;
}

export default function ProjectDetail() {
  const router = useRouter();
  const { status } = useSession();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GitHub integration states
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showPRDModal, setShowPRDModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeMessage, setAnalyzeMessage] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Load project data
    if (router.isReady && status === 'authenticated') {
      loadProject();
    }
  }, [router.isReady, status]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);

      const { id } = router.query;

      if (!id || typeof id !== 'string') {
        setError('Invalid project ID');
        return;
      }

      const result = await getProject(id);

      if (result.success && result.data) {
        setProject(result.data);
        setRepoUrl(result.data.github_repo_url || '');
      } else {
        setError(result.error || 'Failed to load project');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/projects')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Voltar para Importar
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Projeto não encontrado</p>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const handleSaveGitHub = async () => {
    if (!project) return;

    try {
      setIsSaving(true);
      setError(null);

      const result = await updateProject(project.id, {
        github_repo_url: repoUrl || undefined,
      });

      if (result.success) {
        setProject({ ...project, github_repo_url: repoUrl || null });
        setSyncMessage('✓ Repositório configurado com sucesso!');
        setTimeout(() => setSyncMessage(null), 3000);
      } else {
        setError(result.error || 'Erro ao salvar repositório');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!project) return;
    try {
      setIsAnalyzing(true);
      setAnalyzeMessage(null);
      setError(null);
      const result = await analyzeProject(project.id);
      if (result.success && result.data) {
        const moduleCount = Object.keys(result.data.moduleProgress).length;
        setAnalyzeMessage(`✓ Análise concluída! ${moduleCount} módulos analisados, ${result.data.patternsFound} padrões encontrados.`);
        setTimeout(() => setAnalyzeMessage(null), 8000);
      } else {
        setError(result.error || 'Erro na análise');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSyncGitHub = async () => {
    if (!project) return;

    try {
      setIsSyncing(true);
      setSyncMessage(null);
      setError(null);

      const result = await syncProjectGitHub(project.id);

      if (result.success && result.data) {
        const updatedCount = result.data.stories_updated.length;
        setSyncMessage(`✓ ${updatedCount} stories atualizadas com sucesso!`);
        setProject({
          ...project,
          github_last_sync: result.data.synced_at,
        });
        setTimeout(() => setSyncMessage(null), 5000);
      } else {
        setError(result.error || 'Erro ao sincronizar');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Project Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informações do Projeto</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Projeto</label>
              <p className="text-gray-900">{project.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <p className="text-gray-900">{project.description || 'Sem descrição'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID do Projeto</label>
              <p className="text-gray-600 font-mono text-sm">{project.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Criado em</label>
              <p className="text-gray-900">{formatDate(project.created_at)}</p>
            </div>
          </div>
        </div>

        {/* PRD Info Card */}
        {project.prd_original && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Documento Importado</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Arquivo</label>
                <p className="text-gray-900">{project.prd_original.originalFileName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho</label>
                  <p className="text-gray-900">{formatFileSize(project.prd_original.fileSize)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <p className="text-gray-900">{project.prd_original.mimeType}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Importado em</label>
                <p className="text-gray-900">{formatDate(project.prd_original.uploadedAt)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Card */}
        {project.prd_original && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Visualização do Documento</h2>
            <p className="text-sm text-gray-500 mb-3">
              {project.prd_original.rawContent.substring(0, 300)}
              {project.prd_original.rawContent.length > 300 && '...'}
            </p>
            <button
              onClick={() => setShowPRDModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-sm"
            >
              Ver PRD Completo
            </button>
          </div>
        )}

        {/* Analysis Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 Análise de Código</h2>
          {!project.github_repo_url ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-700 text-sm">Configure um repositório GitHub abaixo para habilitar a análise de código.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">Analisa o repositório GitHub e atualiza automaticamente o progresso de cada módulo.</p>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
              >
                {isAnalyzing ? '⏳ Analisando código... (pode levar 1-2 min)' : '🔍 Analisar Código Agora'}
              </button>
              {analyzeMessage && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded text-purple-700 text-sm">{analyzeMessage}</div>
              )}
            </div>
          )}
        </div>

        {/* GitHub Integration Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔗 Sincronização com GitHub</h2>

          {!repoUrl ? (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <p className="text-blue-700 text-sm">
                📌 Configure um repositório GitHub para sincronizar stories automaticamente com base nas mensagens de commit.
              </p>
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL do Repositório GitHub</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://github.com/usuario/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSaveGitHub}
                  disabled={isSaving || repoUrl === (project.github_repo_url || '')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
                >
                  {isSaving ? '⏳ Salvando...' : 'Salvar'}
                </button>
              </div>
              {repoUrl && repoUrl !== (project.github_repo_url || '') && (
                <p className="text-xs text-gray-500 mt-1">Clique em "Salvar" para aplicar as mudanças</p>
              )}
            </div>

            {project.github_repo_url && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Última Sincronização</p>
                    <p className="text-sm text-gray-900">
                      {project.github_last_sync
                        ? formatDate(project.github_last_sync)
                        : 'Nunca sincronizado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Status</p>
                    <p className="text-sm text-green-600">✓ Configurado</p>
                  </div>
                </div>

                <button
                  onClick={handleSyncGitHub}
                  disabled={isSyncing}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
                >
                  {isSyncing ? '⏳ Sincronizando...' : '🔄 Sincronizar Agora'}
                </button>
              </div>
            )}
          </div>

          {syncMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              {syncMessage}
            </div>
          )}
        </div>

      </main>

      {showPRDModal && project.prd_original && (
        <PRDViewer
          content={project.prd_original.rawContent}
          fileName={project.prd_original.originalFileName}
          onClose={() => setShowPRDModal(false)}
        />
      )}
    </div>
  );
}

ProjectDetail.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
