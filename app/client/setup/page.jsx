'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ClientSetup() {
  const [token, setToken] = useState(null)
  const [client, setClient] = useState(null)
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState('fr')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    setToken(t)
    if (t) fetchClient(t)
  }, [])

  async function fetchClient(t) {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('invite_token', t)
      .single()
    if (data) {
      setClient(data)
      setLanguage(data.language || 'fr')
      setEmail(data.email || '')
    }
    setLoading(false)
  }

  async function createAccount() {
    setSaving(true)
    setError('')
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { client_id: client.id, name: client.name }
      }
    })
    if (signUpError) {
      setError(signUpError.message)
      setSaving(false)
      return
    }
    await supabase.from('clients').update({
      invite_used: true,
      user_id: data.user?.id
    }).eq('id', client.id)
    setSaving(false)
    setStep(4)
  }

  const t = {
    fr: {
      welcome: 'Bienvenue',
      welcomeSub: 'Votre courtier vous a créé un accès à votre portail immobilier personnel.',
      chooseLang: 'Choisissez votre langue',
      langSub: 'Toutes vos communications seront dans cette langue.',
      next: 'Continuer',
      accountTitle: 'Créez votre accès',
      accountSub: 'Vous utiliserez ces informations pour vous connecter à votre portail.',
      emailLabel: 'Courriel',
      passwordLabel: 'Mot de passe',
      passwordHint: 'Minimum 6 caractères',
      create: 'Créer mon compte',
      creating: 'Création...',
      whatNext: 'Voici ce que vous verrez dans votre portail',
      feature1: 'Suivre chaque étape de votre transaction en temps réel',
      feature2: 'Voir toutes vos échéances importantes',
      feature3: 'Recevoir des rappels SMS automatiques',
      feature4: 'Communiquer directement avec votre courtier',
      doneTitle: 'Compte créé avec succès!',
      doneSub: 'Vérifiez votre courriel pour confirmer votre adresse, puis connectez-vous à votre portail.',
      goPortal: 'Accéder à mon portail',
    },
    en: {
      welcome: 'Welcome',
      welcomeSub: 'Your agent has created access to your personal real estate portal.',
      chooseLang: 'Choose your language',
      langSub: 'All your communications will be in this language.',
      next: 'Continue',
      accountTitle: 'Create your account',
      accountSub: 'You will use this information to log into your portal.',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      passwordHint: 'Minimum 6 characters',
      create: 'Create my account',
      creating: 'Creating...',
      whatNext: "Here's what you'll see in your portal",
      feature1: 'Track every step of your transaction in real time',
      feature2: 'See all your important deadlines',
      feature3: 'Receive automatic SMS reminders',
      feature4: 'Communicate directly with your agent',
      doneTitle: 'Account created successfully!',
      doneSub: 'Check your email to confirm your address, then log into your portal.',
      goPortal: 'Go to my portal',
    }
  }

  const tx = t[language]

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Chargement...</div>
    </div>
  )

  if (!client) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🔒</div>
        <div className="text-white font-medium mb-2">Lien invalide</div>
        <div className="text-gray-400 text-sm">Ce lien d'invitation est invalide ou a déjà été utilisé.</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Language toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button onClick={() => setLanguage('fr')} className={`px-4 py-1.5 text-sm transition ${language === 'fr' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>FR</button>
            <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 text-sm transition ${language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>EN</button>
          </div>
        </div>

        {/* Progress bar */}
        {step < 4 && (
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-blue-500' : 'bg-gray-800'}`} />
            ))}
          </div>
        )}

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🏠</div>
            <h1 className="text-2xl font-semibold text-white mb-2">{tx.welcome}, {client.name.split(' ')[0]}!</h1>
            <p className="text-gray-400 mb-8">{tx.welcomeSub}</p>
            {client.address && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8 text-left">
                <div className="text-xs text-gray-500 mb-1">Votre propriété</div>
                <div className="text-white font-medium text-sm">{client.address}</div>
                {client.price && <div className="text-blue-400 text-sm mt-0.5">{client.price}</div>}
              </div>
            )}
            <button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition">
              {tx.next} →
            </button>
          </div>
        )}

        {/* Step 2 — Language */}
        {step === 2 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🌐</div>
            <h1 className="text-2xl font-semibold text-white mb-2">{tx.chooseLang}</h1>
            <p className="text-gray-400 mb-8">{tx.langSub}</p>
            <div className="flex gap-3 mb-8">
              <button onClick={() => setLanguage('fr')} className={`flex-1 py-4 rounded-xl border-2 transition font-medium ${language === 'fr' ? 'border-blue-500 bg-blue-950 text-blue-300' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                🇫🇷 Français
              </button>
              <button onClick={() => setLanguage('en')} className={`flex-1 py-4 rounded-xl border-2 transition font-medium ${language === 'en' ? 'border-blue-500 bg-blue-950 text-blue-300' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                🇬🇧 English
              </button>
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition">
              {tx.next} →
            </button>
          </div>
        )}

        {/* Step 3 — Create account */}
        {step === 3 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔑</div>
              <h1 className="text-2xl font-semibold text-white mb-2">{tx.accountTitle}</h1>
              <p className="text-gray-400 text-sm">{tx.accountSub}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">{tx.whatNext}</div>
              {[tx.feature1, tx.feature2, tx.feature3, tx.feature4].map((f, i) => (
                <div key={i} className="flex items-center gap-3 mb-2 last:mb-0">
                  <div className="w-5 h-5 rounded-full bg-green-900 text-green-400 flex items-center justify-center text-xs flex-shrink-0">✓</div>
                  <div className="text-sm text-gray-300">{f}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{tx.emailLabel}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="marie@email.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{tx.passwordLabel}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={tx.passwordHint}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            {error && <div className="text-red-400 text-xs mb-3 bg-red-950 border border-red-900 rounded-lg px-3 py-2">{error}</div>}

            <button onClick={createAccount} disabled={!email || password.length < 6 || saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition">
              {saving ? tx.creating : tx.create}
            </button>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === 4 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✅</div>
            <h1 className="text-2xl font-semibold text-white mb-2">{tx.doneTitle}</h1>
            <p className="text-gray-400 mb-8">{tx.doneSub}</p>
            <a href="/client" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition">
              {tx.goPortal} →
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
