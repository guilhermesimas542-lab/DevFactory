export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-gray-900 mb-4">
          DevFactory
        </h1>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-8 max-w-2xl">
          Dashboard interativo para acompanhar visualmente o progresso de projetos de software
        </p>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Começar
          </button>
          <button className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:border-gray-500 transition">
            Documentação
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-12">
          ✅ Next.js 14 + TypeScript + Tailwind CSS
        </p>
      </div>
    </main>
  )
}
