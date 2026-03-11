import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import D3Test from '../components/D3Test';

export default function TestD3Page() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">D3.js Setup Test</h1>
              <p className="text-gray-600 mt-1">STORY-011: Testando D3.js com force simulation, zoom, pan e drag</p>
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
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Test Component */}
        <div className="bg-white rounded-lg shadow p-6">
          <D3Test width={800} height={600} />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-blue-900">Instruções de Teste</h2>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>✅ <strong>Drag nodes:</strong> Arraste os círculos azuis com o mouse</li>
            <li>✅ <strong>Zoom:</strong> Use scroll do mouse para zoom in/out</li>
            <li>✅ <strong>Pan:</strong> Arraste o espaço vazio para mover a visualização</li>
            <li>✅ <strong>Force simulation:</strong> Nós devem se repelir e links devem manter distância</li>
            <li>✅ <strong>Labels:</strong> Cada nó tem label com id</li>
          </ul>
        </div>

        {/* Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-900">STORY-011 Status</h2>
          <ul className="mt-3 space-y-2 text-green-800 text-sm">
            <li>✅ D3.js v7+ instalado (`npm install d3 @types/d3`)</li>
            <li>✅ Hook `useD3.ts` criado (gerencia SVG ref e render)</li>
            <li>✅ Componente `D3Test.tsx` renderizando</li>
            <li>✅ Force simulation funcionando (nodes + links)</li>
            <li>✅ Zoom behavior implementado</li>
            <li>✅ Pan (drag on background) implementado</li>
            <li>✅ Drag nodes funciona</li>
            <li>✅ Sem erros no console (verificar F12)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
