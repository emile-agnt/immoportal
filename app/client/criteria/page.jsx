'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const t = {
  fr: {
    title: 'Mes critères de recherche',
    sub: 'Remplissez vos critères et votre courtier sera notifié automatiquement.',
    save: 'Enregistrer mes critères',
    saving: 'Enregistrement...',
    saved: 'Critères enregistrés! Votre courtier a été notifié.',
    back: '← Retour au portail',
    sections: {
      location: 'Localisation',
      budget: 'Budget',
      property: 'Type de propriété',
      size: 'Dimensions',
      parking: 'Stationnement',
      features: 'Caractéristiques',
      extras: 'Incontournables & notes',
    },
    fields: {
      regions: 'Régions',
      cities: 'Villes / Municipalités',
      neighbourhoods: 'Quartiers (texte libre)',
      budget_min: 'Budget minimum ($)',
      budget_max: 'Budget maximum ($)',
      property_types: 'Genre de propriété',
      building_types: 'Type de bâtiment',
      bedrooms_min: 'Chambres minimum',
      bathrooms_min: 'Salles de bain minimum',
      powder_rooms: 'Salles d\'eau',
      livable_area_min: 'Superficie habitable min (pi²)',
      lot_area_min: 'Superficie terrain min (pi²)',
      indoor_parking: 'Stationnement intérieur',
      outdoor_parking: 'Stationnement extérieur',
      garage: 'Garage',
      pool: 'Piscine',
      waterfront: 'Bord de l\'eau',
      intergenerational: 'Intergénérationnel',
      new_construction: 'Nouvelle construction',
      must_haves: 'Incontournables',
      deal_breakers: 'Éliminatoires (texte libre)',
      notes: 'Notes pour le courtier',
    }
  },
  en: {
    title: 'My Search Criteria',
    sub: 'Fill in your criteria and your agent will be notified automatically.',
    save: 'Save my criteria',
    saving: 'Saving...',
    saved: 'Criteria saved! Your agent has been notified.',
    back: '← Back to portal',
    sections: {
      location: 'Location',
      budget: 'Budget',
      property: 'Property Type',
      size: 'Dimensions',
      parking: 'Parking',
      features: 'Features',
      extras: 'Must-haves & notes',
    },
    fields: {
      regions: 'Regions',
      cities: 'Cities / Municipalities',
      neighbourhoods: 'Neighbourhoods (free text)',
      budget_min: 'Minimum budget ($)',
      budget_max: 'Maximum budget ($)',
      property_types: 'Property type',
      building_types: 'Building type',
      bedrooms_min: 'Minimum bedrooms',
      bathrooms_min: 'Minimum bathrooms',
      powder_rooms: 'Powder rooms',
      livable_area_min: 'Min livable area (sq ft)',
      lot_area_min: 'Min lot area (sq ft)',
      indoor_parking: 'Indoor parking',
      outdoor_parking: 'Outdoor parking',
      garage: 'Garage',
      pool: 'Pool',
      waterfront: 'Waterfront',
      intergenerational: 'Intergenerational',
      new_construction: 'New construction',
      must_haves: 'Must-haves',
      deal_breakers: 'Deal breakers (free text)',
      notes: 'Notes for agent',
    }
  }
}

const regionOptions = ['Laurentides', 'Laval', 'Montréal', 'Montérégie', 'Lanaudière', 'Abitibi-Témiscamingue', 'Outaouais', 'Estrie', 'Mauricie', 'Québec', 'Chaudière-Appalaches', 'Bas-Saint-Laurent', 'Autre']
const cityOptions = ['Laval', 'Montréal', 'Longueuil', 'Québec', 'Blainville', 'Boisbriand', 'Saint-Jérôme', 'Terrebonne', 'Repentigny', 'Brossard', 'Saint-Lambert', 'Autre']
const propertyTypes = ['Maison', 'Condo', 'Duplex', 'Triplex', 'Quadruplex', 'Quintuplex', 'Terrain', 'Chalet', 'Autre']
const buildingTypes = ['Isolé (détaché)', 'Jumelé', 'En rangée', 'En rangée sur coin', 'Quadrex', 'Tour d\'habitation', 'Autre']
const mustHaveOptions = ['Sous-sol aménagé', 'Cour arrière', 'Balcon', 'Terrasse', 'Cabanon', 'Entrée double', 'Foyer', 'Vide sanitaire', 'Grenier', 'Salle de jeux', 'Bureau à domicile', 'Cuisine ouverte', 'Îlot de cuisine', 'Dressing', 'Bain sur pattes', 'Douche italienne', 'Thermopompe', 'Géothermie', 'Panneaux solaires', 'Génératrice', 'Accès lac', 'Vue sur l\'eau', 'Quartier tranquille', 'Proche école', 'Proche transport en commun', 'Proche autoroute']

