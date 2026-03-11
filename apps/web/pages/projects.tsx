import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import UploadForm from '@/components/UploadForm';
import Link from 'next/link';

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você precisa estar autenticado para acessar esta página.</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
            <div className="text-sm text-gray-600">
              Bem-vindo, <span className="font-semibold">{session?.user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <UploadForm
              onSuccess={(projectId) => {
                // Redirect to project detail page
                router.push(`/projects/${projectId}`);
              }}
            />
          </div>

          {/* Info Panel */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📖 Sobre Importação</h3>
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                <strong>O que é um PRD?</strong><br />
                Um Product Requirements Document (PRD) descreve os requisitos do seu projeto, módulos e funcionalidades.
              </p>
              <p>
                <strong>Formatos Suportados:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Markdown (.md)</li>
                  <li>Texto simples (.txt)</li>
                </ul>
              </p>
              <p>
                <strong>Próximo Passo:</strong><br />
                Após upload, você poderá validar e ajustar a estrutura extraída do seu PRD.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                <p className="text-blue-900">
                  <span className="font-semibold">💡 Dica:</span> Comece com um PRD bem estruturado para melhores resultados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-600">
          <p>DevFactory © 2026</p>
        </div>
      </footer>
    </div>
  );
}
