import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getGlossaryTerms, createGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm } from '@/lib/api';
import ProjectLayout from '@/components/layouts/ProjectLayout';

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
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (router.isReady && status === 'authenticated') loadTerms();
  }, [router.isReady, status]);

  const loadTerms = async () => {
    try {
      setLoading(true); setError(null);
      const { id } = router.query;
      if (!id || typeof id !== 'string') { setError('Invalid project ID'); return; }
      const result = await getGlossaryTerms(id);
      if (result.success && result.data) setTerms(result.data);
      else setError(result.error || 'Failed to load');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setLoading(false); }
  };

  const handleCreateTerm = async () => {
    if (!newTerm.term.trim() || !newTerm.definition.trim()) { setError('Termo e definição são obrigatórios'); return; }
    const { id } = router.query;
    if (!id || typeof id !== 'string') return;
    try {
      const result = await createGlossaryTerm({ projectId: id, term: newTerm.term, definition: newTerm.definition, analogy: newTerm.analogy || undefined, relevance: newTerm.relevance || undefined });
      if (result.success) { setNewTerm({ term: '', definition: '', analogy: '', relevance: '' }); setShowForm(false); setError(null); await loadTerms(); }
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
      <div className="animate-fade-up animate-delay-1" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
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

      {/* Terms */}
      <div className="animate-fade-up animate-delay-3">
        {filtered.length === 0 ? (
          <div className="df-card" style={{ padding: '36px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {searchTerm ? 'Nenhum termo encontrado' : 'Nenhum termo no glossário ainda'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(term => (
              <div key={term.id} className="df-card" style={{ opacity: term.is_explored ? 0.65 : 1, transition: 'opacity 200ms' }}>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 3 }}>{term.term}</h3>
                      {term.relevance && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-code)' }}>📌 {term.relevance}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                      <button
                        onClick={() => handleToggleExplored(term.id, term.is_explored)}
                        className={term.is_explored ? 'df-badge df-badge-done' : 'df-badge df-badge-pending'}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        {term.is_explored ? '✓ Explorado' : 'Explorar'}
                      </button>
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

                  <div style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 6, marginBottom: term.analogy ? 8 : 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Definição</p>
                    <p style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.6 }}>{term.definition}</p>
                  </div>

                  {term.analogy && (
                    <div style={{ padding: '10px 12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: 4 }}>💡 Analogia</p>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{term.analogy}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

Glossary.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
