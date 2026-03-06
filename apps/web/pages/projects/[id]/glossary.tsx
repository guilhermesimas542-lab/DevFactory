import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getGlossaryTerms, createGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm } from '@/lib/api';

interface GlossaryTerm {
  id: string;
  project_id: string;
  term: string;
  definition: string;
  analogy: string | null;
  relevance: string | null;
  is_explored: boolean;
  created_at: string;
}

export default function Glossary() {
  const router = useRouter();
  const { status } = useSession();
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newTerm, setNewTerm] = useState({ term: '', definition: '', analogy: '', relevance: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (router.isReady && status === 'authenticated') {
      loadTerms();
    }
  }, [router.isReady, status]);

  const loadTerms = async () => {
    try {
      setLoading(true);
      setError(null);

      const { id } = router.query;

      if (!id || typeof id !== 'string') {
        setError('Invalid project ID');
        return;
      }

      const result = await getGlossaryTerms(id);

      if (result.success && result.data) {
        setTerms(result.data);
      } else {
        setError(result.error || 'Failed to load terms');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTerm = async () => {
    try {
      if (!newTerm.term.trim() || !newTerm.definition.trim()) {
        setError('Termo e definição são obrigatórios');
        return;
      }

      const { id } = router.query;
      if (!id || typeof id !== 'string') return;

      const result = await createGlossaryTerm({
        projectId: id,
        term: newTerm.term,
        definition: newTerm.definition,
        analogy: newTerm.analogy || undefined,
        relevance: newTerm.relevance || undefined,
      });

      if (result.success) {
        setNewTerm({ term: '', definition: '', analogy: '', relevance: '' });
        setShowForm(false);
        setError(null);
        await loadTerms();
      } else {
        setError(result.error || 'Failed to create term');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    }
  };

  const handleToggleExplored = async (termId: string, currentlyExplored: boolean) => {
    try {
      const result = await updateGlossaryTerm(termId, {
        isExplored: !currentlyExplored,
      });

      if (result.success) {
        await loadTerms();
      } else {
        setError(result.error || 'Failed to update term');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    }
  };

  const handleDeleteTerm = async (termId: string) => {
    if (!confirm('Tem certeza que quer deletar este termo?')) return;

    try {
      const result = await deleteGlossaryTerm(termId);

      if (result.success) {
        await loadTerms();
      } else {
        setError(result.error || 'Failed to delete term');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    }
  };

  const filteredTerms = terms.filter(t =>
    t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unexploredCount = terms.filter(t => !t.is_explored).length;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Carregando glossário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Glossário Técnico</h1>
              <p className="text-gray-600 mt-2">Aprenda sobre os conceitos do seu projeto</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              + Novo Termo
            </button>
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
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 font-medium">Total de Termos</p>
            <p className="text-3xl font-bold text-gray-900">{terms.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 font-medium">Explorados</p>
            <p className="text-3xl font-bold text-green-600">{terms.filter(t => t.is_explored).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 font-medium">Não Explorados</p>
            <p className="text-3xl font-bold text-orange-600">{unexploredCount}</p>
          </div>
        </div>

        {/* New Term Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Novo Termo</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Termo (ex: API)"
                value={newTerm.term}
                onChange={e => setNewTerm({ ...newTerm, term: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Definição"
                value={newTerm.definition}
                onChange={e => setNewTerm({ ...newTerm, definition: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Analogia (ex: Uma API é como um garçom em um restaurante..."
                value={newTerm.analogy}
                onChange={e => setNewTerm({ ...newTerm, analogy: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Relevância (ex: Crítico, Importante, Utilitário)"
                value={newTerm.relevance}
                onChange={e => setNewTerm({ ...newTerm, relevance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateTerm}
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

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Procurar por termo ou definição..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Terms List */}
        {filteredTerms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'Nenhum termo encontrado' : 'Nenhum termo no glossário ainda'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTerms.map(term => (
              <div
                key={term.id}
                className={`border rounded-lg p-6 transition-all ${
                  term.is_explored
                    ? 'bg-green-50 border-green-200 opacity-75'
                    : 'bg-white border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{term.term}</h3>
                    {term.relevance && (
                      <p className="text-xs text-gray-600 mt-1">📌 {term.relevance}</p>
                    )}
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleToggleExplored(term.id, term.is_explored)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        term.is_explored
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {term.is_explored ? '✓ Explorado' : 'Não Explorado'}
                    </button>
                    <button
                      onClick={() => handleDeleteTerm(term.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Definition */}
                <div className="bg-gray-50 rounded p-3 mb-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Definição:</p>
                  <p className="text-gray-900">{term.definition}</p>
                </div>

                {/* Analogy */}
                {term.analogy && (
                  <div className="bg-blue-50 rounded p-3 border border-blue-200">
                    <p className="text-sm font-medium text-blue-700 mb-1">💡 Analogia:</p>
                    <p className="text-gray-900">{term.analogy}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push(`/projects/${router.query.id}`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            ← Voltar para Detalhes
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
