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

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="df-card" style={{ marginBottom: 16 }}>
      <div className="df-card-header">
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      <div className="df-card-body">{children}</div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
        {label}
      </div>
      <p style={{ fontSize: 13.5, color: 'var(--text-primary)', fontFamily: mono ? 'var(--font-mono)' : undefined }}>
        {value}
      </p>
    </div>
  );
}

export default function ProjectDetail() {
  const router = useRouter();
  const { status } = useSession();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showPRDModal, setShowPRDModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeMessage, setAnalyzeMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (router.isReady && status === 'authenticated') loadProject();
  }, [router.isReady, status]);

  const loadProject = async () => {
    try {
      setLoading(true); setError(null);
      const { id } = router.query;
      if (!id || typeof id !== 'string') { setError('Invalid project ID'); return; }
      const result = await getProject(id);
      if (result.success && result.data) {
        setProject(result.data);
        setRepoUrl(result.data.github_repo_url || '');
      } else {
        setError(result.error || 'Failed to load project');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR');
  const formatSize = (b: number) => {
    if (!b) return '0 B';
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return `${(b / Math.pow(1024, i)).toFixed(1)} ${['B','KB','MB'][i]}`;
  };

  const handleSaveGitHub = async () => {
    if (!project) return;
    try {
      setIsSaving(true);
      const result = await updateProject(project.id, { github_repo_url: repoUrl || undefined });
      if (result.success) {
        setProject({ ...project, github_repo_url: repoUrl || null });
        setSyncMessage('✓ Repositório configurado!');
        setTimeout(() => setSyncMessage(null), 3000);
      } else setError(result.error || 'Erro ao salvar');
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro'); }
    finally { setIsSaving(false); }
  };

  const handleAnalyze = async () => {
    if (!project) return;
    try {
      setIsAnalyzing(true); setAnalyzeMessage(null);
      const result = await analyzeProject(project.id);
      if (result.success && result.data) {
        setAnalyzeMessage(`✓ ${Object.keys(result.data.moduleProgress).length} módulos analisados, ${result.data.patternsFound} padrões.`);
        setTimeout(() => setAnalyzeMessage(null), 8000);
      } else setError(result.error || 'Erro na análise');
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro'); }
    finally { setIsAnalyzing(false); }
  };

  const handleSyncGitHub = async () => {
    if (!project) return;
    try {
      setIsSyncing(true); setSyncMessage(null);
      const result = await syncProjectGitHub(project.id);
      if (result.success && result.data) {
        setSyncMessage(`✓ ${result.data.stories_updated.length} stories atualizadas`);
        setProject({ ...project, github_last_sync: result.data.synced_at });
        setTimeout(() => setSyncMessage(null), 5000);
      } else setError(result.error || 'Erro ao sincronizar');
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro'); }
    finally { setIsSyncing(false); }
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="df-spinner" />
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 16 }}>
        <div className="df-card" style={{ maxWidth: 400, width: '100%', padding: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--status-alert)', marginBottom: 12 }}>Erro</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{error || 'Projeto não encontrado'}</p>
          <button onClick={() => router.push('/projects')} className="df-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 28px', maxWidth: 760 }}>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--status-alert)' }}>
          ⚠ {error}
        </div>
      )}

      {/* Project info */}
      <InfoCard title="Informações do Projeto">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Nome" value={project.name} />
          <Field label="Descrição" value={project.description || 'Sem descrição'} />
          <Field label="ID" value={project.id} mono />
          <Field label="Criado em" value={formatDate(project.created_at)} />
        </div>
      </InfoCard>

      {/* PRD info */}
      {project.prd_original && (
        <InfoCard title="Documento Importado">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Arquivo" value={project.prd_original.originalFileName} />
            <Field label="Importado em" value={formatDate(project.prd_original.uploadedAt)} />
            <Field label="Tamanho" value={formatSize(project.prd_original.fileSize)} />
            <Field label="Tipo" value={project.prd_original.mimeType} />
          </div>
          <div style={{ padding: 12, background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', lineHeight: 1.6, marginBottom: 14, maxHeight: 80, overflow: 'hidden' }}>
            {project.prd_original.rawContent.substring(0, 280)}
            {project.prd_original.rawContent.length > 280 && '...'}
          </div>
          <button onClick={() => setShowPRDModal(true)} className="df-btn-ghost">
            Ver PRD Completo
          </button>
        </InfoCard>
      )}

      {/* Code analysis */}
      <InfoCard title="Análise de Código">
        {!project.github_repo_url ? (
          <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--status-progress)' }}>
            Configure um repositório GitHub abaixo para habilitar a análise.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Analisa o código no repositório GitHub e atualiza o progresso de cada módulo.
            </p>
            <button onClick={handleAnalyze} disabled={isAnalyzing} className="df-btn-primary" style={{ alignSelf: 'flex-start' }}>
              {isAnalyzing ? '⏳ Analisando... (1-2 min)' : '🔍 Analisar Código'}
            </button>
            {analyzeMessage && (
              <div style={{ padding: '8px 12px', background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--accent)' }}>
                {analyzeMessage}
              </div>
            )}
          </div>
        )}
      </InfoCard>

      {/* GitHub sync */}
      <InfoCard title="Sincronização GitHub">
        {!repoUrl && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, fontSize: 13, color: 'var(--accent)' }}>
            Configure um repositório para sincronizar stories via commits.
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="https://github.com/usuario/repo"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            className="df-input"
            style={{ flex: 1 }}
          />
          <button
            onClick={handleSaveGitHub}
            disabled={isSaving || repoUrl === (project.github_repo_url || '')}
            className="df-btn-primary"
          >
            {isSaving ? '⏳' : 'Salvar'}
          </button>
        </div>

        {project.github_repo_url && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Última Sync</div>
                <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  {project.github_last_sync ? formatDate(project.github_last_sync) : 'Nunca'}
                </p>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Status</div>
                <span className="df-badge df-badge-done">Configurado</span>
              </div>
            </div>
            <button onClick={handleSyncGitHub} disabled={isSyncing} className="df-btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              {isSyncing ? '⏳ Sincronizando...' : '↺ Sincronizar Agora'}
            </button>
          </div>
        )}

        {syncMessage && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--status-done)' }}>
            {syncMessage}
          </div>
        )}
      </InfoCard>

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
