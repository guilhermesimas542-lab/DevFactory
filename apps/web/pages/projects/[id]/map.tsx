import { useEffect, useState } from 'react';
import { useModel } from '@/contexts/ModelContext';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { extractArchitecture } from '@/lib/api';
import ProjectLayout from '@/components/layouts/ProjectLayout';
import ArchitectureMap, { ArchNode, ArchEdge } from '@/components/ArchitectureMap';

// Mock data for testing
const MOCK_NODES: ArchNode[] = [
  {
    id: 'root',
    type: 'root',
    x: 340,
    y: 280,
    name: 'DevFactory',
    subtype: 'SaaS · Node.js + PostgreSQL',
    pct: 72,
    status: 'progress',
    desc: 'Plataforma web que ajuda a entender a arquitetura de qualquer projeto. Você importa um documento de requisitos → DevFactory analisa automaticamente o código do GitHub → mostra um mapa visual interativo com blocos coloridos (cada cor = tipo diferente: banco de dados, autenticação, etc) → você explora com mouse/zoom para entender como cada parte se conecta.',
    tags: ['Next.js', 'Express', 'PostgreSQL', 'D3.js'],
    components: [],
  },
  {
    id: 'frontend',
    type: 'frontend',
    x: 80,
    y: 100,
    name: 'Dashboard',
    subtype: 'Next.js 16 · React 19',
    pct: 85,
    status: 'progress',
    desc: 'O que o usuário vê no navegador. Construído com React (componentes reutilizáveis = blocos de LEGO de interface) e Next.js (framework que conecta React ao servidor). TypeScript verifica erros antes de rodar. D3.js desenha o mapa interativo com hexágonos. Tailwind estiliza tudo com classes CSS prontas.',
    tags: ['Next.js', 'Tailwind', 'TypeScript', 'D3.js'],
    components: [
      { name: 'ProjectLayout', status: 'done' },
      { name: 'ArchitectureMap', status: 'done' },
      { name: 'AIPanel', status: 'done' },
      { name: 'StoryBoard', status: 'progress' },
    ],
  },
  {
    id: 'backend',
    type: 'backend',
    x: 620,
    y: 100,
    name: 'API Server',
    subtype: 'Express.js 5 · TypeScript',
    pct: 80,
    status: 'progress',
    desc: 'O "servidor" que fica rodando nos bastidores. Quando Dashboard pede algo (exemplo: "me dá a lista de projects"), API Server entrega. Express é o framework que organiza essas requisições em Rotas (tipo endereços: /projects, /stories, /chat). TypeScript verifica se os dados que chegam/saem estão no formato correto. Fala com IA (Groq/Gemini) para análises complexas.',
    tags: ['Express', 'Prisma', 'REST', 'TypeScript'],
    components: [
      { name: 'Routes /projects', status: 'done' },
      { name: 'Routes /stories', status: 'done' },
      { name: 'Routes /chat', status: 'done' },
      { name: 'Architecture Extractor', status: 'done' },
    ],
  },
  {
    id: 'database',
    type: 'database',
    x: 80,
    y: 460,
    name: 'PostgreSQL',
    subtype: 'Railway · Prisma ORM',
    pct: 95,
    status: 'done',
    desc: 'Guarda todos os dados que você cria (tipo pasta gigante com arquivos bem organizados). PostgreSQL é o software que gerencia essa pasta. Prisma é um "tradutor" entre código JavaScript e linguagem do banco = você escreve normal, Prisma converte. Railway é a nuvem que hospeda esse banco. Tem 9 tabelas: Usuários, Projetos, Módulos, Componentes, Stories, Alertas, Resultados, Snapshots, Glossário.',
    tags: ['PostgreSQL', 'Prisma', 'Railway', 'Schema Migration'],
    components: [
      { name: 'Schema migrations', status: 'done' },
      { name: 'ActivityLog model', status: 'done' },
    ],
  },
  {
    id: 'auth',
    type: 'auth',
    x: 620,
    y: 460,
    name: 'Autenticação',
    subtype: 'NextAuth.js 5 · JWT',
    pct: 100,
    status: 'done',
    desc: 'Sistema que verifica quem você é. O usuário entra email/senha → DevFactory gera um JWT (cartão identificação digital) → esse cartão é enviado em toda requisição para provar identidade. NextAuth gerencia esse processo; Middleware valida o cartão antes de deixar acessar páginas protegidas.',
    tags: ['NextAuth', 'JWT', 'Session', 'Credentials'],
    components: [
      { name: 'Credentials provider', status: 'done' },
      { name: 'Session middleware', status: 'done' },
    ],
  },
  {
    id: 'integration',
    type: 'integration',
    x: 340,
    y: 560,
    name: 'AI Models',
    subtype: 'Groq + Gemini · LLM Integration',
    pct: 90,
    status: 'progress',
    desc: 'Conexão com inteligências artificiais externas que ajudam a entender código. Groq (rápido = 2 segundos) = usado para análise inicial; Gemini (profundo = mais lento) = análise detalhada. Você escolhe qual IA usar através do seletor na interface. LLM = Large Language Model (modelo grande de linguagem = IA treinada com internet inteira).',
    tags: ['Groq', 'Gemini', 'LLM', 'AI', 'Multi-provider'],
    components: [
      { name: 'Groq Provider', status: 'done' },
      { name: 'Gemini Provider', status: 'done' },
      { name: 'Model Selector UI', status: 'done' },
    ],
  },
];

