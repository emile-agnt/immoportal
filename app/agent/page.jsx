'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const defaultBuyerFlow = [
  {id:1,icon:"🤝",fr:"Première rencontre",en:"First meeting"},
  {id:2,icon:"🔍",fr:"Recherche de propriétés",en:"Property search"},
  {id:3,icon:"🏠",fr:"Visites",en:"Showings"},
  {id:4,icon:"📝",fr:"Offre soumise",en:"Offer made"},
  {id:5,icon:"❌",fr:"Offre refusée",en:"Offer rejected",skippable:true},
  {id:6,icon:"🔄",fr:"Contre-offre",en:"Counter offer",skippable:true},
  {id:7,icon:"✅",fr:"Offre acceptée",en:"Offer accepted"},
  {id:8,icon:"🔬",fr:"Inspection",en:"Inspection",skippable:true},
  {id:9,icon:"📄",fr:"Révision des documents",en:"Document review"},
  {id:10,icon:"🏦",fr:"Financement",en:"Financing",skippable:true},
  {id:11,icon:"🏛️",fr:"Notaire",en:"Notary"}
]

const defaultSellerFlow = [
  {id:1,icon:"🤝",fr:"Première rencontre",en:"First meeting"},
  {id:2,icon:"📊",fr:"Évaluation du bien",en:"Property evaluation"},
  {id:3,icon:"📸",fr:"Photos & mise en marché",en:"Photos & listing"},
  {id:4,icon:"🏠",fr:"Visites",en:"Showings"},
  {id:5,icon:"📝",fr:"Offre reçue",en:"Offer received"},
  {id:6,icon:"❌",fr:"Offre refusée",en:"Offer rejected",skippable:true},
  {id:7,icon:"🔄",fr:"Contre-offre",en:"Counter offer",skippable:true},
  {id:8,icon:"✅",fr:"Offre acceptée",en:"Offer accepted"},
  {id:9,icon:"📄",fr:"Révision des documents",en:"Document review"},
  {id:10,icon:"🏛️",fr:"Notaire",en:"Notary"}
]

function getInitials(name) {
  return name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / (1000*60*60*24))
}

function DeadlineBadge({label, date}) {
  if (!date) return null
  const days = daysUntil(date)
  const color = days < 0 ? 'bg-red-900 text-red-300' : days <= 3 ? 'bg-amber-900 text-amber-300' : 'bg-blue-900 text-blue-300'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
      {label}: {days < 0 ? `${Math.abs(days)}j dépassé` : days === 0 ? "Auj." : `${days}j`}
    </span>
  )
}

