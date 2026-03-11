import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import TreeEditor from '../../../components/TreeEditor';
import { getProject, validateProjectTree } from '../../../lib/api';

interface Module {
  id: string;
  name: string;
  description: string | null;
  hierarchy: string;
  components: Array<{
    id: string;
    name: string;
  }>;
}

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  modules: Module[];
}

export default function ValidatePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      if (!router.query.id) return;

      setLoading(true);
      const result = await getProject(router.query.id as string);

      if (result.success && result.data) {
        setProject({
          id: result.data.id,
          name: result.data.name,
          description: result.data.description,
          modules: result.data.modules || [],
        });
      } else {
        setError(result.error || 'Erro ao carregar projeto');
      }
      setLoading(false);
    };

    loadProject();
  }, [router.query.id]);

  const handleUpdate = async (updates: any[]) => {
    setSaving(true);
    setError('');
    setMessage('');

    const result = await validateProjectTree(router.query.id as string, updates);

    if (result.success) {
      setMessage(`✓ ${result.data?.modulesUpdated || 0} módulos atualizados com sucesso!`);
      setTimeout(() => {
        router.push(`/projects/${router.query.id}`);
      }, 2000);
    } else {
      setError(result.error || 'Erro ao salvar mudanças');
    }

    setSaving(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project?.name || 'Validar Projeto'}</h1>
              <p className="text-gray-600 mt-1">Revise e confirme a estrutura dos módulos</p>
            </div>
            <button
              onClick={() => router.push(`/projects/${router.query.id}`)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-700">
            <strong>Sucesso:</strong> {message}
          </div>
        )}

        {project && project.modules.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <TreeEditor
              modules={project.modules.map(m => ({
                moduleId: m.id,
                name: m.name,
                hierarchy: m.hierarchy,
                description: m.description,
                components: m.components.map(c => ({
                  componentId: c.id,
                  name: c.name,
                })),
              }))}
              onUpdate={handleUpdate}
              loading={saving}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Nenhum módulo encontrado neste projeto</p>
          </div>
        )}
      </div>
    </div>
  );
}