const MOCK_EDGES: ArchEdge[] = [
  { from: 'root', to: 'frontend', direction: 'unilateral' },
  { from: 'root', to: 'backend', direction: 'unilateral' },
  { from: 'root', to: 'database', direction: 'unilateral' },
  { from: 'root', to: 'auth', direction: 'unilateral' },
  { from: 'root', to: 'integration', direction: 'unilateral' },
  { from: 'backend', to: 'database', direction: 'unilateral' },
  { from: 'backend', to: 'integration', direction: 'unilateral' },
];

export default function MapPage() {
  const router = useRouter();
  const { selectedModel, autoMode } = useModel();
  const { status } = useSession();
  const [nodes, setNodes] = useState<ArchNode[]>(MOCK_NODES);
  const [edges, setEdges] = useState<ArchEdge[]>(MOCK_EDGES);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (router.isReady && status === 'authenticated') {
      // Start with mock data, user can generate if needed
      setLoading(false);
    }
  }, [router.isReady, status, router]);

  const handleGenerateArchitecture = async () => {
    try {
      setGenerating(true);
      setError(null);

      const { id } = router.query;
      if (!id || typeof id !== 'string') {
        setError('Invalid project ID');
        return;
      }

      const provider = autoMode ? undefined : selectedModel;
      const result = await extractArchitecture(id, provider);

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to generate architecture');
        return;
      }

      const arch = result.data as any;

      // Transform API nodes to ArchNode format
      const transformedNodes: ArchNode[] = arch.nodes.map((node: any) => ({
        id: node.id,
        type: node.type || 'integration',
        x: node.x || Math.random() * 600,
        y: node.y || Math.random() * 600,
        name: node.label || node.name,
        subtype: node.subtype || 'Module',
        pct: node.pct || 50,
        status: (node.status || 'progress') as 'done' | 'progress' | 'pending',
        desc: node.description || node.why || '',
        tags: node.tags || [],
        components: node.components || [],
      }));

      const transformedEdges: ArchEdge[] = arch.connections.map((conn: any) => ({
        from: conn.from,
        to: conn.to,
      }));

      setNodes(transformedNodes);
      setEdges(transformedEdges);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)', background: '#0D0D0F' }}>
      {/* Top Bar */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        background: '#16161A',
        zIndex: 50,
      }}>
        <button
          onClick={handleGenerateArchitecture}
          disabled={generating}
          style={{
            padding: '6px 12px',
            background: generating ? '#6B7280' : '#6366F1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: generating ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            transition: 'background 150ms',
          }}
        >
          {generating ? '⏳ Gerando...' : '✨ Gerar com IA'}
        </button>

        {error && (
          <div style={{ color: '#EF4444', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* Map Canvas - Full Width/Height */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <ArchitectureMap nodes={nodes} edges={edges} />
      </div>
    </div>
  );
}

MapPage.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
