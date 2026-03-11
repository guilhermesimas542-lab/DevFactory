import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { getProjects, deleteProject } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  description: string | null;
  github_repo_url: string | null;
  created_at: string;
  _count: { modules: number };
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') loadProjects();
  }, [status]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProjects();
      if (result.success && result.data) {
        setProjects(result.data);
      } else {
        setError(result.error || 'Failed to load projects');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Tem certeza que quer deletar este projeto?')) return;
    try {
      setDeletingId(projectId);
      const result = await deleteProject(projectId);
      if (result.success) {
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        setError(result.error || 'Failed to delete');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="df-spinner" />
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Topbar */}
      <header style={{
        height: 56, background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--bg-border)',
        display: 'flex', alignItems: 'center', padding: '0 28px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: 'var(--accent)', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white',
          }}>D</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>DevFactory</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            {session?.user?.name}
          </span>
          <Link href="/projects" className="df-btn-primary" style={{ textDecoration: 'none' }}>
            + Novo Projeto
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

        {/* Page header */}
        <div className="animate-fade-up animate-delay-1" style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Bem-vindo de volta, {session?.user?.name}
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--status-alert)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Stats row */}
        {projects.length > 0 && (
          <div className="animate-fade-up animate-delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Projetos', value: projects.length, color: 'var(--accent)' },
              { label: 'Com GitHub', value: projects.filter(p => p.github_repo_url).length, color: 'var(--status-done)' },
              { label: 'Módulos Totais', value: projects.reduce((s, p) => s + (p._count?.modules || 0), 0), color: 'var(--type-frontend)' },
            ].map((s, i) => (
              <div key={i} className="df-card" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && !error && (
          <div className="animate-fade-up animate-delay-2" style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Nenhum projeto ainda
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Comece importando seu primeiro documento PRD
            </p>
            <Link href="/projects" className="df-btn-primary" style={{ textDecoration: 'none' }}>
              Importar PRD
            </Link>
          </div>
        )}

        {/* Projects grid */}
        {projects.length > 0 && (
          <div className="animate-fade-up animate-delay-3">
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 12 }}>
              Projetos
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {projects.map(project => (
                <div key={project.id} className="df-card" style={{ cursor: 'pointer', overflow: 'hidden' }}>
                  {/* Card top stripe */}
                  <div style={{ height: 3, background: 'var(--accent)' }} />

                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        {project.name}
                      </h3>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 8, flexShrink: 0 }}>
                        {formatDate(project.created_at)}
                      </span>
                    </div>

                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                      {project.description || 'Sem descrição'}
                    </p>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4 }}>
                        {project._count?.modules || 0} módulos
                      </span>
                      {project.github_repo_url ? (
                        <span className="df-badge df-badge-done">GitHub</span>
                      ) : (
                        <span className="df-badge df-badge-pending">Sem GitHub</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link
                        href={`/projects/${project.id}`}
                        className="df-btn-primary"
                        style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', padding: '6px 12px' }}
                      >
                        Ver Projeto
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deletingId === project.id}
                        className="df-btn-ghost"
                        style={{ padding: '6px 12px', borderColor: 'rgba(239,68,68,0.3)', color: 'var(--status-alert)' }}
                      >
                        {deletingId === project.id ? '...' : '🗑'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
