import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import HexagonMap from '../components/HexagonMap';
import { HexagonData } from '../lib/hexagon';

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

  // Mock data
  const mockData: HexagonData[] = [
    {
      id: '1',
      name: 'Autenticação',
      hierarchy: 'critico',
      progress: 85,
    },
    {
      id: '2',
      name: 'Dashboard',
      hierarchy: 'importante',
      progress: 60,
    },
    {
      id: '3',
      name: 'Upload PRD',
      hierarchy: 'critico',
      progress: 100,
    },
    {
      id: '4',
      name: 'Parser MD',
      hierarchy: 'importante',
      progress: 95,
    },
    {
      id: '5',
      name: 'Tree Editor',
      hierarchy: 'necessario',
      progress: 90,
    },
    {
      id: '6',
      name: 'Analytics',
      hierarchy: 'desejavel',
      progress: 30,
    },
    {
      id: '7',
      name: 'Reports',
      hierarchy: 'opcional',
      progress: 10,
    },
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
            <HexagonMap data={mockData} onHexagonClick={setSelectedHexagon} />
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

            {/* Details */}
            {selectedHexagon && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Detalhes</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Nome:</span>
                    <p className="text-gray-900">{selectedHexagon.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Hierarquia:</span>
                    <p className="text-gray-900 capitalize">{selectedHexagon.hierarchy}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Progresso:</span>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${selectedHexagon.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-900 mt-1">{selectedHexagon.progress}%</p>
                  </div>
                </div>
              </div>
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
