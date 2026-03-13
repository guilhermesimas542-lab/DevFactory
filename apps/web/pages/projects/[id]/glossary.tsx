import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getGlossaryTerms, createGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm, extractGlossaryTerms } from '@/lib/api';
import ProjectLayout from '@/components/layouts/ProjectLayout';

interface GlossaryTerm {
  id: string;
  project_id: string;
  term: string;
  definition: string;
  analogy: string | null;
  relevance: string | null;
  category: string;
  is_explored: boolean;
  created_at: string;
}

const CATEGORY_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  tecnologia: { icon: '⚙️', color: '#6366f1', label: 'Tecnologia' },
  arquitetura: { icon: '🏗️', color: '#8b5cf6', label: 'Arquitetura' },
  banco_de_dados: { icon: '🗄️', color: '#ec4899', label: 'Banco de Dados' },
  seguranca: { icon: '🔐', color: '#f97316', label: 'Segurança' },
  negocio: { icon: '💼', color: '#06b6d4', label: 'Negócio' },
  infraestrutura: { icon: '☁️', color: '#10b981', label: 'Infraestrutura' },
  geral: { icon: '📌', color: '#6b7280', label: 'Geral' },
};

export default function Glossary() {
  const router = useRouter();
  const { status } = useSession();
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newTerm, setNewTerm] = useState({ term: '', definition: '', analogy: '', relevance: '', category: 'geral' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (router.isReady && status === 'authenticated') loadTerms();
  }, [router.isReady, status]);

  const loadTerms = async () => {
    try {
      setLoading(true); setError(null);
      const { id } = router.query;
      if (!id || typeof id !== 'string') { setError('Invalid project ID'); return; }
      const result = await getGlossaryTerms(id);
      if (result.success && result.data) {
        const termsWithCategory = result.data.map(t => ({
          ...t,
          category: t.category || 'geral'
        }));
        setTerms(termsWithCategory);
      }
      else setError(result.error || 'Failed to load');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setLoading(false); }
  };

  const handleExtractTerms = async () => {
    const { id } = router.query;
    if (!id || typeof id !== 'string') return;
    try {
      setExtracting(true);
      setError(null);
      const result = await extractGlossaryTerms(id);
      if (result.success && result.data) {
        const { created, skipped } = result.data;
        setError(null);
        alert(`✓ ${created} termos adicionados, ${skipped} já existiam`);
        await loadTerms();
      } else {
        setError(result.error || 'Failed to extract terms');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract terms');
    } finally {
      setExtracting(false);
    }
  };

  const handleCreateTerm = async () => {
    if (!newTerm.term.trim() || !newTerm.definition.trim()) { setError('Termo e definição são obrigatórios'); return; }
    const { id } = router.query;
    if (!id || typeof id !== 'string') return;
    try {
      const result = await createGlossaryTerm({ projectId: id, term: newTerm.term, definition: newTerm.definition, analogy: newTerm.analogy || undefined, relevance: newTerm.relevance || undefined, category: newTerm.category });
      if (result.success) { setNewTerm({ term: '', definition: '', analogy: '', relevance: '', category: 'geral' }); setShowForm(false); setError(null); await loadTerms(); }
      else setError(result.error || 'Failed to create');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
  };

  const handleToggleExplored = async (termId: string, isExplored: boolean) => {
    try {
      const result = await updateGlossaryTerm(termId, { isExplored: !isExplored });
      if (result.success) await loadTerms();
      else setError(result.error || 'Failed');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
  };

  const handleDeleteTerm = async (termId: string) => {
    if (!confirm('Deletar este termo?')) return;
    try {
      const result = await deleteGlossaryTerm(termId);
      if (result.success) await loadTerms();
      else setError(result.error || 'Failed');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
  };

  const filtered = terms.filter(t =>
    t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByCategory = filtered.reduce((acc, term) => {
    const category = term.category || 'geral';
    if (!acc[category]) acc[category] = [];
    acc[category].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  const sortedCategories = Object.keys(groupedByCategory).sort((a, b) => {
    const categoryOrder = ['tecnologia', 'arquitetura', 'banco_de_dados', 'seguranca', 'negocio', 'infraestrutura', 'geral'];
    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
  });

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="df-spinner" />
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>Carregando glossário...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 28px' }}>

      {/* Toolbar */}
      <div className="animate-fade-up animate-delay-1" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginBottom: 24 }}>
        <button onClick={handleExtractTerms} disabled={extracting} className="df-btn-primary" style={{ opacity: extracting ? 0.6 : 1 }}>
          {extracting ? '⏳ Analisando...' : '✨ Auto-gerar com IA'}
        </button>
        <button onClick={() => setShowForm(!showForm)} className="df-btn-primary">
          + Novo Termo
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--status-alert)' }}>
          ⚠ {error}
        </div>
      )}

      {/* Stats */}
      <div className="animate-fade-up animate-delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',        value: terms.length,                         color: 'var(--text-primary)' },
          { label: 'Explorados',   value: terms.filter(t => t.is_explored).length, color: 'var(--status-done)' },
          { label: 'Pendentes',    value: terms.filter(t => !t.is_explored).length, color: 'var(--status-progress)' },
        ].map((s, i) => (
          <div key={i} className="df-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* New term form */}
      {showForm && (
        <div className="df-card animate-fade-up" style={{ marginBottom: 20 }}>
          <div className="df-card-header">
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Novo Termo</span>
          </div>
          <div className="df-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="text" placeholder="Termo (ex: API)" value={newTerm.term} onChange={e => setNewTerm({ ...newTerm, term: e.target.value })} className="df-input" />
            <textarea placeholder="Definição" value={newTerm.definition} onChange={e => setNewTerm({ ...newTerm, definition: e.target.value })} rows={3} className="df-input" style={{ resize: 'vertical' }} />
            <textarea placeholder="Analogia (ex: Uma API é como um garçom...)" value={newTerm.analogy} onChange={e => setNewTerm({ ...newTerm, analogy: e.target.value })} rows={2} className="df-input" style={{ resize: 'vertical' }} />
            <input type="text" placeholder="Relevância (ex: Crítico, Importante)" value={newTerm.relevance} onChange={e => setNewTerm({ ...newTerm, relevance: e.target.value })} className="df-input" />
            <select value={newTerm.category} onChange={e => setNewTerm({ ...newTerm, category: e.target.value })} className="df-input">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.icon} {config.label}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreateTerm} className="df-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Criar</button>
              <button onClick={() => setShowForm(false)} className="df-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="animate-fade-up animate-delay-3" style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Buscar por termo ou definição..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="df-input"
        />
      </div>

      {/* Terms grouped by category */}
      <div className="animate-fade-up animate-delay-3">
        {filtered.length === 0 ? (
          <div className="df-card" style={{ padding: '36px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {searchTerm ? 'Nenhum termo encontrado' : 'Nenhum termo no glossário ainda'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {sortedCategories.map(categoryKey => {
              const config = CATEGORY_CONFIG[categoryKey];
              const categoryTerms = groupedByCategory[categoryKey];
              return (
                <div key={categoryKey}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${config.color}20` }}>
                    <span style={{ fontSize: 18 }}>{config.icon}</span>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{config.label}</h2>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>({categoryTerms.length})</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                    {categoryTerms.map(term => (
                      <div key={term.id} className="df-card" style={{ opacity: term.is_explored ? 0.65 : 1, transition: 'opacity 200ms', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 4, wordBreak: 'break-word' }}>{term.term}</h3>
                              {term.relevance && (
                                <span style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 6px', borderRadius: 3, backgroundColor: term.relevance === 'Crítico' ? 'rgba(239,68,68,0.1)' : term.relevance === 'Importante' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', color: term.relevance === 'Crítico' ? '#ef4444' : term.relevance === 'Importante' ? '#f59e0b' : '#22c55e' }}>
                                  {term.relevance}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                              <button
                                onClick={() => handleDeleteTerm(term.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 14, padding: '2px 4px', transition: 'color 150ms' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--status-alert)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
                              >
                                🗑
                              </button>
                            </div>
                          </div>

                          <div style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 6, marginBottom: term.analogy ? 8 : 8 }}>
                            <p style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>{term.definition}</p>
                          </div>

                          {term.analogy && (
                            <div style={{ padding: '8px 10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, marginBottom: 8 }}>
                              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', margin: '0 0 4px 0' }}>💡 Analogia</p>
                              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{term.analogy}</p>
                            </div>
                          )}

                          <button
                            onClick={() => handleToggleExplored(term.id, term.is_explored)}
                            className={term.is_explored ? 'df-badge df-badge-done' : 'df-badge df-badge-pending'}
                            style={{ border: 'none', cursor: 'pointer', width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                          >
                            {term.is_explored ? '✓ Explorado' : '○ Explorar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

Glossary.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
