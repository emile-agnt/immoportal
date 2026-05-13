'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const stages = ["Recherche", "Offre", "Conditions", "Inspection", "Notaire"]
const colors = ['bg-blue-900 text-blue-300', 'bg-amber-900 text-amber-300', 'bg-purple-900 text-purple-300', 'bg-green-900 text-green-300', 'bg-red-900 text-red-300']

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}

function DeadlineBadge({ label, date }) {
  if (!date) return null
  const days = daysUntil(date)
  const color = days < 0 ? 'bg-red-900 text-red-300' : days <= 3 ? 'bg-amber-900 text-amber-300' : 'bg-blue-900 text-blue-300'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
      {label}: {days < 0 ? `${Math.abs(days)}j dépassé` : days === 0 ? "Aujourd'hui" : `${days}j`}
    </span>
  )
}

export default function AgentDashboard() {
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [updatingStage, setUpdatingStage] = useState(null)

  const emptyForm = {
    name: '', email: '', phone: '', address: '', price: '', mls: '',
    stage: 0, type: 'acheteur', language: 'fr', notes: '',
    deadline_inspection: '', deadline_financing: '',
    deadline_documents: '', deadline_clauses: '', deadline_deed: ''
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditingClient(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(client) {
    setEditingClient(client)
    setForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      price: client.price || '',
      mls: client.mls || '',
      stage: client.stage || 0,
      type: client.type || 'acheteur',
      language: client.language || 'fr',
      notes: client.notes || '',
      deadline_inspection: client.deadline_inspection || '',
      deadline_financing: client.deadline_financing || '',
      deadline_documents: client.deadline_documents || '',
      deadline_clauses: client.deadline_clauses || '',
      deadline_deed: client.deadline_deed || ''
    })
    setShowForm(true)
  }

  async function saveClient() {
    setSaving(true)
    const payload = { ...form }
    Object.keys(payload).forEach(k => {
      if (k.startsWith('deadline_') && payload[k] === '') payload[k] = null
    })
    if (editingClient) {
      await supabase.from('clients').update(payload).eq('id', editingClient.id)
    } else {
      await supabase.from('clients').insert([payload])
    }
    setForm(emptyForm)
    setShowForm(false)
    setEditingClient(null)
    await fetchClients()
    setSaving(false)
  }

  async function updateStage(client, newStage) {
    if (newStage < 0 || newStage >= stages.length) return
    setUpdatingStage(client.id)
    await supabase.from('clients').update({ stage: newStage }).eq('id', client.id)
    await fetchClients()
    setUpdatingStage(null)
  }

  async function deleteClient(id) {
    if (!confirm('Supprimer ce client?')) return
    setDeleting(id)
    await supabase.from('clients').delete().eq('id', id)
    await fetchClients()
    setDeleting(null)
  }

  function generateCalendarUrls(client) {
    return [
      { label: 'Inspection', date: client.deadline_inspection },
      { label: 'Financement', date: client.deadline_financing },
      { label: 'Révision des documents', date: client.deadline_documents },
      { label: 'Autres clauses', date: client.deadline_clauses },
      { label: 'Acte de vente', date: client.deadline_deed },
    ]
      .filter(e => e.date)
      .map(e => {
        const start = e.date.replace(/-/g, '')
        const title = encodeURIComponent(`${e.label} — ${client.name}`)
        const details = encodeURIComponent(`Dossier: ${client.address}`)
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}&details=${details}`
      })
  }

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

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Suivi des dossiers clients</div>
          <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">
            + Nouveau client
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-900 border border-blue-800 rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-medium">{editingClient ? 'Modifier le client' : 'Nouveau client'}</div>
              <button onClick={() => { setShowForm(false); setEditingClient(null) }} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>

            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Informations client</div>
            <div className="grid grid-cols-2 gap-3 mb-4">
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
                <label className="text-xs text-gray-400 mb-1 block">Étape actuelle</label>
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
                <label className="text-xs text-gray-400 mb-1 block">Notes internes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notes visibles seulement par l'agent..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 h-16 resize-none" />
              </div>
            </div>

            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Échéances</div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Inspection', key: 'deadline_inspection' },
                { label: 'Financement', key: 'deadline_financing' },
                { label: 'Révision des documents', key: 'deadline_documents' },
                { label: 'Autres clauses', key: 'deadline_clauses' },
                { label: 'Acte de vente (notaire)', key: 'deadline_deed' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                  <input
                    type="date"
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={saveClient} disabled={!form.name || saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
                {saving ? 'Enregistrement...' : editingClient ? 'Mettre à jour' : 'Enregistrer'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingClient(null) }} className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg border border-gray-700 transition">
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
            {clients.map((c, idx) => {
              return (
                <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition">
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colors[idx % colors.length]}`}>
                      {getInitials(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{c.address} {c.price && `· ${c.price}`}</div>
                      {c.email && <div className="text-xs text-gray-500 mt-0.5">{c.email} {c.phone && `· ${c.phone}`}</div>}
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {c.mls ? (
                          <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full">MLS {c.mls}</span>
                        ) : (
                          <span className="text-xs bg-amber-900 text-amber-300 px-2 py-0.5 rounded-full">MLS à connecter</span>
                        )}
                        <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full">{c.type}</span>
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{c.language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}</span>
                      </div>

                      {/* Stage updater */}
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => updateStage(c, c.stage - 1)} disabled={c.stage === 0 || updatingStage === c.id}
                          className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 text-xs flex items-center justify-center transition">
                          ‹
                        </button>
                        {stages.map((s, i) => (
                          <button key={s} onClick={() => updateStage(c, i)} disabled={updatingStage === c.id}
                            title={s}
                            className={`w-3 h-3 rounded-full transition ${i < c.stage ? "bg-green-500 hover:bg-green-400" : i === c.stage ? "bg-blue-500 ring-2 ring-blue-300" : "bg-gray-700 hover:bg-gray-500"}`} />
                        ))}
                        <button onClick={() => updateStage(c, c.stage + 1)} disabled={c.stage === stages.length - 1 || updatingStage === c.id}
                          className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 text-xs flex items-center justify-center transition">
                          ›
                        </button>
                        <span className="text-xs text-blue-400">{stages[c.stage]}</span>
                        {updatingStage === c.id && <span className="text-xs text-gray-500">...</span>}
                      </div>

                      {/* Deadlines */}
                      {(c.deadline_inspection || c.deadline_financing || c.deadline_documents || c.deadline_clauses || c.deadline_deed) && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <DeadlineBadge label="Inspection" date={c.deadline_inspection} />
                          <DeadlineBadge label="Financement" date={c.deadline_financing} />
                          <DeadlineBadge label="Documents" date={c.deadline_documents} />
                          <DeadlineBadge label="Clauses" date={c.deadline_clauses} />
                          <DeadlineBadge label="Acte de vente" date={c.deadline_deed} />
                        </div>
                      )}

                      {c.notes && <div className="text-xs text-gray-500 mt-1 italic">"{c.notes}"</div>}
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(c)}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition">
                        Modifier
                      </button>
                      {generateCalendarUrls(c).length > 0 && (
  <div className="relative group">
    <button className="text-xs bg-blue-950 hover:bg-blue-900 text-blue-300 px-3 py-1.5 rounded-lg transition text-center w-full">
      + Calendrier ({generateCalendarUrls(c).length})
    </button>
    <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden z-10 hidden group-hover:block min-w-40">
      {[
        { label: 'Inspection', date: c.deadline_inspection },
        { label: 'Financement', date: c.deadline_financing },
        { label: 'Documents', date: c.deadline_documents },
        { label: 'Clauses', date: c.deadline_clauses },
        { label: 'Acte de vente', date: c.deadline_deed },
      ].filter(e => e.date).map(e => {
        const start = e.date.replace(/-/g, '')
        const title = encodeURIComponent(`${e.label} — ${c.name}`)
        const details = encodeURIComponent(`Dossier: ${c.address}`)
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}&details=${details}`
        return (
          <a key={e.label} href={url} target="_blank" rel="noopener noreferrer"
            className="block px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition">
            📅 {e.label} — {e.date}
          </a>
        )
      })}
    </div>
  </div>
)}
                      <button onClick={() => deleteClient(c.id)} disabled={deleting === c.id}
                        className="text-xs bg-red-950 hover:bg-red-900 text-red-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        {deleting === c.id ? '...' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
