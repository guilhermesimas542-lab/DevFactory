import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getProject } from '@/lib/api';

interface ProjectData {
  id: string;
  name: string;
}

interface ProjectLayoutProps {
  children: React.ReactNode;
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    if (router.isReady) {
      loadProject();
    }
  }, [router.isReady, router.query.id]);

  const loadProject = async () => {
    try {
      const { id } = router.query;
      if (!id || typeof id !== 'string') return;

      const result = await getProject(id);
      if (result.success && result.data) {
        setProject(result.data);
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const menuItems = [
    { label: '🏠 Visão Geral', path: `/projects/${router.query.id}` },
    { label: '📊 Progresso', path: `/projects/${router.query.id}/progress` },
    { label: '📝 Stories', path: `/projects/${router.query.id}/stories` },
    { label: '📅 Timeline', path: `/projects/${router.query.id}/timeline` },
    { label: '⚠️ Alertas', path: `/projects/${router.query.id}/alerts` },
    { label: '📚 Glossário', path: `/projects/${router.query.id}/glossary` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center h-16 px-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">DevFactory</h1>
          {project && (
            <div className="text-gray-600">
              <span className="text-lg">{project.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Layout - Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
          <nav className="p-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Back Button */}
          <div className="p-6 space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-left px-4 py-3 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              ← Todos os Projetos
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
