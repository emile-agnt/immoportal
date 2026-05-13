'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const stages = ["Recherche", "Offre", "Conditions", "Inspection", "Notaire"]

export default function AgentDashboard() {
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    price: '', mls: '', stage: 0, type: 'acheteur', language: 'fr', notes: ''
  })

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  async function saveClient() {
    setSaving(true)
    await supabase.from('clients').insert([form])
    setForm({ name: '', email: '', phone: '', address: '', price: '', mls: '', stage: 0, type: 'acheteur', language: 'fr', notes: '' })
    setShowForm(false)
    await fetchClients()
    setSaving(false)
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const colors = ['bg-blue-900 text-blue-300', 'bg-amber-900 text-amber-300', 'bg-purple-900 text-purple-300', 'bg-green-900 text-green-300', 'bg-red-900 text-red-300']

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">ImmoPortal</span>
          <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full">Agent</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-gray-400 hover:text-white">FR</button>
          <span className="text-gray-600">|</span>
          <button className="text-sm text-gray-400 hover:text-white">EN</button>
          <div className="w-8 h-8 rounded-full bg-green-900 text-green-300 flex items-center justify-center text-xs font-medium ml-2">JT</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 flex gap-6">
        {["Dossiers", "Inscriptions", "Centris", "Calendrier", "Mise à jour hebdo", "SMS / GHL"].map((tab, i) => (
          <button key={tab} className={`py-3 text-sm border-b-2 transition ${i === 0 ? "border-blue-500 text-white font-medium" : "border-transparent text-gray-400 hover:text-white"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Clients actifs", value: clients.length.toString() },
            { label: "Acheteurs", value: clients.filter(c => c.type === 'acheteur').length.toString() },
            { label: "Vendeurs", value: clients.filter(c => c.type === 'vendeur').length.toString() },
            { label: "Sans MLS", value: clients.filter(c => !c.mls).length.toString(), warn: true },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">{s.label}</div>
              <div className={`text-2xl font-semibold ${s.warn ? "text-amber-400" : "text-white"}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Suivi des dossiers clients</div>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">
            + Nouveau client
          </button>
        </div>

        {/* Add client form */}
        {showForm && (
          <div className="bg-gray-900 border border-blue-800 rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-medium">Nouveau client</div>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nom complet', key: 'name', placeholder: 'Marie Bouchard' },
                { label: 'Courriel', key: 'email', placeholder: 'marie@email.com' },
                { label: 'Téléphone', key: 'phone', placeholder: '514-555-0100' },
                { label: 'Adresse de la propriété', key: 'address', placeholder: '4782 rue des Érables, Laval' },
                { label: 'Prix', key: 'price', placeholder: '549 000$' },
                { label: 'Numéro MLS', key: 'mls', placeholder: '27084512' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="acheteur">Acheteur</option>
                  <option value="vendeur">Vendeur</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Étape</label>
                <select value={form.stage} onChange={e => setForm({ ...form, stage: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                  {stages.map((s, i) => <option key={s} value={i}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Langue</label>
                <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notes internes..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 h-16 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={saveClient} disabled={!form.name || saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
                {saving ? 'Enregistrement...' : 'Enregistrer le client'}
              </button>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg border border-gray-700 transition">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Client list */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">Chargement...</div>
        ) : clients.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="text-4xl mb-3">🏠</div>
            <div className="font-medium mb-1">Aucun client pour l'instant</div>
            <div className="text-sm">Cliquez sur "+ Nouveau client" pour commencer</div>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((c, idx) => (
              <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colors[idx % colors.length]}`}>
                  {getInitials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.address} {c.price && `· ${c.price}`}</div>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500">MLS:</span>
                    {c.mls ? (
                      <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full">{c.mls}</span>
                    ) : (
                      <span className="text-xs bg-amber-900 text-amber-300 px-2 py-0.5 rounded-full">À connecter</span>
                    )}
                    <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full">{c.type}</span>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{c.language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    {stages.map((s, i) => (
                      <div key={s} className={`w-2.5 h-2.5 rounded-full ${i < c.stage ? "bg-green-500" : i === c.stage ? "bg-blue-500" : "bg-gray-700"}`} title={s} />
                    ))}
                    <span className="text-xs text-blue-400 ml-1">{stages[c.stage]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
