import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import HexagonMap from '../components/HexagonMap';
import SidePanel from '../components/SidePanel';
import { HexagonData } from '../lib/hexagon';
import { Component } from '../components/ComponentsList';

export default function TestHexagonPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedHexagon, setSelectedHexagon] = useState<HexagonData | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Mock data with dependencies
  const mockData: HexagonData[] = [
    { id: '1', name: 'Autenticação', hierarchy: 'critico', progress: 85, description: 'Sistema de login e autenticação com JWT' },
    { id: '2', name: 'Dashboard', hierarchy: 'importante', progress: 60, description: 'Página inicial com visão geral do projeto' },
    { id: '3', name: 'Upload PRD', hierarchy: 'critico', progress: 100, description: 'Upload e armazenamento de documentos PRD' },
    { id: '4', name: 'Parser MD', hierarchy: 'importante', progress: 95, description: 'Parser de Markdown para estrutura JSON' },
    { id: '5', name: 'Tree Editor', hierarchy: 'necessario', progress: 90, description: 'Editor interativo de árvore de módulos' },
    { id: '6', name: 'Analytics', hierarchy: 'desejavel', progress: 30, description: 'Dashboard de análise de progresso' },
    { id: '7', name: 'Reports', hierarchy: 'opcional', progress: 10, description: 'Geração de relatórios em PDF' },
    { id: '8', name: 'D3 Hexagons', hierarchy: 'importante', progress: 100, description: 'Visualização de módulos em hexágonos D3.js' },
    { id: '9', name: 'Force Layout', hierarchy: 'critico', progress: 90, description: 'Simulação de força para layout dinâmico' },
    { id: '10', name: 'API REST', hierarchy: 'critico', progress: 95, description: 'Backend Express com rotas RESTful' },
  ];

  // Mock components for each module
  const mockComponentsByModuleId: Record<string, Component[]> = {
    '1': [
      { id: '1-1', name: 'Login Form', status: 'implemented' },
      { id: '1-2', name: 'JWT Token Handler', status: 'implemented' },
      { id: '1-3', name: 'Password Reset', status: 'partial' },
    ],
    '2': [
      { id: '2-1', name: 'Project List', status: 'implemented' },
      { id: '2-2', name: 'Project Stats', status: 'partial' },
      { id: '2-3', name: 'Recent Activities', status: 'pending' },
    ],
    '3': [
      { id: '3-1', name: 'File Upload', status: 'implemented' },
      { id: '3-2', name: 'File Validation', status: 'implemented' },
      { id: '3-3', name: 'Storage Integration', status: 'implemented' },
    ],
    '4': [
      { id: '4-1', name: 'Markdown Lexer', status: 'implemented' },
      { id: '4-2', name: 'Module Extractor', status: 'implemented' },
      { id: '4-3', name: 'Hierarchy Parser', status: 'partial' },
    ],
    '5': [
      { id: '5-1', name: 'Tree Component', status: 'implemented' },
      { id: '5-2', name: 'Node Editor', status: 'implemented' },
      { id: '5-3', name: 'Drag & Drop', status: 'partial' },
    ],
    '8': [
      { id: '8-1', name: 'Hexagon Generator', status: 'implemented' },
      { id: '8-2', name: 'Color Mapping', status: 'implemented' },
      { id: '8-3', name: 'Hover Effects', status: 'implemented' },
    ],
    '9': [
      { id: '9-1', name: 'Force Simulation', status: 'implemented' },
      { id: '9-2', name: 'Link Renderer', status: 'implemented' },
      { id: '9-3', name: 'Collision Detection', status: 'implemented' },
    ],
    '10': [
      { id: '10-1', name: 'Project Routes', status: 'implemented' },
      { id: '10-2', name: 'Module Routes', status: 'implemented' },
      { id: '10-3', name: 'Error Handling', status: 'partial' },
    ],
  };

  // Define dependencies (links)
  const mockLinks = [
    { source: '1', target: '2' }, // Auth → Dashboard
    { source: '1', target: '10' }, // Auth → API
    { source: '3', target: '4' }, // Upload → Parser
    { source: '4', target: '5' }, // Parser → TreeEditor
    { source: '2', target: '6' }, // Dashboard → Analytics
    { source: '8', target: '9' }, // Hexagons → Force
    { source: '10', target: '4' }, // API → Parser
    { source: '10', target: '2' }, // API → Dashboard
  ];

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hexagon Map Test</h1>
              <p className="text-gray-600 mt-1">STORY-012: Teste de renderização de hexágonos com progresso e cores</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Main Map */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <HexagonMap data={mockData} links={mockLinks} onHexagonClick={setSelectedHexagon} />
          </div>

          {/* Legend & Details */}
          <div className="space-y-4">
            {/* Legend */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Legenda</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                  <span>Crítico</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
                  <span>Importante</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span>Necessário</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                  <span>Desejável</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#9ca3af' }}></div>
                  <span>Opcional</span>
                </div>
              </div>
            </div>

            {/* Side Panel */}
            {selectedHexagon && (
              <SidePanel
                module={selectedHexagon}
                onClose={() => setSelectedHexagon(null)}
                components={mockComponentsByModuleId[selectedHexagon.id] || []}
              />
            )}
          </div>
        </div>

        {/* Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-900">STORY-012 Critérios de Aceite</h2>
          <ul className="mt-3 space-y-2 text-green-800 text-sm">
            <li>✅ Função `drawHexagon` em lib/hexagon.ts</li>
            <li>✅ Cada hexágono é grupo SVG (path + text + barra progresso)</li>
            <li>✅ Cores: Crítico (vermelho) | Importante (laranja) | Necessário (azul) | Desejável (verde) | Opcional (cinza)</li>
            <li>✅ Progresso visualizado como barra dentro hexágono</li>
            <li>✅ Hover: mudança de cor (highlight)</li>
            <li>✅ Click-ready: evento ao clicar no hexágono</li>
            <li>✅ Componente HexagonMap integrado com useD3</li>
            <li>✅ Force simulation para layout dinâmico</li>
            <li>✅ Zoom, pan, duplo-clique reset funcional</li>
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900">Instruções de Teste</h2>
          <ul className="mt-3 space-y-2 text-blue-800 text-sm">
            <li>🖱️ <strong>Clique em um hexágono:</strong> veja detalhes no painel direito</li>
            <li>🖱️ <strong>Hover:</strong> hexágono muda para cor mais clara</li>
            <li>🔍 <strong>Zoom:</strong> use scroll do mouse</li>
            <li>👆 <strong>Pan:</strong> arraste o fundo para mover</li>
            <li>🔄 <strong>Duplo-clique:</strong> reset da view</li>
            <li>📊 <strong>Progresso:</strong> barra dentro de cada hexágono</li>
            <li>🎨 <strong>Cores:</strong> vermelho=crítico, laranja=importante, azul=necessário, verde=desejável, cinza=opcional</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
