import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getProject } from '@/lib/api';
import AIPanel from '@/components/panels/AIPanel';
import ModeSelector from '@/components/ModelSelector';

interface ProjectData {
  id: string;
  name: string;
}

interface ProjectLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { id: 'overview',  icon: '⊞', label: 'Visão Geral', path: (id: string) => `/projects/${id}` },
  { id: 'progress',  icon: '◑', label: 'Progresso',   path: (id: string) => `/projects/${id}/progress` },
  { id: 'map',       icon: '◈', label: 'Mapa',         path: (id: string) => `/projects/${id}/map` },
  { id: 'stories',   icon: '▤', label: 'Stories',      path: (id: string) => `/projects/${id}/stories` },
  { id: 'timeline',  icon: '⋮', label: 'Timeline',     path: (id: string) => `/projects/${id}/timeline` },
  { id: 'alerts',    icon: '⚠', label: 'Alertas',      path: (id: string) => `/projects/${id}/alerts` },
  { id: 'glossary',  icon: '◎', label: 'Glossário',    path: (id: string) => `/projects/${id}/glossary` },
];

const pageLabels: Record<string, string> = {
  '/projects/[id]':          'Visão Geral',
  '/projects/[id]/progress': 'Progresso',
  '/projects/[id]/map':      'Mapa',
  '/projects/[id]/stories':  'Stories',
  '/projects/[id]/timeline': 'Timeline',
  '/projects/[id]/alerts':   'Alertas',
  '/projects/[id]/glossary': 'Glossário',
};

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (router.isReady) loadProject();
  }, [router.isReady, router.query.id]);

  const loadProject = async () => {
    try {
      const { id } = router.query;
      if (!id || typeof id !== 'string') return;
      const result = await getProject(id);
      if (result.success && result.data) setProject(result.data);
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const projectId = router.query.id as string | undefined;
  const currentLabel = pageLabels[router.pathname] ?? 'Projeto';

  const isActive = (path: string) => router.asPath === path;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, minWidth: 220,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--bg-border)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{
          padding: '18px 16px 14px',
          borderBottom: '1px solid var(--bg-border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, background: 'var(--accent)',
            borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white',
            flexShrink: 0,
          }}>D</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              DevFactory
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              v1.0 · MVP
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '4px 8px 8px' }}>
            Projeto
          </div>
          {navItems.map(item => {
            const href = projectId ? item.path(projectId) : '#';
            const active = isActive(href);
            return (
              <button
                key={item.id}
                onClick={() => router.push(href)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 13.5, fontWeight: active ? 600 : 500,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: active ? 'var(--accent-glow)' : 'transparent',
                  border: 'none',
                  borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  marginBottom: 1, transition: 'all 150ms', textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--bg-border)', padding: '10px 8px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 8, fontSize: 12.5,
              color: 'var(--text-secondary)', background: 'transparent',
              border: 'none', cursor: 'pointer', transition: 'all 150ms', textAlign: 'left',
              marginBottom: 6,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            ← Todos os Projetos
          </button>
          {project && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--status-done)', flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.name}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <div style={{
          height: 52, background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--bg-border)',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)' }}>
            <span>Projetos</span>
            <span style={{ color: 'var(--bg-border)' }}>/</span>
            {project && <span style={{ color: 'var(--text-secondary)' }}>{project.name}</span>}
            <span style={{ color: 'var(--bg-border)' }}>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currentLabel}</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ModeSelector />
            <button
              onClick={() => setIsPanelOpen(true)}
              className="df-btn-ghost"
              style={{ fontSize: 12 }}
            >
              💬 Chat IA
            </button>
          </div>
        </div>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {/* AI Panel */}
      {isPanelOpen && projectId && (
        <AIPanel
          projectId={projectId}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
        />
      )}
    </div>
  );
}
