'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ClientLogin() {
  const [language, setLanguage] = useState('fr')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const t = {
    fr: {
      title: 'Accéder à mon portail',
      sub: 'Connectez-vous pour suivre votre transaction.',
      email: 'Courriel',
      password: 'Mot de passe',
      login: 'Se connecter',
      logging: 'Connexion...',
      error: 'Courriel ou mot de passe incorrect.',
    },
    en: {
      title: 'Access my portal',
      sub: 'Sign in to track your transaction.',
      email: 'Email',
      password: 'Password',
      login: 'Sign in',
      logging: 'Signing in...',
      error: 'Incorrect email or password.',
    }
  }

  const tx = t[language]

  async function login() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(tx.error)
      setLoading(false)
      return
    }
    window.location.href = '/client'
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Language toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button onClick={() => setLanguage('fr')} className={`px-4 py-1.5 text-sm transition ${language === 'fr' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>FR</button>
            <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 text-sm transition ${language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>EN</button>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="text-2xl mb-1">🏠</div>
          <h1 className="text-xl font-semibold text-white mb-1">ImmoPortal</h1>
          <p className="text-gray-400 text-sm">{tx.sub}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">{tx.email}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="marie@email.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">{tx.password}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && login()}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
          </div>

          {error && <div className="text-red-400 text-xs bg-red-950 border border-red-900 rounded-lg px-3 py-2">{error}</div>}

          <button onClick={login} disabled={!email || !password || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition">
            {loading ? tx.logging : tx.login}
          </button>
        </div>

      </div>
    </div>
  )
}
