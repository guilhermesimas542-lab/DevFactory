import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getProject, extractArchitecture } from '@/lib/api';
import ProjectLayout from '@/components/layouts/ProjectLayout';
import HexagonMap from '@/components/HexagonMap';
import ArchitectureDrawer from '@/components/ArchitectureDrawer';
import ArchitectureModal from '@/components/ArchitectureModal';
import { HexagonData } from '@/lib/hexagon';
import { ModuleLink } from '@/lib/forceLayout';

interface ArchitectureNode {
  id: string;
  label: string;
  type: 'frontend' | 'backend' | 'database' | 'auth' | 'infra' | 'integration' | 'other';
  description: string;
  why: string;
  parentId: string | null;
  components: Array<{
    name: string;
    description: string;
    status: 'pending' | 'partial' | 'implemented';
  }>;
}

interface ArchitectureData {
  nodes: ArchitectureNode[];
  connections: Array<{
    from: string;
    to: string;
  }>;
}

type ViewMode = 'sub-hexagons' | 'drawer' | 'modal';

export default function MapPage() {
  const router = useRouter();
  const { status } = useSession();
  const [architecture, setArchitecture] = useState<ArchitectureData | null>(null);
  const [hexagons, setHexagons] = useState<HexagonData[]>([]);
  const [links, setLinks] = useState<ModuleLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('sub-hexagons');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [centerMapFn, setCenterMapFn] = useState<(() => void) | null>(null);

  // Load view mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mapViewMode') as ViewMode;
    if (saved && ['sub-hexagons', 'drawer', 'modal'].includes(saved)) {
      setViewMode(saved);
    }
  }, []);

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem('mapViewMode', viewMode);
  }, [viewMode]);

  // Load project data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (router.isReady && status === 'authenticated') {
      loadProject();
    }
  }, [router.isReady, status]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);

      const { id } = router.query;
      if (!id || typeof id !== 'string') {
        setError('Invalid project ID');
        return;
      }

      const result = await getProject(id);
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to load project');
        return;
      }

      // Check if modules have architecture data
      const hasArchitecture = result.data.modules?.some(m => (m as any).architecture_type);

      if (hasArchitecture) {
        // Transform existing modules to hexagon data
        transformModulesToHexagons(result.data.modules || []);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const transformModulesToHexagons = (modules: any[]) => {
    const hexagonsData: HexagonData[] = modules.map(m => ({
      id: m.id,
      name: m.name,
      hierarchy: (m as any).architecture_type || m.hierarchy || 'necessary',
      progress: Math.round(m.components?.filter((c: any) => c.status === 'implemented').length / Math.max(m.components?.length || 1, 1) * 100) || 0,
      description: m.description || '',
      x: undefined,
      y: undefined,
    }));

    const linksData: ModuleLink[] = modules
      .filter(m => m.parent_module_id)
      .map(m => ({
        source: m.parent_module_id,
        target: m.id,
      }));

    setHexagons(hexagonsData);
    setLinks(linksData);
  };

  const handleGenerateArchitecture = async () => {
    try {
      setGenerating(true);
      setError(null);

      const { id } = router.query;
      if (!id || typeof id !== 'string') {
        setError('Invalid project ID');
        return;
      }

      const result = await extractArchitecture(id);
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to generate architecture');
        return;
      }

      setArchitecture(result.data.architecture as ArchitectureData);

      // Transform architecture to hexagons
      const arch = result.data.architecture as any;
      const typeToHierarchy = (type: string): string => {
        const mapping: Record<string, string> = {
          'frontend': 'importante',
          'backend': 'critico',
          'database': 'critico',
          'auth': 'critico',
          'infra': 'importante',
          'integration': 'necessario',
          'other': 'desejavel',
        };
        return mapping[type] || 'necessario';
      };

      const hexagonsData: HexagonData[] = arch.nodes.map((node: any) => ({
        id: node.id,
        name: node.label,
        hierarchy: typeToHierarchy(node.type),
        progress: 50, // Default progress for new architecture
        description: node.description,
        x: undefined,
        y: undefined,
      }));

      const linksData: ModuleLink[] = arch.connections.map((conn: any) => ({
        source: conn.from,
        target: conn.to,
      }));

      setHexagons(hexagonsData);
      setLinks(linksData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* View Mode Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('sub-hexagons')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'sub-hexagons'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⬡ Sub-hexágonos
            </button>
            <button
              onClick={() => setViewMode('drawer')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'drawer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ▶ Drawer
            </button>
            <button
              onClick={() => setViewMode('modal')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'modal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⊞ Modal
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerateArchitecture}
              disabled={generating}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
            >
              {generating ? '⏳ Gerando...' : '🔄 Regenerar'}
            </button>
            <button
              onClick={() => centerMapFn && centerMapFn()}
              disabled={!centerMapFn}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
            >
              📌 Centralizar
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {/* Generate Button - if no architecture */}
        {!architecture && hexagons.length === 0 && !generating && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Gerar Mapa de Arquitetura
            </h2>
            <p className="text-gray-600 mb-6">
              O sistema vai analisar o PRD do seu projeto e gerar automaticamente um mapa visual da arquitetura técnica.
            </p>
            <button
              onClick={handleGenerateArchitecture}
              disabled={generating}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
            >
              {generating ? '⏳ Analisando PRD...' : '✨ Gerar Mapa com IA'}
            </button>
          </div>
        )}

        {/* Hexagon Map */}
        {hexagons.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <HexagonMap
              data={hexagons}
              links={links}
              width={1000}
              height={700}
              onHexagonClick={(node: HexagonData) => {
                setSelectedNodeId(node.id);
                if (viewMode === 'modal') {
                  // Modal will open automatically via state
                }
              }}
              onReady={(fn) => setCenterMapFn(() => fn)}
            />
          </div>
        )}
      </main>

      {/* Side Drawer */}
      {viewMode === 'drawer' && selectedNodeId && architecture && (
        <ArchitectureDrawer
          nodeId={selectedNodeId}
          nodes={architecture.nodes}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {/* Modal */}
      {viewMode === 'modal' && selectedNodeId && architecture && (
        <ArchitectureModal
          nodeId={selectedNodeId}
          nodes={architecture.nodes}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}

MapPage.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