function MultiSelect({ options, value, onChange, placeholder }) {
  const selected = value || []
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} type="button"
          onClick={() => onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o])}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${selected.includes(o) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'}`}>
          {o}
        </button>
      ))}
    </div>
  )
}

function Toggle({ value, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition w-full ${value ? 'bg-blue-950 border-blue-700 text-blue-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${value ? 'border-blue-400 bg-blue-400' : 'border-gray-600'}`}>
        {value && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <span className="text-sm">{label}</span>
    </button>
  )
}

export default function BuyerCriteria() {
  const [client, setClient] = useState(null)
  const [language, setLanguage] = useState('fr')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [criteria, setCriteria] = useState({
    regions: [], cities: [], neighbourhoods: '',
    budget_min: '', budget_max: '',
    property_types: [], building_types: [],
    bedrooms_min: '', bathrooms_min: '', powder_rooms: '',
    livable_area_min: '', lot_area_min: '',
    garage: false, indoor_parking: '', outdoor_parking: '',
    pool: false, waterfront: false, intergenerational: false, new_construction: false,
    must_haves: [], deal_breakers: '', notes: ''
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/client/login'; return }
    const { data: clientData } = await supabase.from('clients').select('*').eq('user_id', user.id).single()
    if (clientData) {
      setClient(clientData)
      setLanguage(clientData.language || 'fr')
      const { data: existingCriteria } = await supabase.from('buyer_criteria').select('*').eq('client_id', clientData.id).single()
      if (existingCriteria) {
        setCriteria({
          regions: existingCriteria.regions || [],
          cities: existingCriteria.cities || [],
          neighbourhoods: existingCriteria.neighbourhoods || '',
          budget_min: existingCriteria.budget_min || '',
          budget_max: existingCriteria.budget_max || '',
          property_types: existingCriteria.property_types || [],
          building_types: existingCriteria.building_types || [],
          bedrooms_min: existingCriteria.bedrooms_min || '',
          bathrooms_min: existingCriteria.bathrooms_min || '',
          powder_rooms: existingCriteria.powder_rooms || '',
          livable_area_min: existingCriteria.livable_area_min || '',
          lot_area_min: existingCriteria.lot_area_min || '',
          garage: existingCriteria.garage || false,
          indoor_parking: existingCriteria.indoor_parking || '',
          outdoor_parking: existingCriteria.outdoor_parking || '',
          pool: existingCriteria.pool || false,
          waterfront: existingCriteria.waterfront || false,
          intergenerational: existingCriteria.intergenerational || false,
          new_construction: existingCriteria.new_construction || false,
          must_haves: existingCriteria.must_haves || [],
          deal_breakers: existingCriteria.deal_breakers || '',
          notes: existingCriteria.notes || ''
        })
      }
    }
    setLoading(false)
  }

  async function saveCriteria() {
    setSaving(true)
    const payload = {
      client_id: client.id,
      ...criteria,
      budget_min: criteria.budget_min ? parseInt(criteria.budget_min) : null,
      budget_max: criteria.budget_max ? parseInt(criteria.budget_max) : null,
      bedrooms_min: criteria.bedrooms_min ? parseInt(criteria.bedrooms_min) : null,
      bathrooms_min: criteria.bathrooms_min ? parseInt(criteria.bathrooms_min) : null,
      powder_rooms: criteria.powder_rooms ? parseInt(criteria.powder_rooms) : null,
      livable_area_min: criteria.livable_area_min ? parseInt(criteria.livable_area_min) : null,
      lot_area_min: criteria.lot_area_min ? parseInt(criteria.lot_area_min) : null,
      indoor_parking: criteria.indoor_parking ? parseInt(criteria.indoor_parking) : null,
      outdoor_parking: criteria.outdoor_parking ? parseInt(criteria.outdoor_parking) : null,
      updated_at: new Date().toISOString(),
      notified_agent: false
    }

    const { data: existing } = await supabase.from('buyer_criteria').select('id').eq('client_id', client.id).single()
    if (existing) {
      await supabase.from('buyer_criteria').update(payload).eq('client_id', client.id)
    } else {
      await supabase.from('buyer_criteria').insert([payload])
    }

    await fetch('/api/criteria-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id, clientName: client.name, criteria })
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 4000)
  }

  const tx = t[language]

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Chargement...</div>
    </div>
  )

  const set = (key, val) => setCriteria(prev => ({ ...prev, [key]: val }))

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex items-center justify-between">
        <a href="/client" className="text-sm text-gray-400 hover:text-white transition">{tx.back}</a>
        <div className="flex border border-gray-700 rounded-lg overflow-hidden">
          <button onClick={() => setLanguage('fr')} className={`px-3 py-1 text-xs transition ${language === 'fr' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>FR</button>
          <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-xs transition ${language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>EN</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-5 space-y-4 pb-24">
        <div>
          <h1 className="text-xl font-semibold text-white">{tx.title}</h1>
          <p className="text-sm text-gray-400 mt-1">{tx.sub}</p>
        </div>

        {saved && (
          <div className="bg-green-950 border border-green-800 rounded-xl px-4 py-3 text-green-300 text-sm">
            ✓ {tx.saved}
          </div>
        )}

        {/* Location */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">{tx.sections.location}</div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">{tx.fields.regions}</label>
            <MultiSelect options={regionOptions} value={criteria.regions} onChange={v => set('regions', v)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">{tx.fields.cities}</label>
            <MultiSelect options={cityOptions} value={criteria.cities} onChange={v => set('cities', v)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">{tx.fields.neighbourhoods}</label>
            <input value={criteria.neighbourhoods} onChange={e => set('neighbourhoods', e.target.value)}
              placeholder="ex: Sainte-Rose, Vimont..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        {/* Budget */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider">{tx.sections.budget}</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{tx.fields.budget_min}</label>
              <input type="number" value={criteria.budget_min} onChange={e => set('budget_min', e.target.value)}
                placeholder="200 000"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{tx.fields.budget_max}</label>
              <input type="number" value={criteria.budget_max} onChange={e => set('budget_max', e.target.value)}
                placeholder="600 000"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          {criteria.budget_min && criteria.budget_max && (
            <div className="text-xs text-blue-400 bg-blue-950 border border-blue-900 rounded-lg px-3 py-2">
              Budget: {parseInt(criteria.budget_min).toLocaleString()}$ — {parseInt(criteria.budget_max).toLocaleString()}$
            </div>
          )}
        </div>

        {/* Property type */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">{tx.sections.property}</div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">{tx.fields.property_types}</label>
            <MultiSelect options={propertyTypes} value={criteria.property_types} onChange={v => set('property_types', v)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">{tx.fields.building_types}</label>
            <MultiSelect options={buildingTypes} value={criteria.building_types} onChange={v => set('building_types', v)} />
          </div>
        </div>

        {/* Size */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider">{tx.sections.size}</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: tx.fields.bedrooms_min, key: 'bedrooms_min', placeholder: '3' },
              { label: tx.fields.bathrooms_min, key: 'bathrooms_min', placeholder: '1' },
              { label: tx.fields.powder_rooms, key: 'powder_rooms', placeholder: '1' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                <input type="number" value={criteria[f.key]} onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: tx.fields.livable_area_min, key: 'livable_area_min', placeholder: '1200' },
              { label: tx.fields.lot_area_min, key: 'lot_area_min', placeholder: '3000' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                <input type="number" value={criteria[f.key]} onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Parking */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider">{tx.sections.parking}</div>
          <Toggle value={criteria.garage} onChange={v => set('garage', v)} label={tx.fields.garage} />
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: tx.fields.indoor_parking, key: 'indoor_parking', placeholder: '1' },
              { label: tx.fields.outdoor_parking, key: 'outdoor_parking', placeholder: '2' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                <input type="number" value={criteria[f.key]} onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider">{tx.sections.features}</div>
          <Toggle value={criteria.pool} onChange={v => set('pool', v)} label={tx.fields.pool} />
          <Toggle value={criteria.waterfront} onChange={v => set('waterfront', v)} label={tx.fields.waterfront} />
          <Toggle value={criteria.intergenerational} onChange={v => set('intergenerational', v)} label={tx.fields.intergenerational} />
          <Toggle value={criteria.new_construction} onChange={v => set('new_construction', v)} label={tx.fields.new_construction} />
        </div>

        {/* Must haves */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">{tx.sections.extras}</div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">{tx.fields.must_haves}</label>
            <MultiSelect options={mustHaveOptions} value={criteria.must_haves} onChange={v => set('must_haves', v)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">{tx.fields.deal_breakers}</label>
            <textarea value={criteria.deal_breakers} onChange={e => set('deal_breakers', e.target.value)}
              placeholder="ex: Pas de piscine creusée, pas de voisins immédiats..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 h-16 resize-none" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">{tx.fields.notes}</label>
            <textarea value={criteria.notes} onChange={e => set('notes', e.target.value)}
              placeholder="ex: Idéalement proche de l'école Saint-Jean..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 h-16 resize-none" />
          </div>
        </div>
      </div>

      {/* Sticky save button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-4">
        <div className="max-w-lg mx-auto">
          <button onClick={saveCriteria} disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition">
            {saving ? tx.saving : tx.save}
          </button>
        </div>
      </div>
    </div>
  )
}
