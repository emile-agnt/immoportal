import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white mb-2">ImmoPortal</h1>
        <p className="text-gray-400 mb-8">Plateforme de suivi immobilier</p>
        <div className="flex gap-4 justify-center">
          <Link href="/agent" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition">
            Dashboard Agent
          </Link>
          <Link href="/client" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition">
            Portail Client
          </Link>
        </div>
      </div>
    </main>
  )
}
