'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
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

function getInitials(n) { return (n||'').split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2) }
function daysUntil(d) { if(!d) return null; return Math.ceil((new Date(d)-new Date())/(1000*60*60*24)) }

function FlowEditor({flow,onSave,onClose,dark,brandColor}) {
  const [steps,setSteps]=useState(flow.map(s=>({...s})))
  const [newStep,setNewStep]=useState('')
  const s=dark?{bg:'bg-gray-900',border:'border-gray-700',item:'bg-gray-800',text:'text-white',sub:'text-gray-400',input:'bg-gray-800 border-gray-700 text-white'}:{bg:'bg-white',border:'border-gray-200',item:'bg-gray-50 border border-gray-200',text:'text-gray-900',sub:'text-gray-500',input:'bg-gray-50 border-gray-200 text-gray-900'}
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className={`${s.bg} border ${s.border} rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl`}>
        <div className={`flex items-center justify-between p-5 border-b ${s.border}`}>
          <div className={`font-semibold ${s.text}`}>Modifier le flux</div>
          <button onClick={onClose} className={`${s.sub} text-xl`}>×</button>
        </div>
        <div className="p-5 space-y-2">
          {steps.map((step,idx)=>(
            <div key={step.id} className={`flex items-center gap-2 ${s.item} rounded-xl px-3 py-2`}>
              <span className="text-lg">{step.icon}</span>
              <span className={`flex-1 text-sm ${s.text}`}>{step.fr}</span>
              {step.skippable&&<span className={`text-xs ${s.sub} px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700`}>Optionnel</span>}
              <button onClick={()=>setSteps(steps.map(x=>x.id===step.id?{...x,skippable:!x.skippable}:x))} className={`text-xs ${s.sub} hover:text-blue-400 px-1`}>{step.skippable?'🔒':'🔓'}</button>
              <button onClick={()=>{const a=[...steps];if(idx>0){[a[idx],a[idx-1]]=[a[idx-1],a[idx]];setSteps(a)}}} disabled={idx===0} className={`${s.sub} disabled:opacity-30 text-xs px-1`}>↑</button>
              <button onClick={()=>{const a=[...steps];if(idx<a.length-1){[a[idx],a[idx+1]]=[a[idx+1],a[idx]];setSteps(a)}}} disabled={idx===steps.length-1} className={`${s.sub} disabled:opacity-30 text-xs px-1`}>↓</button>
              <button onClick={()=>setSteps(steps.filter(x=>x.id!==step.id))} className="text-red-500 text-xs px-1">✕</button>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <input value={newStep} onChange={e=>setNewStep(e.target.value)} placeholder="Nouvelle étape..."
              onKeyDown={e=>e.key==='Enter'&&newStep.trim()&&(setSteps([...steps,{id:Date.now(),icon:'📌',fr:newStep,en:newStep,skippable:false}]),setNewStep(''))}
              className={`flex-1 ${s.input} border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500`}/>
            <button onClick={()=>{if(newStep.trim()){setSteps([...steps,{id:Date.now(),icon:'📌',fr:newStep,en:newStep,skippable:false}]);setNewStep('')}}}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">+ Ajouter</button>
          </div>
        </div>
        <div className={`flex gap-3 p-5 border-t ${s.border}`}>
          <button onClick={()=>onSave(steps)} className="flex-1 text-white py-2.5 rounded-xl text-sm font-medium" style={{backgroundColor:brandColor}}>Enregistrer</button>
          <button onClick={onClose} className={`${s.sub} text-sm px-4 py-2.5 rounded-xl border ${s.border}`}>Annuler</button>
        </div>
      </div>
    </div>
  )
}

const tabs = [
  {id:'dossiers',label:'Dossiers',icon:'👥'},
  {id:'inscriptions',label:'Inscriptions',icon:'📋'},
  {id:'centris',label:'Centris',icon:'🏠'},
  {id:'calendrier',label:'Calendrier',icon:'📅'},
  {id:'hebdo',label:'Mise à jour',icon:'📨'},
  {id:'parametres',label:'Paramètres',icon:'⚙️'},
]

export default function AgentDashboard() {
  const [dark,setDark]=useState(true)
  const [isIframe,setIsIframe]=useState(false)
  const [isMobile,setIsMobile]=useState(false)
  const [clients,setClients]=useState([])
  const [agentProfile,setAgentProfile]=useState(null)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [deleting,setDeleting]=useState(null)
  const [showForm,setShowForm]=useState(false)
  const [editingClient,setEditingClient]=useState(null)
  const [expandedClient,setExpandedClient]=useState(null)
  const [editingFlow,setEditingFlow]=useState(null)
  const [inviteLinks,setInviteLinks]=useState({})
  const [copiedId,setCopiedId]=useState(null)
  const [activeTab,setActiveTab]=useState('dossiers')
  const [brandColor,setBrandColor]=useState('#2563EB')
  const [sidebarOpen,setSidebarOpen]=useState(true)
  const [uploadingBanner,setUploadingBanner]=useState(false)
  const [savingProfile,setSavingProfile]=useState(false)
  const [profileForm,setProfileForm]=useState({name:'',brokerage:'',email:'',phone:'',welcome_message:'',brand_color:'#2563EB',banner_url:'',logo_url:''})
  const bannerInputRef=useRef(null)

  const emptyForm={name:'',email:'',phone:'',address:'',price:'',mls:'',agent_email:'',type:'acheteur',language:'fr',notes:'',deadline_inspection:'',deadline_financing:'',deadline_documents:'',deadline_clauses:'',deadline_deed:'',contract_expiry:'',custom_flow:null}
  const [form,setForm]=useState(emptyForm)

  // Theme
  const bg=dark?'bg-gray-950':'bg-gray-50'
  const surface=dark?'bg-gray-900':'bg-white'
  const surface2=dark?'bg-gray-800':'bg-gray-100'
  const border=dark?'border-gray-800':'border-gray-200'
  const border2=dark?'border-gray-700':'border-gray-300'
  const text=dark?'text-white':'text-gray-900'
  const subtext=dark?'text-gray-400':'text-gray-500'
  const inputCls=dark?'bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:border-blue-500':'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
  const hoverBg=dark?'hover:bg-gray-800':'hover:bg-gray-100'

  useEffect(()=>{
    const saved=localStorage.getItem('immo-dark')
    if(saved!==null) setDark(saved==='true')
    setIsIframe(window.self!==window.top)
    setIsMobile(window.innerWidth<768)
    const handleResize=()=>setIsMobile(window.innerWidth<768)
    window.addEventListener('resize',handleResize)
    loadData()
    return ()=>window.removeEventListener('resize',handleResize)
  },[])

  function toggleDark(){const n=!dark;setDark(n);localStorage.setItem('immo-dark',String(n))}

  async function loadData(){
    setLoading(true)
    const [{data:cd},{data:pd}]=await Promise.all([
      supabase.from('clients').select('*').order('created_at',{ascending:false}),
      supabase.from('agent_profiles').select('*').limit(1).single()
    ])
    setClients(cd||[])
    if(pd){
      setAgentProfile(pd)
      setBrandColor(pd.brand_color||'#2563EB')
      setProfileForm({
        name:pd.name||'',brokerage:pd.brokerage||'',email:pd.email||'',
        phone:pd.phone||'',welcome_message:pd.welcome_message||'',
        brand_color:pd.brand_color||'#2563EB',banner_url:pd.banner_url||'',
        logo_url:pd.logo_url||''
      })
    }
    setLoading(false)
  }

  function getClientFlow(c){
    if(c.custom_flow) return c.custom_flow
    return (c.type==='vendeur'?defaultSellerFlow:defaultBuyerFlow).map(s=>({...s,status:'pending'}))
  }

  async function updateStepStatus(c,idx){
    const flow=getClientFlow(c)
    const cur=flow[idx]?.status||'pending'
    const next=cur==='done'?'pending':'done'
    const nf=flow.map((s,i)=>i===idx?{...s,status:next}:s)
    const done=nf.filter(s=>s.status==='done').length
    await supabase.from('clients').update({custom_flow:nf,current_step_index:Math.min(done,nf.length-1)}).eq('id',c.id)
    await loadData()
  }

  async function saveFlow(c,nf){
    await supabase.from('clients').update({custom_flow:nf}).eq('id',c.id)
    setEditingFlow(null); await loadData()
  }

  function openAdd(){setEditingClient(null);setForm(emptyForm);setShowForm(true)}
  function openEdit(c){
    setEditingClient(c)
    setForm({name:c.name||'',email:c.email||'',phone:c.phone||'',address:c.address||'',price:c.price||'',mls:c.mls||'',agent_email:c.agent_email||'',type:c.type||'acheteur',language:c.language||'fr',notes:c.notes||'',deadline_inspection:c.deadline_inspection||'',deadline_financing:c.deadline_financing||'',deadline_documents:c.deadline_documents||'',deadline_clauses:c.deadline_clauses||'',deadline_deed:c.deadline_deed||'',contract_expiry:c.contract_expiry||'',custom_flow:c.custom_flow||null})
    setShowForm(true)
  }

  async function saveClient(){
    setSaving(true)
    const p={...form}
    Object.keys(p).forEach(k=>{if((k.startsWith('deadline_')||k==='contract_expiry')&&p[k]==='')p[k]=null})
    if(!p.custom_flow) p.custom_flow=(p.type==='vendeur'?defaultSellerFlow:defaultBuyerFlow).map(s=>({...s,status:'pending'}))
    if(editingClient) await supabase.from('clients').update(p).eq('id',editingClient.id)
    else await supabase.from('clients').insert([p])
    setForm(emptyForm);setShowForm(false);setEditingClient(null);await loadData();setSaving(false)
  }

  async function deleteClient(id){
    if(!confirm('Supprimer ce client?')) return
    setDeleting(id);await supabase.from('clients').delete().eq('id',id);await loadData();setDeleting(null)
  }

  async function generateInviteLink(clientId){
    const res=await fetch('/api/invite',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId})})
    const data=await res.json()
    if(data.inviteUrl) setInviteLinks(prev=>({...prev,[clientId]:data.inviteUrl}))
  }

  async function saveProfile(){
    setSavingProfile(true)
    setBrandColor(profileForm.brand_color)
    if(agentProfile){
      await supabase.from('agent_profiles').update(profileForm).eq('id',agentProfile.id)
    } else {
      await supabase.from('agent_profiles').insert([profileForm])
    }
    await loadData();setSavingProfile(false)
  }

  async function handleBannerUpload(e){
    const file=e.target.files?.[0]
    if(!file) return
    setUploadingBanner(true)
    const reader=new FileReader()
    reader.onload=async(ev)=>{
      const base64=ev.target.result
      setProfileForm(prev=>({...prev,banner_url:base64}))
      setUploadingBanner(false)
    }
    reader.readAsDataURL(file)
  }

  const avatarColors=['bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-500']

  // Layout mode
  const showSidebar=!isIframe&&!isMobile
  const showBottomBar=isMobile
  const showTopNav=isIframe

  function NavItem({tab,active}){
    if(showBottomBar){
      return(
        <button onClick={()=>setActiveTab(tab.id)} className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition ${active?'text-white':'text-gray-500'}`}
          style={active?{color:brandColor}:{}}>
          <span className="text-xl">{tab.icon}</span>
          <span className="text-xs">{tab.label}</span>
        </button>
      )
    }
    if(showTopNav){
      return(
        <button onClick={()=>setActiveTab(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition ${active?'text-white font-medium':'text-white text-opacity-70 hover:text-opacity-100'}`}
          style={active?{backgroundColor:'rgba(255,255,255,0.2)'}:{}}>
          <span>{tab.icon}</span>
          <span className="hidden sm:block">{tab.label}</span>
        </button>
      )
    }
    return(
      <button onClick={()=>setActiveTab(tab.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${active?'text-white font-medium':`${subtext} ${hoverBg}`}`}
        style={active?{backgroundColor:brandColor}:{}}>
        <span className="text-base flex-shrink-0">{tab.icon}</span>
        {sidebarOpen&&<span>{tab.label}</span>}
      </button>
    )
  }

  // Centris card form state
  const [listings,setListings]=useState([])
  const [showCentrisForm,setShowCentrisForm]=useState(false)
  const [centrisForm,setCentrisForm]=useState({client_id:'',mls:'',address:'',city:'',price:'',property_type:'',bedrooms:'',bathrooms:'',livable_area:'',year_built:'',photo_url:'',description:'',features:[],listing_type:'achat'})
  const [savingListing,setSavingListing]=useState(false)
  const [editingListing,setEditingListing]=useState(null)

  const propertyTypes=['Maison','Condo','Duplex','Triplex','Quadruplex','Terrain','Chalet','Autre']
  const featureOptions=['Piscine','Garage','Sous-sol aménagé','Cour arrière','Balcon','Terrasse','Foyer','Thermopompe','Bord de l\'eau','Nouvelle construction']

  useEffect(()=>{
    if(activeTab==='centris') loadListings()
  },[activeTab])

  async function loadListings(){
    const {data}=await supabase.from('listings').select('*,clients(name)').order('created_at',{ascending:false})
    setListings(data||[])
  }

  async function saveListing(){
    setSavingListing(true)
    const p={...centrisForm,price:centrisForm.price?parseInt(centrisForm.price.toString().replace(/\s/g,'')):null,bedrooms:centrisForm.bedrooms?parseInt(centrisForm.bedrooms):null,bathrooms:centrisForm.bathrooms?parseInt(centrisForm.bathrooms):null,livable_area:centrisForm.livable_area?parseInt(centrisForm.livable_area):null,year_built:centrisForm.year_built?parseInt(centrisForm.year_built):null}
    if(editingListing) await supabase.from('listings').update(p).eq('id',editingListing.id)
    else await supabase.from('listings').insert([p])
    setShowCentrisForm(false);setEditingListing(null);setCentrisForm({client_id:'',mls:'',address:'',city:'',price:'',property_type:'',bedrooms:'',bathrooms:'',livable_area:'',year_built:'',photo_url:'',description:'',features:[],listing_type:'achat'})
    await loadListings();setSavingListing(false)
  }

  const sc=(k,v)=>setCentrisForm(prev=>({...prev,[k]:v}))

  return(
    <div className={`min-h-screen ${bg} ${text} flex flex-col`}>

      {/* GHL iframe top nav */}
      {showTopNav&&(
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{backgroundColor:brandColor}}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white bg-opacity-20 flex items-center justify-center text-white text-xs font-bold">I</div>
            {agentProfile&&<span className="text-white font-medium text-sm">{agentProfile.name}</span>}
          </div>
          <div className="flex items-center gap-1">
            {tabs.map(t=><NavItem key={t.id} tab={t} active={activeTab===t.id}/>)}
          </div>
          <button onClick={toggleDark} className="text-white text-opacity-70 hover:text-opacity-100 text-sm">
            {dark?'☀️':'🌙'}
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        {showSidebar&&(
          <div className={`${sidebarOpen?'w-56':'w-16'} flex-shrink-0 ${surface} border-r ${border} flex flex-col transition-all duration-300`}>
            <div className={`flex items-center gap-3 px-4 py-4 border-b ${border}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{backgroundColor:brandColor}}>I</div>
              {sidebarOpen&&<span className="font-semibold text-sm">ImmoPortal</span>}
            </div>
            {agentProfile&&sidebarOpen&&(
              <div className={`px-4 py-3 border-b ${border}`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0" style={{backgroundColor:brandColor}}>
                    {getInitials(agentProfile.name||'A')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{agentProfile.name}</div>
                    <div className={`text-xs ${subtext} truncate`}>{agentProfile.brokerage}</div>
                  </div>
                </div>
              </div>
            )}
            <nav className="flex-1 p-2 space-y-1">
              {tabs.map(t=><NavItem key={t.id} tab={t} active={activeTab===t.id}/>)}
            </nav>
            <div className={`p-3 border-t ${border} space-y-2`}>
              <button onClick={toggleDark} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${subtext} ${hoverBg} transition`}>
                <span>{dark?'☀️':'🌙'}</span>
                {sidebarOpen&&<span>{dark?'Mode clair':'Mode sombre'}</span>}
              </button>
              <button onClick={()=>setSidebarOpen(!sidebarOpen)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${subtext} ${hoverBg} transition`}>
                <span>{sidebarOpen?'◀':'▶'}</span>
                {sidebarOpen&&<span>Réduire</span>}
              </button>
            </div>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 overflow-auto flex flex-col">
          {/* Top bar */}
          {!showTopNav&&(
            <div className={`${surface} border-b ${border} px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10`}>
              <div>
                <h1 className={`text-base font-semibold ${text}`}>{tabs.find(t=>t.id===activeTab)?.label}</h1>
                {activeTab==='dossiers'&&<p className={`text-xs ${subtext}`}>{clients.length} client{clients.length!==1?'s':''} actif{clients.length!==1?'s':''}</p>}
              </div>
              <div className="flex items-center gap-2">
                {activeTab==='dossiers'&&(
                  <button onClick={openAdd} className="text-white text-sm px-3 sm:px-4 py-2 rounded-xl transition font-medium shadow-sm" style={{backgroundColor:brandColor}}>
                    <span className="sm:hidden">+</span>
                    <span className="hidden sm:block">+ Nouveau client</span>
                  </button>
                )}
                {activeTab==='centris'&&(
                  <button onClick={()=>setShowCentrisForm(true)} className="text-white text-sm px-3 sm:px-4 py-2 rounded-xl transition font-medium shadow-sm" style={{backgroundColor:brandColor}}>
                    <span className="sm:hidden">+</span>
                    <span className="hidden sm:block">+ Nouvelle fiche</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={`p-4 sm:p-6 flex-1 ${showBottomBar?'pb-20':''}`}>

            {/* DOSSIERS TAB */}
            {activeTab==='dossiers'&&(
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    {label:'Clients actifs',value:clients.length,icon:'👥'},
                    {label:'Acheteurs',value:clients.filter(c=>c.type==='acheteur').length,icon:'🏠'},
                    {label:'Vendeurs',value:clients.filter(c=>c.type==='vendeur').length,icon:'📋'},
                    {label:'Contrats expirant',value:clients.filter(c=>c.contract_expiry&&daysUntil(c.contract_expiry)<=30&&daysUntil(c.contract_expiry)>=0).length,icon:'⚠️',warn:true},
                  ].map(s=>(
                    <div key={s.label} className={`${surface} border ${border} rounded-2xl p-4 flex items-center gap-3`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${surface2}`}>{s.icon}</div>
                      <div>
                        <div className={`text-xs ${subtext} mb-0.5`}>{s.label}</div>
                        <div className={`text-2xl font-bold ${s.warn&&s.value>0?'text-amber-500':text}`}>{s.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form */}
                {showForm&&(
                  <div className={`${surface} border ${border} rounded-2xl p-4 sm:p-6 mb-6 shadow-lg`}>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`font-semibold text-lg ${text}`}>{editingClient?'Modifier':'Nouveau client'}</div>
                      <button onClick={()=>{setShowForm(false);setEditingClient(null)}} className={`${subtext} text-2xl leading-none`}>×</button>
                    </div>
                    <div className={`text-xs ${subtext} uppercase tracking-wider mb-3 font-medium`}>Informations client</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                      {[{label:'Nom complet',key:'name',placeholder:'Marie Bouchard'},{label:'Courriel',key:'email',placeholder:'marie@email.com'},{label:'Téléphone',key:'phone',placeholder:'514-555-0100'},{label:'Adresse',key:'address',placeholder:'4782 rue des Érables, Laval',span:2},{label:'Prix',key:'price',placeholder:'549 000$'},{label:'MLS',key:'mls',placeholder:'27084512'},{label:"Courriel agent",key:'agent_email',placeholder:'agent@email.com'}].map(f=>(
                        <div key={f.key} className={f.span?`sm:col-span-${f.span}`:''}>
                          <label className={`text-xs ${subtext} mb-1 block`}>{f.label}</label>
                          <input value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder}
                            className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`}/>
                        </div>
                      ))}
                      <div>
                        <label className={`text-xs ${subtext} mb-1 block`}>Type</label>
                        <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`}>
                          <option value="acheteur">Acheteur</option>
                          <option value="vendeur">Vendeur</option>
                        </select>
                      </div>
                      <div>
                        <label className={`text-xs ${subtext} mb-1 block`}>Langue</label>
                        <select value={form.language} onChange={e=>setForm({...form,language:e.target.value})} className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`}>
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                    <div className={`text-xs ${subtext} uppercase tracking-wider mb-3 font-medium`}>Contrat & échéances</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                      {[{label:'Expiration contrat',key:'contract_expiry'},{label:'Inspection',key:'deadline_inspection'},{label:'Financement',key:'deadline_financing'},{label:'Documents',key:'deadline_documents'},{label:'Clauses',key:'deadline_clauses'},{label:'Acte de vente',key:'deadline_deed'}].map(f=>(
                        <div key={f.key}>
                          <label className={`text-xs ${subtext} mb-1 block`}>{f.label}</label>
                          <input type="date" value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`}/>
                        </div>
                      ))}
                    </div>
                    <div className="mb-5">
                      <label className={`text-xs ${subtext} mb-1 block`}>Notes internes</label>
                      <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Notes visibles seulement par l'agent..." className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none h-16 resize-none`}/>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={saveClient} disabled={!form.name||saving} className="text-white px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50" style={{backgroundColor:brandColor}}>
                        {saving?'Enregistrement...':editingClient?'Mettre à jour':'Enregistrer'}
                      </button>
                      <button onClick={()=>{setShowForm(false);setEditingClient(null)}} className={`${subtext} text-sm px-4 py-2.5 rounded-xl border ${border2}`}>Annuler</button>
                    </div>
                  </div>
                )}

                {/* Client list */}
                {loading?(
                  <div className={`text-center ${subtext} py-12`}>Chargement...</div>
                ):clients.length===0?(
                  <div className={`text-center ${subtext} py-16 ${surface} border ${border} rounded-2xl`}>
                    <div className="text-5xl mb-4">🏠</div>
                    <div className={`font-medium ${text} mb-1`}>Aucun client pour l'instant</div>
                    <div className="text-sm mb-4">Ajoutez votre premier client pour commencer</div>
                    <button onClick={openAdd} className="text-white px-5 py-2 rounded-xl text-sm" style={{backgroundColor:brandColor}}>+ Nouveau client</button>
                  </div>
                ):(
                  <div className="space-y-3">
                    {clients.map((c,idx)=>{
                      const flow=getClientFlow(c)
                      const currentIdx=c.current_step_index||0
                      const isExpanded=expandedClient===c.id
                      const contractDays=daysUntil(c.contract_expiry)
                      const completedSteps=flow.filter(s=>s.status==='done').length
                      return(
                        <div key={c.id} className={`${surface} border ${border} rounded-2xl overflow-hidden shadow-sm`}>
                          <div className="h-1 w-full" style={{background:`linear-gradient(to right, ${brandColor} ${(completedSteps/flow.length)*100}%, ${dark?'#1f2937':'#e5e7eb'} 0%)`}}/>
                          <div className="p-4 flex items-start gap-3 sm:gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${avatarColors[idx%avatarColors.length]}`}>
                              {getInitials(c.name)}
                            </div>
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={()=>setExpandedClient(isExpanded?null:c.id)}>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`font-semibold text-sm ${text}`}>{c.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type==='acheteur'?'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300':'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'}`}>{c.type}</span>
                                {c.mls?<span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-full">MLS {c.mls}</span>:<span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full">MLS à connecter</span>}
                              </div>
                              {c.address&&<div className={`text-xs ${subtext} mb-1`}>{c.address}{c.price&&` · ${c.price}`}</div>}
                              <div className="flex items-center gap-2 flex-wrap mt-1">
                                {flow[currentIdx]&&<span className="text-xs px-2.5 py-1 rounded-lg text-white font-medium" style={{backgroundColor:brandColor+'DD'}}>{flow[currentIdx].icon} {flow[currentIdx].fr}</span>}
                                <span className={`text-xs ${subtext}`}>{completedSteps}/{flow.length} · {isExpanded?'▲':'▼'}</span>
                              </div>
                              {c.contract_expiry&&(
                                <div className={`mt-2 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${contractDays<0?'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-900 dark:text-red-300':contractDays<=7?'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300':`${dark?'bg-gray-800 border-gray-700 text-gray-300':'bg-gray-50 border-gray-200 text-gray-600'}`}`}>
                                  📋 {c.type==='acheteur'?'Contrat acheteur':'Contrat vendeur'} · {contractDays<0?`Expiré (${Math.abs(contractDays)}j)`:contractDays===0?"Aujourd'hui":`${contractDays}j`}
                                </div>
                              )}
                              {(c.deadline_inspection||c.deadline_financing||c.deadline_documents||c.deadline_clauses||c.deadline_deed)&&(
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {[{label:'Inspection',date:c.deadline_inspection},{label:'Financement',date:c.deadline_financing},{label:'Documents',date:c.deadline_documents},{label:'Clauses',date:c.deadline_clauses},{label:'Acte de vente',date:c.deadline_deed}].filter(d=>d.date).map(d=>{
                                    const days=daysUntil(d.date)
                                    const cls=days<0?'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300':days<=3?'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300':'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                    return <span key={d.label} className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{d.label}: {days<0?`${Math.abs(days)}j dépassé`:days===0?'Auj.':`${days}j`}</span>
                                  })}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5 flex-shrink-0" onClick={e=>e.stopPropagation()}>
                              <button onClick={()=>openEdit(c)} className={`text-xs ${dark?'bg-gray-800 hover:bg-gray-700 text-gray-300':'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-3 py-1.5 rounded-lg transition`}>Modifier</button>
                              <button onClick={()=>generateInviteLink(c.id)} className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-3 py-1.5 rounded-lg transition">🔗 Inviter</button>
                              {inviteLinks[c.id]&&<button onClick={()=>{navigator.clipboard.writeText(inviteLinks[c.id]);setCopiedId(c.id);setTimeout(()=>setCopiedId(null),2000)}} className={`text-xs ${dark?'bg-gray-800 text-gray-300':'bg-gray-100 text-gray-700'} px-3 py-1.5 rounded-lg`}>{copiedId===c.id?'✓ Copié!':'📋 Copier'}</button>}
                              {(c.deadline_inspection||c.deadline_financing||c.deadline_documents||c.deadline_clauses||c.deadline_deed)&&(
                                <div className="relative group">
                                  <button className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-3 py-1.5 rounded-lg transition w-full">📅 Cal.</button>
                                  <div className={`absolute right-0 top-full mt-1 ${surface} border ${border} rounded-xl overflow-hidden z-20 hidden group-hover:block w-64 shadow-xl`}>
                                    {[{label:'Inspection',date:c.deadline_inspection},{label:'Financement',date:c.deadline_financing},{label:'Documents',date:c.deadline_documents},{label:'Clauses',date:c.deadline_clauses},{label:'Acte de vente',date:c.deadline_deed}].filter(e=>e.date).map(e=>{
                                      const start=e.date.replace(/-/g,'')
                                      const title=encodeURIComponent(`${e.label} — ${c.name}`)
                                      const details=encodeURIComponent(`Dossier: ${c.address}`)
                                      const gUrl=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}&details=${details}`
                                      const oUrl=`https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${e.date}&enddt=${e.date}&body=${details}`
                                      const ics=['BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN','BEGIN:VEVENT',`SUMMARY:${e.label} — ${c.name}`,`DTSTART;VALUE=DATE:${start}`,`DTEND;VALUE=DATE:${start}`,`DESCRIPTION:Dossier: ${c.address}`,'END:VEVENT','END:VCALENDAR'].join('\r\n')
                                      return(
                                        <div key={e.label} className={`border-b ${border} last:border-0`}>
                                          <div className={`px-3 pt-2 pb-1 text-xs font-medium ${text}`}>📅 {e.label} <span className={subtext}>— {e.date}</span></div>
                                          <div className="flex gap-1 px-3 pb-2">
                                            <a href={gUrl} target="_blank" rel="noopener noreferrer" className={`flex-1 text-center text-xs ${dark?'bg-gray-800 hover:bg-blue-900 hover:text-blue-300 text-gray-300':'bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600'} px-2 py-1.5 rounded-lg`}>🇬 Google</a>
                                            <a href={oUrl} target="_blank" rel="noopener noreferrer" className={`flex-1 text-center text-xs ${dark?'bg-gray-800 hover:bg-blue-900 hover:text-blue-300 text-gray-300':'bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600'} px-2 py-1.5 rounded-lg`}>🪟 Outlook</a>
                                            <button onClick={()=>{const blob=new Blob([ics],{type:'text/calendar'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${e.label}.ics`;a.click();URL.revokeObjectURL(url)}} className={`flex-1 text-center text-xs ${dark?'bg-gray-800 hover:bg-blue-900 hover:text-blue-300 text-gray-300':'bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600'} px-2 py-1.5 rounded-lg`}>🍎 iCloud</button>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                              <button onClick={()=>deleteClient(c.id)} disabled={deleting===c.id} className="text-xs bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 px-3 py-1.5 rounded-lg disabled:opacity-50">
                                {deleting===c.id?'...':'Supprimer'}
                              </button>
                            </div>
                          </div>
                          {isExpanded&&(
                            <div className={`border-t ${border} px-4 pb-5 pt-4`}>
                              <div className="flex items-center justify-between mb-4">
                                <div className={`text-xs ${subtext} uppercase tracking-wider font-medium`}>Progression du dossier</div>
                                <button onClick={()=>setEditingFlow({client:c,flow:getClientFlow(c)})} className="text-xs text-blue-500 hover:text-blue-400">✏️ Modifier le flux</button>
                              </div>
                              <div className="relative">
                                <div className={`absolute left-4 top-4 bottom-4 w-0.5 ${dark?'bg-gray-800':'bg-gray-200'}`}/>
                                <div className="space-y-1">
                                  {flow.map((s,i)=>{
                                    const done=s.status==='done'
                                    const active=i===currentIdx&&!done
                                    return(
                                      <button key={s.id} onClick={()=>updateStepStatus(c,i)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left relative z-10 ${active?(dark?'bg-blue-950 border border-blue-800':'bg-blue-50 border border-blue-200'):done?(dark?'bg-green-950':'bg-green-50'):hoverBg}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 border-2 ${done?'bg-green-500 border-green-500 text-white':active?'border-blue-500 text-blue-500 bg-white dark:bg-gray-900':`${dark?'bg-gray-900 border-gray-700 text-gray-500':'bg-white border-gray-200 text-gray-400'}`}`}>
                                          {done?'✓':s.icon}
                                        </div>
                                        <div className="flex-1">
                                          <div className={`text-xs font-medium ${done?'text-green-600 dark:text-green-400':active?'text-blue-600 dark:text-blue-300':subtext}`}>{s.fr}</div>
                                        </div>
                                        {active&&<span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{backgroundColor:brandColor}}>En cours</span>}
                                        {done&&<span className="text-xs text-green-500">✓</span>}
                                        {s.skippable&&!done&&!active&&<span className={`text-xs ${subtext} opacity-50`}>Optionnel</span>}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                              {c.notes&&<div className={`mt-3 text-xs ${subtext} ${surface2} rounded-xl px-3 py-2 italic`}>📝 {c.notes}</div>}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* CENTRIS TAB */}
            {activeTab==='centris'&&(
              <div>
                {showCentrisForm&&(
                  <div className={`${surface} border ${border} rounded-2xl p-5 mb-6 shadow-lg`}>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`font-semibold ${text}`}>{editingListing?'Modifier la fiche':'Nouvelle fiche Centris'}</div>
                      <button onClick={()=>setShowCentrisForm(false)} className={`${subtext} text-xl`}>×</button>
                    </div>
                    {/* MLS row */}
                    <div className={`flex items-center gap-3 p-4 rounded-xl mb-5 ${dark?'bg-blue-950 border border-blue-900':'bg-blue-50 border border-blue-200'}`}>
                      <div className="flex-1">
                        <label className="text-xs text-blue-400 mb-1 block">Numéro MLS</label>
                        <input value={centrisForm.mls} onChange={e=>sc('mls',e.target.value)} placeholder="27084512"
                          className={`w-full ${dark?'bg-blue-900 border-blue-700 text-white placeholder-blue-400':'bg-white border-blue-300 text-gray-900'} border rounded-lg px-3 py-2 text-sm focus:outline-none`}/>
                      </div>
                      {centrisForm.mls&&(
                        <a href={`https://www.centris.ca/fr/proprietes~a-vendre?uc=1&view=Thumbnail&ls=${centrisForm.mls}`} target="_blank" rel="noopener noreferrer"
                          className="text-white px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0" style={{backgroundColor:brandColor}}>
                          🔍 Ouvrir Centris
                        </a>
                      )}
                    </div>
                    {/* Client + type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                      <div>
                        <label className={`text-xs ${subtext} mb-1 block`}>Lier à un client</label>
                        <select value={centrisForm.client_id} onChange={e=>sc('client_id',e.target.value)} className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`}>
                          <option value="">— Aucun client —</option>
                          {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={`text-xs ${subtext} mb-1 block`}>Type de fiche</label>
                        <div className="flex gap-2">
                          {[{val:'achat',label:'🏠 Achat'},{val:'inscription',label:'📋 Inscription'}].map(t=>(
                            <button key={t.val} type="button" onClick={()=>sc('listing_type',t.val)}
                              className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition ${centrisForm.listing_type===t.val?'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300':'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                      {[{label:'Adresse',key:'address',placeholder:'4782 rue des Érables',span:2},{label:'Ville',key:'city',placeholder:'Laval'},{label:'Prix ($)',key:'price',placeholder:'549000'},{label:'Chambres',key:'bedrooms',placeholder:'3'},{label:'Salles de bain',key:'bathrooms',placeholder:'2'},{label:'Superficie (pi²)',key:'livable_area',placeholder:'1450'},{label:'Année construction',key:'year_built',placeholder:'2005'}].map(f=>(
                        <div key={f.key} className={f.span?`col-span-${f.span}`:''}>
                          <label className={`text-xs ${subtext} mb-1 block`}>{f.label}</label>
                          <input value={centrisForm[f.key]} onChange={e=>sc(f.key,e.target.value)} placeholder={f.placeholder}
                            className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`}/>
                        </div>
                      ))}
                    </div>
                    {/* Property type chips */}
                    <div className="mb-5">
                      <label className={`text-xs ${subtext} mb-2 block`}>Type de propriété</label>
                      <div className="flex flex-wrap gap-2">
                        {propertyTypes.map(t=>(
                          <button key={t} type="button" onClick={()=>sc('property_type',t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${centrisForm.property_type===t?'bg-blue-600 border-blue-500 text-white':'border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Features */}
                    <div className="mb-5">
                      <label className={`text-xs ${subtext} mb-2 block`}>Caractéristiques</label>
                      <div className="flex flex-wrap gap-2">
                        {featureOptions.map(f=>(
                          <button key={f} type="button" onClick={()=>sc('features',centrisForm.features.includes(f)?centrisForm.features.filter(x=>x!==f):[...centrisForm.features,f])}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${centrisForm.features.includes(f)?'bg-blue-600 border-blue-500 text-white':'border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400'}`}>
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Photo URL */}
                    <div className="mb-5">
                      <label className={`text-xs ${subtext} mb-1 block`}>URL photo principale</label>
                      <input value={centrisForm.photo_url} onChange={e=>sc('photo_url',e.target.value)}
                        placeholder="Clic droit sur photo Centris → Copier l'adresse → Coller ici"
                        className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`}/>
                      {centrisForm.photo_url&&<img src={centrisForm.photo_url} alt="Aperçu" className="mt-2 w-full h-36 object-cover rounded-xl border border-gray-200 dark:border-gray-700" onError={e=>e.target.style.display='none'}/>}
                      <div className={`text-xs ${subtext} mt-1`}>Sur Centris: clic droit sur la photo → "Copier l'adresse de l'image"</div>
                    </div>
                    {/* Description */}
                    <div className="mb-5">
                      <label className={`text-xs ${subtext} mb-1 block`}>Description</label>
                      <textarea value={centrisForm.description} onChange={e=>sc('description',e.target.value)} placeholder="Copiez la description de Centris..." className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none h-20 resize-none`}/>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={saveListing} disabled={!centrisForm.mls||savingListing} className="text-white px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50" style={{backgroundColor:brandColor}}>
                        {savingListing?'Enregistrement...':editingListing?'Mettre à jour':'Enregistrer la fiche'}
                      </button>
                      <button onClick={()=>setShowCentrisForm(false)} className={`${subtext} text-sm px-4 py-2.5 rounded-xl border ${border2}`}>Annuler</button>
                    </div>
                  </div>
                )}

                {/* Listings grid */}
                {listings.length===0&&!showCentrisForm?(
                  <div className={`text-center ${subtext} py-16 ${surface} border ${border} rounded-2xl`}>
                    <div className="text-5xl mb-4">🏠</div>
                    <div className={`font-medium ${text} mb-2`}>Aucune fiche Centris</div>
                    <div className="text-sm mb-4">Ajoutez votre première fiche pour commencer</div>
                    <button onClick={()=>setShowCentrisForm(true)} className="text-white px-5 py-2 rounded-xl text-sm" style={{backgroundColor:brandColor}}>+ Nouvelle fiche</button>
                  </div>
                ):(
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {listings.map(l=>(
                      <div key={l.id} className={`${surface} border ${border} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                        <div className="h-40 relative" style={{backgroundColor:dark?'#1f2937':'#f3f4f6'}}>
                          {l.photo_url?<img src={l.photo_url} alt={l.address} className="w-full h-full object-cover" onError={e=>e.target.style.display='none'}/>:<div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>}
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded-lg">MLS {l.mls}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-lg ${l.listing_type==='inscription'?'bg-violet-600 text-white':'bg-blue-600 text-white'}`}>{l.listing_type==='inscription'?'Inscription':'Achat'}</span>
                          </div>
                          {l.price&&<div className="absolute bottom-2 left-2 bg-black bg-opacity-80 text-white text-sm font-bold px-2.5 py-1 rounded-lg">{parseInt(l.price).toLocaleString()} $</div>}
                        </div>
                        <div className="p-4">
                          <div className={`font-medium text-sm ${text} mb-0.5`}>{l.address}</div>
                          <div className={`text-xs ${subtext} mb-2`}>{l.city}</div>
                          {l.clients&&<div className="text-xs text-blue-500 mb-2">👤 {l.clients.name}</div>}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {l.property_type&&<span className={`text-xs ${surface2} ${text} px-2 py-0.5 rounded-lg`}>{l.property_type}</span>}
                            {l.bedrooms&&<span className={`text-xs ${surface2} ${text} px-2 py-0.5 rounded-lg`}>{l.bedrooms} ch.</span>}
                            {l.bathrooms&&<span className={`text-xs ${surface2} ${text} px-2 py-0.5 rounded-lg`}>{l.bathrooms} sdb.</span>}
                            {l.livable_area&&<span className={`text-xs ${surface2} ${text} px-2 py-0.5 rounded-lg`}>{parseInt(l.livable_area).toLocaleString()} pi²</span>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={()=>{setEditingListing(l);setCentrisForm({client_id:l.client_id||'',mls:l.mls||'',address:l.address||'',city:l.city||'',price:l.price||'',property_type:l.property_type||'',bedrooms:l.bedrooms||'',bathrooms:l.bathrooms||'',livable_area:l.livable_area||'',year_built:l.year_built||'',photo_url:l.photo_url||'',description:l.description||'',features:l.features||[],listing_type:l.listing_type||'achat'});setShowCentrisForm(true)}}
                              className={`flex-1 text-xs ${dark?'bg-gray-800 hover:bg-gray-700 text-gray-300':'bg-gray-100 hover:bg-gray-200 text-gray-700'} py-1.5 rounded-lg`}>Modifier</button>
                            <a href={`https://www.centris.ca/fr/proprietes~a-vendre?uc=1&view=Thumbnail&ls=${l.mls}`} target="_blank" rel="noopener noreferrer"
                              className="flex-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 py-1.5 rounded-lg text-center">Centris →</a>
                            <button onClick={async()=>{if(confirm('Supprimer?')){await supabase.from('listings').delete().eq('id',l.id);await loadListings()}}}
                              className="text-xs bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 px-3 py-1.5 rounded-lg">✕</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PARAMETRES TAB */}
            {activeTab==='parametres'&&(
              <div className="max-w-2xl space-y-5">
                <div className={`${surface} border ${border} rounded-2xl p-5`}>
                  <div className={`font-semibold ${text} mb-4`}>Profil de l'agent</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {[{label:'Nom complet',key:'name',placeholder:'Jean-François Tremblay'},{label:'Agence / Courtage',key:'brokerage',placeholder:'eXp Realty'},{label:'Courriel',key:'email',placeholder:'agent@email.com'},{label:'Téléphone',key:'phone',placeholder:'514-555-0100'}].map(f=>(
                      <div key={f.key}>
                        <label className={`text-xs ${subtext} mb-1 block`}>{f.label}</label>
                        <input value={profileForm[f.key]} onChange={e=>setProfileForm({...profileForm,[f.key]:e.target.value})} placeholder={f.placeholder}
                          className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`}/>
                      </div>
                    ))}
                  </div>
                  <div className="mb-4">
                    <label className={`text-xs ${subtext} mb-1 block`}>Message de bienvenue (affiché aux clients)</label>
                    <textarea value={profileForm.welcome_message} onChange={e=>setProfileForm({...profileForm,welcome_message:e.target.value})}
                      placeholder="Bienvenue dans votre portail immobilier. Je suis là pour vous accompagner à chaque étape."
                      className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none h-20 resize-none`}/>
                  </div>
                </div>

                {/* Branding */}
                <div className={`${surface} border ${border} rounded-2xl p-5`}>
                  <div className={`font-semibold ${text} mb-4`}>Apparence & marque</div>
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <label className={`text-xs ${subtext} mb-1 block`}>Couleur de marque</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={profileForm.brand_color} onChange={e=>setProfileForm({...profileForm,brand_color:e.target.value})}
                          className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"/>
                        <span className={`text-sm ${text} font-mono`}>{profileForm.brand_color}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className={`text-xs ${subtext} mb-1 block`}>Aperçu</label>
                      <div className="h-10 rounded-xl flex items-center px-4 text-white text-sm font-medium" style={{backgroundColor:profileForm.brand_color}}>
                        ImmoPortal — {profileForm.name||'Votre nom'}
                      </div>
                    </div>
                  </div>

                  {/* Banner upload */}
                  <div className="mb-4">
                    <label className={`text-xs ${subtext} mb-2 block`}>Bannière agent (affichée dans le portail client)</label>
                    {(profileForm.banner_url||agentProfile?.banner_url)&&(
                      <div className="mb-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img src={profileForm.banner_url||agentProfile?.banner_url} alt="Bannière" className="w-full h-28 object-cover"/>
                      </div>
                    )}
                    <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden"/>
                    <button onClick={()=>bannerInputRef.current?.click()} disabled={uploadingBanner}
                      className={`${dark?'bg-gray-800 hover:bg-gray-700 text-gray-300':'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-xl text-sm transition disabled:opacity-50`}>
                      {uploadingBanner?'Téléchargement...':'📷 Choisir une bannière'}
                    </button>
                    <div className={`text-xs ${subtext} mt-1`}>Format recommandé: 1200×300px. La bannière apparaît en haut du portail de vos clients.</div>
                  </div>

                  {/* Logo URL */}
                  <div>
                    <label className={`text-xs ${subtext} mb-1 block`}>URL du logo (optionnel)</label>
                    <input value={profileForm.logo_url} onChange={e=>setProfileForm({...profileForm,logo_url:e.target.value})}
                      placeholder="https://votresite.com/logo.png"
                      className={`w-full ${inputCls} border rounded-xl px-3 py-2 text-sm focus:outline-none`}/>
                  </div>
                </div>

                {/* Theme */}
                <div className={`${surface} border ${border} rounded-2xl p-5`}>
                  <div className={`font-semibold ${text} mb-4`}>Thème d'affichage</div>
                  <div className="flex gap-3">
                    <button onClick={()=>{setDark(false);localStorage.setItem('immo-dark','false')}}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition flex items-center justify-center gap-2 ${!dark?'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300':'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                      ☀️ Mode clair
                    </button>
                    <button onClick={()=>{setDark(true);localStorage.setItem('immo-dark','true')}}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition flex items-center justify-center gap-2 ${dark?'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300':'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                      🌙 Mode sombre
                    </button>
                  </div>
                </div>

                <button onClick={saveProfile} disabled={savingProfile}
                  className="w-full text-white py-3 rounded-xl text-sm font-medium transition disabled:opacity-50 shadow-sm"
                  style={{backgroundColor:brandColor}}>
                  {savingProfile?'Enregistrement...':'Enregistrer les paramètres'}
                </button>
              </div>
            )}

            {/* OTHER TABS */}
            {!['dossiers','centris','parametres'].includes(activeTab)&&(
              <div className={`text-center ${subtext} py-16 ${surface} border ${border} rounded-2xl`}>
                <div className="text-4xl mb-3">🚧</div>
                <div className={`font-medium ${text} mb-1`}>En construction</div>
                <div className="text-sm">Cette section sera disponible prochainement.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      {showBottomBar&&(
        <div className={`fixed bottom-0 left-0 right-0 ${surface} border-t ${border} flex z-20`}>
          {tabs.map(t=><NavItem key={t.id} tab={t} active={activeTab===t.id}/>)}
        </div>
      )}

      {/* Flow editor modal */}
      {editingFlow&&(
        <FlowEditor flow={editingFlow.flow} onSave={nf=>saveFlow(editingFlow.client,nf)} onClose={()=>setEditingFlow(null)} dark={dark} brandColor={brandColor}/>
      )}
    </div>
  )
}