function ContractExpiry({date, label}) {
  if (!date) return null
  const days = daysUntil(date)
  const color = days < 0 ? 'bg-red-900 text-red-300 border-red-800' : days <= 7 ? 'bg-amber-900 text-amber-300 border-amber-800' : 'bg-gray-800 text-gray-300 border-gray-700'
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${color} text-xs`}>
      <span>📋</span>
      <span>{label}: {days < 0 ? `Expiré (${Math.abs(days)}j)` : days === 0 ? "Expire aujourd'hui" : `${days}j restants`}</span>
    </div>
  )
}

function FlowEditor({flow, onSave, onClose}) {
  const [steps, setSteps] = useState(flow.map(s => ({...s})))
  const [newStep, setNewStep] = useState('')

  function toggleSkippable(id) {
    setSteps(steps.map(s => s.id === id ? {...s, skippable: !s.skippable} : s))
  }
  function removeStep(id) {
    setSteps(steps.filter(s => s.id !== id))
  }
  function addStep() {
    if (!newStep.trim()) return
    setSteps([...steps, {id: Date.now(), icon: '📌', fr: newStep, en: newStep, skippable: false}])
    setNewStep('')
  }
  function moveStep(idx, dir) {
    const arr = [...steps]
    const target = idx + dir
    if (target < 0 || target >= arr.length) return
    ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
    setSteps(arr)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="font-semibold text-white">Modifier le flux</div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>
        <div className="p-5 space-y-2">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
              <span className="text-lg">{s.icon}</span>
              <span className="flex-1 text-sm text-white">{s.fr}</span>
              {s.skippable && <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">Optionnel</span>}
              <button onClick={() => toggleSkippable(s.id)} className="text-xs text-gray-500 hover:text-blue-400 transition px-1">
                {s.skippable ? '🔒' : '🔓'}
              </button>
              <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="text-gray-600 hover:text-white disabled:opacity-30 text-xs px-1">↑</button>
              <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length-1} className="text-gray-600 hover:text-white disabled:opacity-30 text-xs px-1">↓</button>
              <button onClick={() => removeStep(s.id)} className="text-red-600 hover:text-red-400 text-xs px-1">✕</button>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <input value={newStep} onChange={e => setNewStep(e.target.value)}
              placeholder="Nouvelle étape..."
              onKeyDown={e => e.key === 'Enter' && addStep()}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
            <button onClick={addStep} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition">+ Ajouter</button>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-800">
          <button onClick={() => onSave(steps)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition">Enregistrer</button>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm px-4 py-2.5 rounded-xl border border-gray-700 transition">Annuler</button>
        </div>
      </div>
    </div>
  )
}

function VerticalStepper({steps, currentStep, onStepClick}) {
  return (
    <div className="space-y-1">
      {steps.map((s, i) => {
        const done = s.status === 'done'
        const active = i === currentStep
        const waived = s.status === 'waived'
        const upcoming = !done && !active && !waived
        return (
          <button key={s.id} onClick={() => onStepClick(i)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left group ${active ? 'bg-blue-950 border border-blue-800' : 'hover:bg-gray-800 border border-transparent'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition
              ${done ? 'bg-green-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-900' : waived ? 'bg-gray-800 text-gray-600' : 'bg-gray-800 text-gray-500'}`}>
              {done ? '✓' : waived ? '—' : s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium truncate ${done ? 'text-green-400' : active ? 'text-white' : waived ? 'text-gray-600 line-through' : 'text-gray-400'}`}>
                {s.fr}
              </div>
            </div>
            {active && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full flex-shrink-0">En cours</span>}
            {waived && <span className="text-xs text-gray-600 flex-shrink-0">Renoncé</span>}
            {s.skippable && upcoming && <span className="text-xs text-gray-700 flex-shrink-0 opacity-0 group-hover:opacity-100">optionnel</span>}
          </button>
        )
      })}
    </div>
  )
}

export default function AgentDashboard() {
  const [clients, setClients] = useState([])
  const [agentProfile, setAgentProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [expandedClient, setExpandedClient] = useState(null)
  const [editingFlow, setEditingFlow] = useState(null)
  const [inviteLinks, setInviteLinks] = useState({})
  const [copiedId, setCopiedId] = useState(null)
  const [activeTab, setActiveTab] = useState('dossiers')
  const [brandColor, setBrandColor] = useState('#185FA5')

  const emptyForm = {
    name:'', email:'', phone:'', address:'', price:'', mls:'',
    agent_email:'', stage:0, type:'acheteur', language:'fr', notes:'',
    deadline_inspection:'', deadline_financing:'', deadline_documents:'',
    deadline_clauses:'', deadline_deed:'', contract_expiry:'',
    custom_flow: null
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{data: clientData}, {data: profileData}] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', {ascending: false}),
      supabase.from('agent_profiles').select('*').limit(1).single()
    ])
    setClients(clientData || [])
    if (profileData) {
      setAgentProfile(profileData)
      setBrandColor(profileData.brand_color || '#185FA5')
    }
    setLoading(false)
  }

  function getClientFlow(client) {
    if (client.custom_flow) return client.custom_flow
    if (client.type === 'vendeur') return agentProfile?.default_seller_flow || defaultSellerFlow
    return agentProfile?.default_buyer_flow || defaultBuyerFlow
  }

  function getCurrentStepIndex(client) {
    return client.current_step_index || 0
  }

  async function updateStepStatus(client, stepIdx, status) {
    const flow = getClientFlow(client).map((s, i) => {
      if (i === stepIdx) return {...s, status}
      return s
    })
    let newCurrentIdx = client.current_step_index || 0
    if (status === 'done' && stepIdx === newCurrentIdx) {
      newCurrentIdx = Math.min(stepIdx + 1, flow.length - 1)
    }
    await supabase.from('clients').update({
      custom_flow: flow,
      current_step_index: newCurrentIdx
    }).eq('id', client.id)
    await loadData()
  }

  async function saveFlow(client, newFlow) {
    await supabase.from('clients').update({custom_flow: newFlow}).eq('id', client.id)
    setEditingFlow(null)
    await loadData()
  }

  function openAdd() {
    setEditingClient(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(client) {
    setEditingClient(client)
    setForm({
      name: client.name||'', email: client.email||'', phone: client.phone||'',
      address: client.address||'', price: client.price||'', mls: client.mls||'',
      agent_email: client.agent_email||'', stage: client.stage||0,
      type: client.type||'acheteur', language: client.language||'fr',
      notes: client.notes||'',
      deadline_inspection: client.deadline_inspection||'',
      deadline_financing: client.deadline_financing||'',
      deadline_documents: client.deadline_documents||'',
      deadline_clauses: client.deadline_clauses||'',
      deadline_deed: client.deadline_deed||'',
      contract_expiry: client.contract_expiry||'',
      custom_flow: client.custom_flow||null
    })
    setShowForm(true)
  }

  async function saveClient() {
    setSaving(true)
    const payload = {...form}
    Object.keys(payload).forEach(k => {
      if ((k.startsWith('deadline_') || k === 'contract_expiry') && payload[k] === '') payload[k] = null
    })
    if (!payload.custom_flow) {
      payload.custom_flow = (payload.type === 'vendeur' ? defaultSellerFlow : defaultBuyerFlow)
        .map(s => ({...s, status: 'pending'}))
    }
    if (editingClient) {
      await supabase.from('clients').update(payload).eq('id', editingClient.id)
    } else {
      await supabase.from('clients').insert([payload])
    }
    setForm(emptyForm)
    setShowForm(false)
    setEditingClient(null)
    await loadData()
    setSaving(false)
  }

  async function deleteClient(id) {
    if (!confirm('Supprimer ce client?')) return
    setDeleting(id)
    await supabase.from('clients').delete().eq('id', id)
    await loadData()
    setDeleting(null)
  }

  async function generateInviteLink(clientId) {
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({clientId})
    })
    const data = await res.json()
    if (data.inviteUrl) setInviteLinks(prev => ({...prev, [clientId]: data.inviteUrl}))
  }

  const colors = ['bg-blue-900 text-blue-300','bg-amber-900 text-amber-300','bg-purple-900 text-purple-300','bg-green-900 text-green-300','bg-red-900 text-red-300']

  const tabs = [
    {id:'dossiers', label:'Dossiers'},
    {id:'inscriptions', label:'Inscriptions'},
    {id:'centris', label:'Centris'},
    {id:'calendrier', label:'Calendrier'},
    {id:'hebdo', label:'Mise à jour hebdo'},
    {id:'sms', label:'SMS / GHL'},
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{backgroundColor: brandColor}}>I</div>
          <span className="text-base font-semibold text-white">ImmoPortal</span>
          <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full">Agent</span>
        </div>
        <div className="flex items-center gap-3">
          {agentProfile && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium"
                style={{backgroundColor: brandColor + '40', color: brandColor}}>
                {getInitials(agentProfile.name || 'Agent')}
              </div>
              <span className="text-xs text-gray-400">{agentProfile.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Agent banner */}
      {agentProfile && (
        <div className="px-6 py-4 border-b border-gray-800" style={{background: `linear-gradient(135deg, ${brandColor}20, ${brandColor}05)`}}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                style={{backgroundColor: brandColor}}>
                {getInitials(agentProfile.name || 'A')}
              </div>
              <div>
                <div className="font-semibold text-white">{agentProfile.name}</div>
                <div className="text-xs text-gray-400">{agentProfile.brokerage} · {agentProfile.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={brandColor}
                onChange={async e => {
                  setBrandColor(e.target.value)
                  await supabase.from('agent_profiles').update({brand_color: e.target.value}).eq('id', agentProfile.id)
                }}
                className="w-8 h-8 rounded-lg border border-gray-700 cursor-pointer bg-transparent"
                title="Couleur de marque" />
              <span className="text-xs text-gray-500">Couleur</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-900 border-b border-gray-800 px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm border-b-2 transition ${activeTab === tab.id ? 'border-blue-500 text-white font-medium' : 'border-transparent text-gray-400 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'dossiers' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                {label:'Clients actifs', value: clients.length},
                {label:'Acheteurs', value: clients.filter(c=>c.type==='acheteur').length},
                {label:'Vendeurs', value: clients.filter(c=>c.type==='vendeur').length},
                {label:'Contrats expirant bientôt', value: clients.filter(c => c.contract_expiry && daysUntil(c.contract_expiry) <= 30 && daysUntil(c.contract_expiry) >= 0).length, warn: true},
              ].map(s => (
                <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">{s.label}</div>
                  <div className={`text-2xl font-semibold ${s.warn ? 'text-amber-400' : 'text-white'}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Suivi des dossiers</div>
              <button onClick={openAdd} className="text-white text-sm px-4 py-2 rounded-lg transition font-medium"
                style={{backgroundColor: brandColor}}>
                + Nouveau client
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <div className="bg-gray-900 border border-blue-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="font-semibold">{editingClient ? 'Modifier le client' : 'Nouveau client'}</div>
                  <button onClick={() => {setShowForm(false); setEditingClient(null)}} className="text-gray-500 hover:text-white text-xl">×</button>
                </div>

                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Informations client</div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    {label:'Nom complet', key:'name', placeholder:'Marie Bouchard'},
                    {label:'Courriel', key:'email', placeholder:'marie@email.com'},
                    {label:'Téléphone', key:'phone', placeholder:'514-555-0100'},
                    {label:'Adresse de la propriété', key:'address', placeholder:'4782 rue des Érables, Laval'},
                    {label:'Prix', key:'price', placeholder:'549 000$'},
                    {label:'Numéro MLS', key:'mls', placeholder:'27084512'},
                    {label:"Courriel de l'agent", key:'agent_email', placeholder:'agent@email.com'},
                  ].map(f => (
                    <div key={f.key} className={f.key === 'address' ? 'col-span-2' : ''}>
                      <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                      <input value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                        placeholder={f.placeholder}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Type</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                      <option value="acheteur">Acheteur</option>
                      <option value="vendeur">Vendeur</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Langue</label>
                    <select value={form.language} onChange={e => setForm({...form, language: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Contrat & échéances</div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="col-span-1">
                    <label className="text-xs text-gray-400 mb-1 block">Expiration du contrat</label>
                    <input type="date" value={form.contract_expiry} onChange={e => setForm({...form, contract_expiry: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  {[
                    {label:'Inspection', key:'deadline_inspection'},
                    {label:'Financement', key:'deadline_financing'},
                    {label:'Révision documents', key:'deadline_documents'},
                    {label:'Autres clauses', key:'deadline_clauses'},
                    {label:'Acte de vente', key:'deadline_deed'},
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                      <input type="date" value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Notes internes</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                    placeholder="Notes visibles seulement par l'agent..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 h-16 resize-none mb-4" />
                </div>

                <div className="flex gap-3">
                  <button onClick={saveClient} disabled={!form.name || saving}
                    className="text-white px-6 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
                    style={{backgroundColor: brandColor}}>
                    {saving ? 'Enregistrement...' : editingClient ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                  <button onClick={() => {setShowForm(false); setEditingClient(null)}}
                    className="text-gray-400 hover:text-white text-sm px-4 py-2.5 rounded-xl border border-gray-700 transition">
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Client list */}
            {loading ? (
              <div className="text-center text-gray-500 py-12">Chargement...</div>
            ) : clients.length === 0 ? (
              <div className="text-center text-gray-500 py-16 bg-gray-900 border border-gray-800 rounded-2xl">
                <div className="text-5xl mb-4">🏠</div>
                <div className="font-medium text-white mb-1">Aucun client pour l'instant</div>
                <div className="text-sm mb-4">Ajoutez votre premier client pour commencer</div>
                <button onClick={openAdd} className="text-white px-5 py-2 rounded-lg text-sm transition"
                  style={{backgroundColor: brandColor}}>+ Nouveau client</button>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((c, idx) => {
                  const flow = getClientFlow(c)
                  const currentIdx = getCurrentStepIndex(c)
                  const isExpanded = expandedClient === c.id
                  const contractDays = daysUntil(c.contract_expiry)

                  return (
                    <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition">
                      {/* Client header */}
                      <div className="p-4 flex items-start gap-4 cursor-pointer" onClick={() => setExpandedClient(isExpanded ? null : c.id)}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${colors[idx % colors.length]}`}>
                          {getInitials(c.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-white">{c.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${c.type === 'acheteur' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'}`}>{c.type}</span>
                            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{c.language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
                            {c.mls && <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full">MLS {c.mls}</span>}
                            {!c.mls && <span className="text-xs bg-amber-900 text-amber-300 px-2 py-0.5 rounded-full">MLS à connecter</span>}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{c.address} {c.price && `· ${c.price}`}</div>
                          {c.email && <div className="text-xs text-gray-500 mt-0.5">{c.email} {c.phone && `· ${c.phone}`}</div>}

                          {/* Current step pill */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {flow[currentIdx] && (
                              <span className="text-xs px-2 py-1 rounded-lg text-white font-medium"
                                style={{backgroundColor: brandColor + 'CC'}}>
                                {flow[currentIdx].icon} {flow[currentIdx].fr}
                              </span>
                            )}
                            <span className="text-xs text-gray-600">{currentIdx + 1}/{flow.length}</span>
                          </div>

                          {/* Contract expiry — agent only */}
                          {c.contract_expiry && (
                            <div className="mt-2">
                              <ContractExpiry date={c.contract_expiry}
                                label={c.type === 'acheteur' ? 'Contrat acheteur expire' : 'Contrat vendeur expire'} />
                            </div>
                          )}

                          {/* Deadline badges */}
                          {(c.deadline_inspection||c.deadline_financing||c.deadline_documents||c.deadline_clauses||c.deadline_deed) && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <DeadlineBadge label="Inspection" date={c.deadline_inspection} />
                              <DeadlineBadge label="Financement" date={c.deadline_financing} />
                              <DeadlineBadge label="Documents" date={c.deadline_documents} />
                              <DeadlineBadge label="Clauses" date={c.deadline_clauses} />
                              <DeadlineBadge label="Acte de vente" date={c.deadline_deed} />
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                          <button onClick={() => openEdit(c)}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition">
                            Modifier
                          </button>
                          <button onClick={() => generateInviteLink(c.id)}
                            className="text-xs bg-green-950 hover:bg-green-900 text-green-400 px-3 py-1.5 rounded-lg transition">
                            🔗 Inviter
                          </button>
                          {inviteLinks[c.id] && (
                            <button onClick={() => {
                              navigator.clipboard.writeText(inviteLinks[c.id])
                              setCopiedId(c.id)
                              setTimeout(() => setCopiedId(null), 2000)
                            }} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition">
                              {copiedId === c.id ? '✓ Copié!' : '📋 Copier'}
                            </button>
                          )}
                          {/* Calendar */}
                          {(c.deadline_inspection||c.deadline_financing||c.deadline_documents||c.deadline_clauses||c.deadline_deed) && (
                            <div className="relative group">
                              <button className="text-xs bg-blue-950 hover:bg-blue-900 text-blue-300 px-3 py-1.5 rounded-lg transition w-full">
                                + Cal.
                              </button>
                              <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-20 hidden group-hover:block w-64 shadow-xl">
                                <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">Échéances</div>
                                {[
                                  {label:'Inspection', date:c.deadline_inspection},
                                  {label:'Financement', date:c.deadline_financing},
                                  {label:'Documents', date:c.deadline_documents},
                                  {label:'Clauses', date:c.deadline_clauses},
                                  {label:'Acte de vente', date:c.deadline_deed},
                                ].filter(e=>e.date).map(e => {
                                  const start = e.date.replace(/-/g,'')
                                  const title = encodeURIComponent(`${e.label} — ${c.name}`)
                                  const details = encodeURIComponent(`Dossier: ${c.address}`)
                                  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}&details=${details}`
                                  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${e.date}&enddt=${e.date}&body=${details}`
                                  const icsContent = ['BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN','BEGIN:VEVENT',`SUMMARY:${e.label} — ${c.name}`,`DTSTART;VALUE=DATE:${start}`,`DTEND;VALUE=DATE:${start}`,`DESCRIPTION:Dossier: ${c.address}`,'END:VEVENT','END:VCALENDAR'].join('\r\n')
                                  return (
                                    <div key={e.label} className="border-b border-gray-800 last:border-0">
                                      <div className="px-3 pt-2 pb-1 text-xs font-medium text-white">📅 {e.label} <span className="text-gray-500 font-normal">— {e.date}</span></div>
                                      <div className="flex gap-1 px-3 pb-2">
                                        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs bg-gray-800 hover:bg-blue-900 hover:text-blue-300 text-gray-300 px-2 py-1.5 rounded-lg transition">🇬 Google</a>
                                        <a href={outlookUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs bg-gray-800 hover:bg-blue-900 hover:text-blue-300 text-gray-300 px-2 py-1.5 rounded-lg transition">🪟 Outlook</a>
                                        <button onClick={() => {
                                          const blob = new Blob([icsContent], {type:'text/calendar'})
                                          const url = URL.createObjectURL(blob)
                                          const a = document.createElement('a')
                                          a.href = url
                                          a.download = `${e.label}_${c.name.replace(' ','_')}.ics`
                                          a.click()
                                          URL.revokeObjectURL(url)
                                        }} className="flex-1 text-center text-xs bg-gray-800 hover:bg-blue-900 hover:text-blue-300 text-gray-300 px-2 py-1.5 rounded-lg transition">🍎 iCloud</button>
                                      </div>
                                    </div>
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

                      {/* Expanded flow */}
                      {isExpanded && (
                        <div className="border-t border-gray-800 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Progression du dossier</div>
                            <button onClick={() => setEditingFlow({client: c, flow: getClientFlow(c)})}
                              className="text-xs text-blue-400 hover:text-blue-300 transition">
                              ✏️ Modifier le flux
                            </button>
                          </div>
                          <VerticalStepper
                            steps={getClientFlow(c)}
                            currentStep={getCurrentStepIndex(c)}
                            onStepClick={(idx) => {
                              const flow = getClientFlow(c)
                              const currentStatus = flow[idx]?.status || 'pending'
                              const nextStatus = currentStatus === 'done' ? 'pending' : currentStatus === 'pending' ? 'done' : 'pending'
                              updateStepStatus(c, idx, nextStatus)
                            }}
                          />
                          {c.notes && (
                            <div className="mt-3 text-xs text-gray-500 bg-gray-800 rounded-xl px-3 py-2 italic">
                              📝 {c.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {activeTab !== 'dossiers' && (
          <div className="text-center text-gray-500 py-16 bg-gray-900 border border-gray-800 rounded-2xl">
            <div className="text-4xl mb-3">🚧</div>
            <div className="font-medium text-white mb-1">En construction</div>
            <div className="text-sm">Cette section sera disponible prochainement.</div>
          </div>
        )}
      </div>

      {/* Flow editor modal */}
      {editingFlow && (
        <FlowEditor
          flow={editingFlow.flow}
          onSave={(newFlow) => saveFlow(editingFlow.client, newFlow)}
          onClose={() => setEditingFlow(null)}
        />
      )}
    </div>
  )
}
