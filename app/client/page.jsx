'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const stages = [
  { key: 'recherche', fr: 'Recherche de propriété', en: 'Property Search', icon: '🔍' },
  { key: 'offre', fr: 'Offre présentée', en: 'Offer Presented', icon: '📝' },
  { key: 'conditions', fr: 'Réalisation des conditions', en: 'Fulfilling Conditions', icon: '✅' },
  { key: 'inspection', fr: 'Inspection & financement', en: 'Inspection & Financing', icon: '🔬' },
  { key: 'notaire', fr: 'Passage chez le notaire', en: 'Notary Signing', icon: '🏛️' },
]

const t = {
  fr: {
    portal: 'Mon portail immobilier',
    hello: 'Bonjour',
    agent: 'Votre courtier',
    property: 'Votre propriété',
    currentStep: 'Étape actuelle',
    progress: 'Progression de votre dossier',
    deadlines: 'Vos échéances importantes',
    noDeadlines: 'Aucune échéance à venir',
    daysLeft: 'jours restants',
    today: "Aujourd'hui",
    overdue: 'jours dépassés',
    logout: 'Déconnexion',
    loading: 'Chargement...',
    notFound: 'Dossier introuvable. Contactez votre courtier.',
    deadlineLabels: {
      deadline_inspection: 'Inspection',
      deadline_financing: 'Financement',
      deadline_documents: 'Révision des documents',
      deadline_clauses: 'Autres clauses',
      deadline_deed: 'Acte de vente',
    }
  },
  en: {
    portal: 'My Real Estate Portal',
    hello: 'Hello',
    agent: 'Your agent',
    property: 'Your property',
    currentStep: 'Current step',
    progress: 'Your file progress',
    deadlines: 'Your important deadlines',
    noDeadlines: 'No upcoming deadlines',
    daysLeft: 'days remaining',
    today: 'Today',
    overdue: 'days overdue',
    logout: 'Sign out',
    loading: 'Loading...',
    notFound: 'File not found. Contact your agent.',
    deadlineLabels: {
      deadline_inspection: 'Inspection',
      deadline_financing: 'Financing',
      deadline_documents: 'Document Review',
      deadline_clauses: 'Other Clauses',
      deadline_deed: 'Deed of Sale',
    }
  }
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
}

export default function ClientPortal() {
  const [client, setClient] = useState(null)
  const [user, setUser] = useState(null)
  const [language, setLanguage] = useState('fr')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/client/login'
      return
    }
    setUser(user)
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) {
      setClient(data)
      setLanguage(data.language || 'fr')
    }
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/client/login'
  }

  const tx = t[language]

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400">{t.fr.loading}</div>
    </div>
  )

  if (!client) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-4xl mb-4">🏠</div>
        <div className="text-white font-medium mb-2">{tx.notFound}</div>
      </div>
    </div>
  )

  const deadlineKeys = ['deadline_inspection', 'deadline_financing', 'deadline_documents', 'deadline_clauses', 'deadline_deed']
  const deadlines = deadlineKeys
    .filter(k => client[k])
    .map(k => ({ label: tx.deadlineLabels[k], date: client[k], days: daysUntil(client[k]) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const currentStage = stages[client.stage] || stages[0]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <div className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">ImmoPortal</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button onClick={() => setLanguage('fr')} className={`px-3 py-1 text-xs transition ${language === 'fr' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>FR</button>
            <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-xs transition ${language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>EN</button>
          </div>
          <button onClick={logout} className="text-xs text-gray-500 hover:text-white transition">{tx.logout}</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-5 space-y-4">

        {/* Welcome */}
        <div className="bg-gradient-to-br from-blue-950 to-gray-900 border border-blue-900 rounded-2xl p-5">
          <div className="text-sm text-blue-400 mb-1">{tx.hello},</div>
          <div className="text-2xl font-semibold text-white mb-3">{client.name} 👋</div>
          {client.address && (
            <div className="bg-black bg-opacity-30 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-0.5">{tx.property}</div>
              <div className="text-sm text-white font-medium">{client.address}</div>
              {client.price && <div className="text-blue-400 text-sm">{client.price}</div>}
              {client.mls && <div className="text-xs text-gray-500 mt-1">MLS {client.mls}</div>}
            </div>
          )}
        </div>

        {/* Current step highlight */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">{tx.currentStep}</div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {currentStage.icon}
            </div>
            <div>
              <div className="font-semibold text-white">{language === 'fr' ? currentStage.fr : currentStage.en}</div>
              <div className="text-xs text-gray-400 mt-0.5">{tx.currentStep} {client.stage + 1} / {stages.length}</div>
            </div>
          </div>
        </div>

        {/* Progress stepper */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-4">{tx.progress}</div>
          <div className="space-y-3">
            {stages.map((s, i) => {
              const done = i < client.stage
              const active = i === client.stage
              const upcoming = i > client.stage
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition
                    ${done ? 'bg-green-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-900' : 'bg-gray-800 text-gray-600'}`}>
                    {done ? '✓' : s.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${done ? 'text-green-400' : active ? 'text-white' : 'text-gray-600'}`}>
                      {language === 'fr' ? s.fr : s.en}
                    </div>
                  </div>
                  {done && <span className="text-xs text-green-600">✓</span>}
                  {active && <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">En cours</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Deadlines */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">{tx.deadlines}</div>
          {deadlines.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">{tx.noDeadlines}</div>
          ) : (
            <div className="space-y-2">
              {deadlines.map(d => {
                const urgent = d.days !== null && d.days <= 3 && d.days >= 0
                const overdue = d.days !== null && d.days < 0
                const ok = d.days !== null && d.days > 3
                return (
                  <div key={d.label} className={`flex items-center justify-between p-3 rounded-xl border ${overdue ? 'bg-red-950 border-red-900' : urgent ? 'bg-amber-950 border-amber-900' : 'bg-gray-800 border-gray-700'}`}>
                    <div>
                      <div className={`text-sm font-medium ${overdue ? 'text-red-300' : urgent ? 'text-amber-300' : 'text-white'}`}>{d.label}</div>
                      <div className="text-xs text-gray-500">{d.date}</div>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-lg ${overdue ? 'bg-red-900 text-red-300' : urgent ? 'bg-amber-900 text-amber-300' : 'bg-gray-700 text-gray-300'}`}>
                      {d.days === 0 ? tx.today : d.days < 0 ? `${Math.abs(d.days)} ${tx.overdue}` : `${d.days} ${tx.daysLeft}`}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
