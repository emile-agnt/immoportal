'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

function FlowEditor({flow, onSave, onClose, dark}) {
  const [steps, setSteps] = useState(flow.map(s=>({...s})))
  const [newStep, setNewStep] = useState('')
  const bg = dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
  const itemBg = dark ? 'bg-gray-800' : 'bg-gray-50 border border-gray-200'
  const text = dark ? 'text-white' : 'text-gray-900'
  const subtext = dark ? 'text-gray-400' : 'text-gray-500'
  const inputCls = dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className={`${bg} border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl`}>
        <div className={`flex items-center justify-between p-5 border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className={`font-semibold ${text}`}>Modifier le flux</div>
          <button onClick={onClose} className={`${subtext} hover:${text} text-xl`}>×</button>
        </div>
        <div className="p-5 space-y-2">
          {steps.map((s,idx) => (
            <div key={s.id} className={`flex items-center gap-2 ${itemBg} rounded-xl px-3 py-2`}>
              <span className="text-lg">{s.icon}</span>
              <span className={`flex-1 text-sm ${text}`}>{s.fr}</span>
              {s.skippable && <span className={`text-xs ${subtext} bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full`}>Optionnel</span>}
              <button onClick={() => setSteps(steps.map(x=>x.id===s.id?{...x,skippable:!x.skippable}:x))} className={`text-xs ${subtext} hover:text-blue-400 px-1`}>{s.skippable?'🔒':'🔓'}</button>
              <button onClick={() => {const a=[...steps];if(idx>0){[a[idx],a[idx-1]]=[a[idx-1],a[idx]];setSteps(a)}}} disabled={idx===0} className={`${subtext} disabled:opacity-30 text-xs px-1`}>↑</button>
              <button onClick={() => {const a=[...steps];if(idx<a.length-1){[a[idx],a[idx+1]]=[a[idx+1],a[idx]];setSteps(a)}}} disabled={idx===steps.length-1} className={`${subtext} disabled:opacity-30 text-xs px-1`}>↓</button>
              <button onClick={() => setSteps(steps.filter(x=>x.id!==s.id))} className="text-red-500 hover:text-red-400 text-xs px-1">✕</button>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <input value={newStep} onChange={e=>setNewStep(e.target.value)}
              placeholder="Nouvelle étape..."
              onKeyDown={e=>e.key==='Enter'&&newStep.trim()&&(setSteps([...steps,{id:Date.now(),icon:'📌',fr:newStep,en:newStep,skippable:false}]),setNewStep(''))}
              className={`flex-1 ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500`} />
            <button onClick={() => {if(newStep.trim()){setSteps([...steps,{id:Date.now(),icon:'📌',fr:newStep,en:newStep,skippable:false}]);setNewStep('')}}}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">+ Ajouter</button>
          </div>
        </div>
        <div className={`flex gap-3 p-5 border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
          <button onClick={() => onSave(steps)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium">Enregistrer</button>
          <button onClick={onClose} className={`${subtext} text-sm px-4 py-2.5 rounded-xl border ${dark?'border-gray-700':'border-gray-200'}`}>Annuler</button>
        </div>
      </div>
    </div>
  )
}

export default function AgentDashboard() {
  const [dark, setDark] = useState(true)
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
  const [brandColor, setBrandColor] = useState('#2563EB')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const emptyForm = {
    name:'',email:'',phone:'',address:'',price:'',mls:'',
    agent_email:'',type:'acheteur',language:'fr',notes:'',
    deadline_inspection:'',deadline_financing:'',deadline_documents:'',
    deadline_clauses:'',deadline_deed:'',contract_expiry:'',
    custom_flow:null
  }
  const [form, setForm] = useState(emptyForm)

  // Theme classes
  const bg = dark ? 'bg-gray-950' : 'bg-gray-50'
  const surface = dark ? 'bg-gray-900' : 'bg-white'
  const surface2 = dark ? 'bg-gray-800' : 'bg-gray-100'
  const border = dark ? 'border-gray-800' : 'border-gray-200'
  const border2 = dark ? 'border-gray-700' : 'border-gray-300'
  const text = dark ? 'text-white' : 'text-gray-900'
  const subtext = dark ? 'text-gray-400' : 'text-gray-500'
  const inputCls = dark
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:border-blue-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'

  useEffect(() => {
    const saved = localStorage.getItem('immo-dark')
    if (saved !== null) setDark(saved === 'true')
    loadData()
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    localStorage.setItem('immo-dark', String(next))
  }

  async function loadData() {
    setLoading(true)
    const [{ data: clientData }, { data: profileData }] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('agent_profiles').select('*').limit(1).single()
    ])
    setClients(clientData || [])
    if (profileData) {
      setAgentProfile(profileData)
      setBrandColor(profileData.brand_color || '#2563EB')
    }
    setLoading(false)
  }

  function getClientFlow(client) {
    if (client.custom_flow) return client.custom_flow
    const base = client.type === 'vendeur' ? defaultSellerFlow : defaultBuyerFlow
    return base.map(s => ({ ...s, status: 'pending' }))
  }

  function getCurrentStepIndex(client) {
    return client.current_step_index || 0
  }

  async function updateStepStatus(client, stepIdx) {
    const flow = getClientFlow(client)
    const currentStatus = flow[stepIdx]?.status || 'pending'
    const nextStatus = currentStatus === 'done' ? 'pending' : 'done'
    const newFlow = flow.map((s, i) => i === stepIdx ? { ...s, status: nextStatus } : s)
    const doneSteps = newFlow.filter(s => s.status === 'done').length
    const newCurrentIdx = Math.min(doneSteps, newFlow.length - 1)
    await supabase.from('clients').update({ custom_flow: newFlow, current_step_index: newCurrentIdx }).eq('id', client.id)
    await loadData()
  }

  async function saveFlow(client, newFlow) {
    await supabase.from('clients').update({ custom_flow: newFlow }).eq('id', client.id)
    setEditingFlow(null)
    await loadData()
  }

  function openAdd() { setEditingClient(null); setForm(emptyForm); setShowForm(true) }

  function openEdit(client) {
    setEditingClient(client)
    setForm({
      name:client.name||'',email:client.email||'',phone:client.phone||'',
      address:client.address||'',price:client.price||'',mls:client.mls||'',
      agent_email:client.agent_email||'',type:client.type||'acheteur',
      language:client.language||'fr',notes:client.notes||'',
      deadline_inspection:client.deadline_inspection||'',
      deadline_financing:client.deadline_financing||'',
      deadline_documents:client.deadline_documents||'',
      deadline_clauses:client.deadline_clauses||'',
      deadline_deed:client.deadline_deed||'',
      contract_expiry:client.contract_expiry||'',
      custom_flow:client.custom_flow||null
    })
    setShowForm(true)
  }

  async function saveClient() {
    setSaving(true)
    const payload = { ...form }
    Object.keys(payload).forEach(k => {
      if ((k.startsWith('deadline_') || k === 'contract_expiry') && payload[k] === '') payload[k] = null
    })
    if (!payload.custom_flow) {
      payload.custom_flow = (payload.type === 'vendeur' ? defaultSellerFlow : defaultBuyerFlow).map(s => ({ ...s, status: 'pending' }))
    }
    if (editingClient) {
      await supabase.from('clients').update(payload).eq('id', editingClient.id)
    } else {
      await supabase.from('clients').insert([payload])
    }
    setForm(emptyForm); setShowForm(false); setEditingClient(null)
    await loadData(); setSaving(false)
  }

  async function deleteClient(id) {
    if (!confirm('Supprimer ce client?')) return
    setDeleting(id)
    await supabase.from('clients').delete().eq('id', id)
    await loadData(); setDeleting(null)
  }

  async function generateInviteLink(clientId) {
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId })
    })
    const data = await res.json()
    if (data.inviteUrl) setInviteLinks(prev => ({ ...prev, [clientId]: data.inviteUrl }))
  }

  const avatarColors = [
    'bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-500'
  ]

  const tabs = [
    { id: 'dossiers', label: 'Dossiers', icon: '👥' },
    { id: 'inscriptions', label: 'Inscriptions', icon: '📋' },
    { id: 'centris', label: 'Centris', icon: '🏠' },
    { id: 'calendrier', label: 'Calendrier', icon: '📅' },
    { id: 'hebdo', label: 'Mise à jour', icon: '📨' },
    { id: 'sms', label: 'SMS / GHL', icon: '💬' },
  ]

  return (
    <div className={`min-h-screen ${bg} ${text} flex`}>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-56' : 'w-16'} flex-shrink-0 ${surface} border-r ${border} flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b ${border}`}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: brandColor }}>I</div>
          {sidebarOpen && <span className="font-semibold text-sm">ImmoPortal</span>}
        </div>

        {/* Agent info */}
        {agentProfile && sidebarOpen && (
          <div className={`px-4 py-3 border-b ${border}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: brandColor }}>
                {getInitials(agentProfile.name || 'A')}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{agentProfile.name}</div>
                <div className={`text-xs ${subtext} truncate`}>{agentProfile.brokerage}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                activeTab === tab.id
                  ? 'text-white font-medium'
                  : `${subtext} hover:${text} ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
              }`}
              style={activeTab === tab.id ? { backgroundColor: brandColor } : {}}>
              <span className="text-base flex-shrink-0">{tab.icon}</span>
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className={`p-3 border-t ${border} space-y-2`}>
          {/* Brand color */}
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <input type="color" value={brandColor}
                onChange={async e => {
                  setBrandColor(e.target.value)
                  if (agentProfile) await supabase.from('agent_profiles').update({ brand_color: e.target.value }).eq('id', agentProfile.id)
                }}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                title="Couleur de marque" />
              <span className={`text-xs ${subtext}`}>Couleur</span>
            </div>
          )}
          {/* Dark mode toggle */}
          <button onClick={toggleDark}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${subtext} ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition`}>
            <span>{dark ? '☀️' : '🌙'}</span>
            {sidebarOpen && <span>{dark ? 'Mode clair' : 'Mode sombre'}</span>}
          </button>
          {/* Collapse sidebar */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${subtext} ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition`}>
            <span>{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && <span>Réduire</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className={`${surface} border-b ${border} px-6 py-3 flex items-center justify-between sticky top-0 z-10`}>
          <div>
            <h1 className={`text-base font-semibold ${text}`}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p className={`text-xs ${subtext}`}>
              {activeTab === 'dossiers' && `${clients.length} client${clients.length !== 1 ? 's' : ''} actif${clients.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {activeTab === 'dossiers' && (
            <button onClick={openAdd}
              className="text-white text-sm px-4 py-2 rounded-xl transition font-medium shadow-sm"
              style={{ backgroundColor: brandColor }}>
              + Nouveau client
            </button>
          )}
        </div>

        <div className="p-6">
          {activeTab === 'dossiers' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Clients actifs', value: clients.length, icon: '👥' },
                  { label: 'Acheteurs', value: clients.filter(c=>c.type==='acheteur').length, icon: '🏠' },
                  { label: 'Vendeurs', value: clients.filter(c=>c.type==='vendeur').length, icon: '📋' },
                  { label: 'Contrats expirant', value: clients.filter(c=>c.contract_expiry&&daysUntil(c.contract_expiry)<=30&&daysUntil(c.contract_expiry)>=0).length, icon: '⚠️', warn: true },
                ].map(s => (
                  <div key={s.label} className={`${surface} border ${border} rounded-2xl p-4 flex items-center gap-3`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>{s.icon}</div>
                    <div>
                      <div className={`text-xs ${subtext} mb-0.5`}>{s.label}</div>
                      <div className={`text-2xl font-bold ${s.warn && s.value > 0 ? 'text-amber-500' : text}`}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form slide-in panel */}
              {showForm && (
                <div className={`${surface} border ${border} rounded-2xl p-6 mb-6 shadow-lg`}>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`font-semibold text-lg ${text}`}>{editingClient ? 'Modifier le client' : 'Nouveau client'}</div>
                    <button onClick={() => { setShowForm(false); setEditingClient(null) }} className={`${subtext} hover:${text} text-2xl leading-none`}>×</button>
                  </div>

                  <div className={`text-xs ${subtext} uppercase tracking-wider mb-3 font-medium`}>Informations client</div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      {label:'Nom complet',key:'name',placeholder:'Marie Bouchard'},
                      {label:'Courriel',key:'email',placeholder:'marie@email.com'},
                      {label:'Téléphone',key:'phone',placeholder:'514-555-0100'},
                      {label:'Adresse de la propriété',key:'address',placeholder:'4782 rue des Érables, Laval',span:2},
                      {label:'Prix',key:'price',placeholder:'549 000$'},
                      {label:'Numéro MLS',key:'mls',placeholder:'27084512'},
                      {label:"Courriel de l'agent",key:'agent_email',placeholder:'agent@email.com'},
                    ].map(f => (
                      <div key={f.key} className={f.span ? `col-span-${f.span}` : ''}>
                        <label className={`text-xs ${subtext} mb-1 block`}>{f.label}</label>
                        <input value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})}
                          placeholder={f.placeholder}
                          className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`} />
                      </div>
                    ))}
                    <div>
                      <label className={`text-xs ${subtext} mb-1 block`}>Type</label>
                      <select value={form.type} onChange={e => setForm({...form,type:e.target.value})}
                        className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`}>
                        <option value="acheteur">Acheteur</option>
                        <option value="vendeur">Vendeur</option>
                      </select>
                    </div>
                    <div>
                      <label className={`text-xs ${subtext} mb-1 block`}>Langue</label>
                      <select value={form.language} onChange={e => setForm({...form,language:e.target.value})}
                        className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`}>
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <div className={`text-xs ${subtext} uppercase tracking-wider mb-3 font-medium`}>Contrat & échéances</div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      {label:'Expiration du contrat',key:'contract_expiry'},
                      {label:'Inspection',key:'deadline_inspection'},
                      {label:'Financement',key:'deadline_financing'},
                      {label:'Révision documents',key:'deadline_documents'},
                      {label:'Autres clauses',key:'deadline_clauses'},
                      {label:'Acte de vente',key:'deadline_deed'},
                    ].map(f => (
                      <div key={f.key}>
                        <label className={`text-xs ${subtext} mb-1 block`}>{f.label}</label>
                        <input type="date" value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})}
                          className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`} />
                      </div>
                    ))}
                  </div>

                  <div className="mb-5">
                    <label className={`text-xs ${subtext} mb-1 block`}>Notes internes</label>
                    <textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})}
                      placeholder="Notes visibles seulement par l'agent..."
                      className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none h-16 resize-none`} />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={saveClient} disabled={!form.name||saving}
                      className="text-white px-6 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 shadow-sm"
                      style={{backgroundColor:brandColor}}>
                      {saving ? 'Enregistrement...' : editingClient ? 'Mettre à jour' : 'Enregistrer'}
                    </button>
                    <button onClick={() => {setShowForm(false);setEditingClient(null)}}
                      className={`${subtext} text-sm px-4 py-2.5 rounded-xl border ${border2} transition`}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Client cards */}
              {loading ? (
                <div className={`text-center ${subtext} py-12`}>Chargement...</div>
              ) : clients.length === 0 ? (
                <div className={`text-center ${subtext} py-16 ${surface} border ${border} rounded-2xl`}>
                  <div className="text-5xl mb-4">🏠</div>
                  <div className={`font-medium ${text} mb-1`}>Aucun client pour l'instant</div>
                  <div className="text-sm mb-4">Ajoutez votre premier client pour commencer</div>
                  <button onClick={openAdd} className="text-white px-5 py-2 rounded-xl text-sm transition"
                    style={{backgroundColor:brandColor}}>+ Nouveau client</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {clients.map((c, idx) => {
                    const flow = getClientFlow(c)
                    const currentIdx = getCurrentStepIndex(c)
                    const isExpanded = expandedClient === c.id
                    const contractDays = daysUntil(c.contract_expiry)
                    const completedSteps = flow.filter(s => s.status === 'done').length

                    return (
                      <div key={c.id} className={`${surface} border ${border} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                        {/* Progress bar at top */}
                        <div className="h-1 w-full bg-gray-200 dark:bg-gray-800">
                          <div className="h-1 transition-all duration-500 rounded-full"
                            style={{width:`${(completedSteps/flow.length)*100}%`, backgroundColor: brandColor}} />
                        </div>

                        <div className="p-5 flex items-start gap-4">
                          {/* Avatar */}
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                            {getInitials(c.name)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedClient(isExpanded ? null : c.id)}>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`font-semibold text-sm ${text}`}>{c.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type==='acheteur' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'}`}>
                                {c.type}
                              </span>
                              <span className={`text-xs ${subtext}`}>{c.language==='fr'?'🇫🇷':'🇬🇧'}</span>
                              {c.mls ? (
                                <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-full">MLS {c.mls}</span>
                              ) : (
                                <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full">MLS à connecter</span>
                              )}
                            </div>

                            {c.address && <div className={`text-xs ${subtext} mb-1`}>{c.address}{c.price && ` · ${c.price}`}</div>}
                            {c.email && <div className={`text-xs ${subtext} mb-2`}>{c.email}{c.phone && ` · ${c.phone}`}</div>}

                            {/* Current step */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {flow[currentIdx] && (
                                <span className="text-xs px-2.5 py-1 rounded-lg text-white font-medium"
                                  style={{backgroundColor: brandColor + 'DD'}}>
                                  {flow[currentIdx].icon} {flow[currentIdx].fr}
                                </span>
                              )}
                              <span className={`text-xs ${subtext}`}>{completedSteps}/{flow.length} étapes</span>
                              <span className={`text-xs ${subtext}`}>·</span>
                              <span className={`text-xs ${subtext}`}>{isExpanded ? '▲ Réduire' : '▼ Voir le flux'}</span>
                            </div>

                            {/* Contract expiry */}
                            {c.contract_expiry && (
                              <div className={`mt-2 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${
                                contractDays < 0 ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-900 dark:text-red-300' :
                                contractDays <= 7 ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300' :
                                `${dark?'bg-gray-800 border-gray-700 text-gray-300':'bg-gray-50 border-gray-200 text-gray-600'}`
                              }`}>
                                📋 {c.type==='acheteur'?'Contrat acheteur':'Contrat vendeur'} ·{' '}
                                {contractDays < 0 ? `Expiré (${Math.abs(contractDays)}j)` : contractDays === 0 ? "Expire aujourd'hui" : `${contractDays}j restants`}
                              </div>
                            )}

                            {/* Deadline badges */}
                            {(c.deadline_inspection||c.deadline_financing||c.deadline_documents||c.deadline_clauses||c.deadline_deed) && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {[
                                  {label:'Inspection',date:c.deadline_inspection},
                                  {label:'Financement',date:c.deadline_financing},
                                  {label:'Documents',date:c.deadline_documents},
                                  {label:'Clauses',date:c.deadline_clauses},
                                  {label:'Acte de vente',date:c.deadline_deed},
                                ].filter(d=>d.date).map(d => {
                                  const days = daysUntil(d.date)
                                  const cls = days < 0 ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                                    days <= 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                                    'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  return (
                                    <span key={d.label} className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>
                                      {d.label}: {days < 0 ? `${Math.abs(days)}j dépassé` : days === 0 ? "Auj." : `${days}j`}
                                    </span>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 flex-shrink-0" onClick={e=>e.stopPropagation()}>
                            <button onClick={() => openEdit(c)}
                              className={`text-xs ${dark?'bg-gray-800 hover:bg-gray-700 text-gray-300':'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-3 py-1.5 rounded-lg transition`}>
                              Modifier
                            </button>
                            <button onClick={() => generateInviteLink(c.id)}
                              className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-400 px-3 py-1.5 rounded-lg transition">
                              🔗 Inviter
                            </button>
                            {inviteLinks[c.id] && (
                              <button onClick={() => {
                                navigator.clipboard.writeText(inviteLinks[c.id])
                                setCopiedId(c.id)
                                setTimeout(() => setCopiedId(null), 2000)
                              }} className={`text-xs ${dark?'bg-gray-800 hover:bg-gray-700 text-gray-300':'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-3 py-1.5 rounded-lg transition`}>
                                {copiedId===c.id ? '✓ Copié!' : '📋 Copier'}
                              </button>
                            )}
                            {(c.deadline_inspection||c.deadline_financing||c.deadline_documents||c.deadline_clauses||c.deadline_deed) && (
                              <div className="relative group">
                                <button className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 px-3 py-1.5 rounded-lg transition w-full">
                                  📅 Cal.
                                </button>
                                <div className={`absolute right-0 top-full mt-1 ${surface} border ${border} rounded-xl overflow-hidden z-20 hidden group-hover:block w-64 shadow-xl`}>
                                  <div className={`px-3 py-2 border-b ${border} text-xs ${subtext} uppercase tracking-wider`}>Échéances</div>
                                  {[
                                    {label:'Inspection',date:c.deadline_inspection},
                                    {label:'Financement',date:c.deadline_financing},
                                    {label:'Documents',date:c.deadline_documents},
                                    {label:'Clauses',date:c.deadline_clauses},
                                    {label:'Acte de vente',date:c.deadline_deed},
                                  ].filter(e=>e.date).map(e => {
                                    const start = e.date.replace(/-/g,'')
                                    const title = encodeURIComponent(`${e.label} — ${c.name}`)
                                    const details = encodeURIComponent(`Dossier: ${c.address}`)
                                    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}&details=${details}`
                                    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${e.date}&enddt=${e.date}&body=${details}`
                                    const icsContent = ['BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN','BEGIN:VEVENT',`SUMMARY:${e.label} — ${c.name}`,`DTSTART;VALUE=DATE:${start}`,`DTEND;VALUE=DATE:${start}`,`DESCRIPTION:Dossier: ${c.address}`,'END:VEVENT','END:VCALENDAR'].join('\r\n')
                                    return (
                                      <div key={e.label} className={`border-b ${border} last:border-0`}>
                                        <div className={`px-3 pt-2 pb-1 text-xs font-medium ${text}`}>📅 {e.label} <span className={subtext}>— {e.date}</span></div>
                                        <div className="flex gap-1 px-3 pb-2">
                                          <a href={googleUrl} target="_blank" rel="noopener noreferrer" className={`flex-1 text-center text-xs ${dark?'bg-gray-800 hover:bg-blue-900 hover:text-blue-300 text-gray-300':'bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600'} px-2 py-1.5 rounded-lg transition`}>🇬 Google</a>
                                          <a href={outlookUrl} target="_blank" rel="noopener noreferrer" className={`flex-1 text-center text-xs ${dark?'bg-gray-800 hover:bg-blue-900 hover:text-blue-300 text-gray-300':'bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600'} px-2 py-1.5 rounded-lg transition`}>🪟 Outlook</a>
                                          <button onClick={() => {
                                            const blob = new Blob([icsContent],{type:'text/calendar'})
                                            const url = URL.createObjectURL(blob)
                                            const a = document.createElement('a')
                                            a.href=url; a.download=`${e.label}_${c.name.replace(' ','_')}.ics`; a.click()
                                            URL.revokeObjectURL(url)
                                          }} className={`flex-1 text-center text-xs ${dark?'bg-gray-800 hover:bg-blue-900 hover:text-blue-300 text-gray-300':'bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600'} px-2 py-1.5 rounded-lg transition`}>🍎 iCloud</button>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                            <button onClick={() => deleteClient(c.id)} disabled={deleting===c.id}
                              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                              {deleting===c.id ? '...' : 'Supprimer'}
                            </button>
                          </div>
                        </div>

                        {/* Expanded flow — vertical timeline */}
                        {isExpanded && (
                          <div className={`border-t ${border} px-5 pb-5 pt-4`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className={`text-xs ${subtext} uppercase tracking-wider font-medium`}>Progression du dossier</div>
                              <button onClick={() => setEditingFlow({client:c,flow:getClientFlow(c)})}
                                className="text-xs text-blue-500 hover:text-blue-400 transition">✏️ Modifier le flux</button>
                            </div>
                            <div className="relative">
                              {/* Vertical line */}
                              <div className={`absolute left-4 top-4 bottom-4 w-0.5 ${dark?'bg-gray-800':'bg-gray-200'}`} />
                              <div className="space-y-1">
                                {flow.map((s, i) => {
                                  const done = s.status === 'done'
                                  const active = i === currentIdx && !done
                                  const waived = s.status === 'waived'
                                  return (
                                    <button key={s.id} onClick={() => updateStepStatus(c, i)}
                                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left relative z-10 ${
                                        active ? (dark?'bg-blue-950 border border-blue-800':'bg-blue-50 border border-blue-200') :
                                        done ? (dark?'bg-green-950':'bg-green-50') :
                                        dark?'hover:bg-gray-800':'hover:bg-gray-50'
                                      }`}>
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 border-2 transition ${
                                        done ? 'bg-green-500 border-green-500 text-white' :
                                        active ? 'border-blue-500 text-blue-500 bg-white dark:bg-gray-900' :
                                        waived ? (dark?'bg-gray-800 border-gray-700 text-gray-600':'bg-gray-100 border-gray-200 text-gray-400') :
                                        dark?'bg-gray-900 border-gray-700 text-gray-500':'bg-white border-gray-200 text-gray-400'
                                      }`}>
                                        {done ? '✓' : s.icon}
                                      </div>
                                      <div className="flex-1">
                                        <div className={`text-xs font-medium ${
                                          done ? 'text-green-600 dark:text-green-400' :
                                          active ? 'text-blue-600 dark:text-blue-300' :
                                          waived ? (dark?'text-gray-600 line-through':'text-gray-400 line-through') :
                                          subtext
                                        }`}>{s.fr}</div>
                                      </div>
                                      {active && <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{backgroundColor:brandColor}}>En cours</span>}
                                      {done && <span className="text-xs text-green-500">✓ Complété</span>}
                                      {s.skippable && !done && !active && <span className={`text-xs ${subtext} opacity-50`}>Optionnel</span>}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                            {c.notes && (
                              <div className={`mt-3 text-xs ${subtext} ${dark?'bg-gray-800':'bg-gray-50'} rounded-xl px-3 py-2 italic`}>
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
            <div className={`text-center ${subtext} py-16 ${surface} border ${border} rounded-2xl`}>
              <div className="text-4xl mb-3">🚧</div>
              <div className={`font-medium ${text} mb-1`}>En construction</div>
              <div className="text-sm">Cette section sera disponible prochainement.</div>
            </div>
          )}
        </div>
      </div>

      {/* Flow editor modal */}
      {editingFlow && (
        <FlowEditor
          flow={editingFlow.flow}
          onSave={(newFlow) => saveFlow(editingFlow.client, newFlow)}
          onClose={() => setEditingFlow(null)}
          dark={dark}
        />
      )}
    </div>
  )
}
