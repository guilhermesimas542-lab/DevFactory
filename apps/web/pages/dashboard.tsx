import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">DevFactory</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bem-vindo!</h2>
            <p className="text-gray-600 mb-4">
              Dashboard do DevFactory. Aqui você poderá acompanhar o progresso dos seus projetos
              de software de forma visual e intuitiva.
            </p>
            <p className="text-sm text-gray-500">
              ✅ Autenticação configurada com NextAuth.js
            </p>
          </div>

          {/* Getting Started */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Passos</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Setup NextAuth.js</li>
              <li>✓ Página de login</li>
              <li>⏳ Importação de PRD</li>
              <li>⏳ Mapa hexagonal</li>
              <li>⏳ Análise de progresso</li>
            </ul>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Status da API</h2>
          <p className="text-gray-600 mb-4">
            A API backend está configurada em Express.js e pronta para conexão.
          </p>
          <p className="text-sm text-gray-500">
            Endpoint: http://localhost:5000/api/health
          </p>
        </div>
      </div>
    </div>
  )
}
