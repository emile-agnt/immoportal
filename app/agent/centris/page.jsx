'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const propertyTypes = ['Maison', 'Condo', 'Duplex', 'Triplex', 'Quadruplex', 'Quintuplex', 'Terrain', 'Chalet', 'Autre']
const buildingTypes = ['Isolé (détaché)', 'Jumelé', 'En rangée', 'En rangée sur coin', 'Quadrex', 'Tour d\'habitation']
const featureOptions = ['Piscine', 'Garage', 'Sous-sol aménagé', 'Cour arrière', 'Balcon', 'Terrasse', 'Foyer', 'Thermopompe', 'Bord de l\'eau', 'Vue sur l\'eau', 'Intergénérationnel', 'Nouvelle construction']

function Chip({ label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${selected ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'}`}>
      {label}
    </button>
  )
}

export default function CentrisTab() {
  const [clients, setClients] = useState([])
  const [listings, setListings] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingListing, setEditingListing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState(null)

  const emptyForm = {
    client_id: '',
    mls: '',
    address: '',
    city: '',
    province: 'QC',
    postal_code: '',
    price: '',
    property_type: '',
    building_type: '',
    bedrooms: '',
    bathrooms: '',
    powder_rooms: '',
    livable_area: '',
    lot_area: '',
    year_built: '',
    indoor_parking: '',
    outdoor_parking: '',
    photo_url: '',
    description: '',
    features: [],
    listing_type: 'achat',
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data: clientData } = await supabase.from('clients').select('id, name, type, address').order('created_at', { ascending: false })
    setClients(clientData || [])
    const { data: listingData } = await supabase.from('listings').select('*, clients(name)').order('created_at', { ascending: false })
    setListings(listingData || [])
    setLoading(false)
  }

  function openAdd() {
    setEditingListing(null)
    setForm(emptyForm)
    setShowForm(true)
    setSelectedClient(null)
  }

  function openEdit(listing) {
    setEditingListing(listing)
    setForm({
      client_id: listing.client_id || '',
      mls: listing.mls || '',
      address: listing.address || '',
      city: listing.city || '',
      province: listing.province || 'QC',
      postal_code: listing.postal_code || '',
      price: listing.price || '',
      property_type: listing.property_type || '',
      building_type: listing.building_type || '',
      bedrooms: listing.bedrooms || '',
      bathrooms: listing.bathrooms || '',
      powder_rooms: listing.powder_rooms || '',
      livable_area: listing.livable_area || '',
      lot_area: listing.lot_area || '',
      year_built: listing.year_built || '',
      indoor_parking: listing.indoor_parking || '',
      outdoor_parking: listing.outdoor_parking || '',
      photo_url: listing.photo_url || '',
      description: listing.description || '',
      features: listing.features || [],
      listing_type: listing.listing_type || 'achat',
    })
    setShowForm(true)
  }

  async function saveListing() {
    setSaving(true)
    const payload = {
      ...form,
      price: form.price ? parseInt(form.price.toString().replace(/\s/g, '')) : null,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
      powder_rooms: form.powder_rooms ? parseInt(form.powder_rooms) : null,
      livable_area: form.livable_area ? parseInt(form.livable_area) : null,
      lot_area: form.lot_area ? parseInt(form.lot_area) : null,
      year_built: form.year_built ? parseInt(form.year_built) : null,
      indoor_parking: form.indoor_parking ? parseInt(form.indoor_parking) : null,
      outdoor_parking: form.outdoor_parking ? parseInt(form.outdoor_parking) : null,
    }
    if (editingListing) {
      await supabase.from('listings').update(payload).eq('id', editingListing.id)
    } else {
      await supabase.from('listings').insert([payload])
    }
    setShowForm(false)
    setEditingListing(null)
    setForm(emptyForm)
    await loadData()
    setSaving(false)
  }

  async function deleteListing(id) {
    if (!confirm('Supprimer cette fiche?')) return
    await supabase.from('listings').delete().eq('id', id)
    await loadData()
  }

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))
  const toggleFeature = (f) => set('features', form.features.includes(f) ? form.features.filter(x => x !== f) : [...form.features, f])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/agent" className="text-gray-400 hover:text-white text-sm transition">← Dashboard</a>
          <span className="text-gray-600">|</span>
          <span className="text-lg font-semibold">Fiches Centris</span>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">
          + Nouvelle fiche
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Form */}
        {showForm && (
          <div className="bg-gray-900 border border-blue-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="font-semibold text-lg">{editingListing ? 'Modifier la fiche' : 'Nouvelle fiche Centris'}</div>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>

            {/* MLS + Centris link */}
            <div className="bg-blue-950 border border-blue-900 rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-blue-300 mb-1 block">Numéro MLS</label>
                <input value={form.mls} onChange={e => set('mls', e.target.value)}
                  placeholder="27084512"
                  className="w-full bg-blue-900 border border-blue-700 rounded-lg px-3 py-2 text-white placeholder-blue-400 focus:outline-none focus:border-blue-400 text-sm" />
              </div>
              {form.mls && (
                <a href={`https://www.centris.ca/fr/proprietes~a-vendre?uc=1&view=Thumbnail&ls=${form.mls}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 flex-shrink-0">
                  🔍 Ouvrir sur Centris
                </a>
              )}
            </div>

            {/* Client link */}
            <div className="mb-6">
              <label className="text-xs text-gray-400 mb-2 block">Lier à un client</label>
              <select value={form.client_id} onChange={e => set('client_id', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="">— Aucun client sélectionné —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.address || 'Sans adresse'}</option>
                ))}
              </select>
            </div>

            {/* Listing type */}
            <div className="mb-6">
              <label className="text-xs text-gray-400 mb-2 block">Type de fiche</label>
              <div className="flex gap-3">
                {[{ val: 'achat', label: '🏠 Achat (acheteur)' }, { val: 'inscription', label: '📋 Inscription (vendeur)' }].map(t => (
                  <button key={t.val} type="button" onClick={() => set('listing_type', t.val)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition ${form.listing_type === t.val ? 'border-blue-500 bg-blue-950 text-blue-300' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Adresse</div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Adresse civique</label>
                <input value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="4782 rue des Érables"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Ville</label>
                <input value={form.city} onChange={e => set('city', e.target.value)}
                  placeholder="Laval"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Code postal</label>
                <input value={form.postal_code} onChange={e => set('postal_code', e.target.value)}
                  placeholder="H7P 2K4"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Prix & type</div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Prix demandé ($)</label>
                <input value={form.price} onChange={e => set('price', e.target.value)}
                  placeholder="549000"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Année de construction</label>
                <input value={form.year_built} onChange={e => set('year_built', e.target.value)}
                  placeholder="2005"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Genre de propriété</label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map(t => (
                    <Chip key={t} label={t} selected={form.property_type === t} onClick={() => set('property_type', t)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Type de bâtiment</label>
                <div className="flex flex-wrap gap-2">
                  {buildingTypes.map(t => (
                    <Chip key={t} label={t} selected={form.building_type === t} onClick={() => set('building_type', t)} />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Pièces</div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Chambres', key: 'bedrooms', placeholder: '3' },
                { label: 'Salles de bain', key: 'bathrooms', placeholder: '2' },
                { label: 'Salles d\'eau', key: 'powder_rooms', placeholder: '1' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                  <input type="number" value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Superficie</div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Superficie habitable (pi²)', key: 'livable_area', placeholder: '1450' },
                { label: 'Superficie terrain (pi²)', key: 'lot_area', placeholder: '6000' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                  <input type="number" value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Stationnement</div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Stationnement intérieur', key: 'indoor_parking', placeholder: '1' },
                { label: 'Stationnement extérieur', key: 'outdoor_parking', placeholder: '2' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                  <input type="number" value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Caractéristiques</div>
            <div className="flex flex-wrap gap-2 mb-6">
              {featureOptions.map(f => (
                <Chip key={f} label={f} selected={form.features.includes(f)} onClick={() => toggleFeature(f)} />
              ))}
            </div>

            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Photo & description</div>
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">URL de la photo principale</label>
                <div className="flex gap-2">
                  <input value={form.photo_url} onChange={e => set('photo_url', e.target.value)}
                    placeholder="Clic droit sur la photo Centris → Copier l'adresse de l'image → Coller ici"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                </div>
                {form.photo_url && (
                  <img src={form.photo_url} alt="Aperçu" className="mt-2 w-full h-40 object-cover rounded-xl border border-gray-700" onError={e => e.target.style.display = 'none'} />
                )}
                <div className="text-xs text-gray-600 mt-1">Sur Centris: clic droit sur la photo principale → "Copier l'adresse de l'image" → coller ici</div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Copiez la description de la fiche Centris..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 h-24 resize-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={saveListing} disabled={!form.mls || saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">
                {saving ? 'Enregistrement...' : editingListing ? 'Mettre à jour' : 'Enregistrer la fiche'}
              </button>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2.5 rounded-xl border border-gray-700 transition">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Listings grid */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">Chargement...</div>
        ) : listings.length === 0 && !showForm ? (
          <div className="text-center text-gray-500 py-16 bg-gray-900 border border-gray-800 rounded-2xl">
            <div className="text-5xl mb-4">🏠</div>
            <div className="font-medium text-white mb-1">Aucune fiche Centris</div>
            <div className="text-sm mb-4">Ajoutez votre première fiche pour commencer</div>
            <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm transition">
              + Nouvelle fiche
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {listings.map(l => (
              <div key={l.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition">
                {/* Photo */}
                <div className="h-44 bg-gray-800 relative">
                  {l.photo_url ? (
                    <img src={l.photo_url} alt={l.address} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-700">🏠</div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-lg">MLS {l.mls}</span>
                    <span className={`text-xs px-2 py-1 rounded-lg ${l.listing_type === 'inscription' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'}`}>
                      {l.listing_type === 'inscription' ? 'Inscription' : 'Achat'}
                    </span>
                  </div>
                  {l.price && (
                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-80 text-white text-sm font-semibold px-3 py-1 rounded-lg">
                      {parseInt(l.price).toLocaleString()} $
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="font-medium text-sm text-white mb-0.5">{l.address}</div>
                  <div className="text-xs text-gray-400 mb-2">{l.city} {l.postal_code}</div>

                  {l.clients && (
                    <div className="text-xs text-blue-400 mb-2">👤 {l.clients.name}</div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {l.property_type && <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-lg">{l.property_type}</span>}
                    {l.bedrooms && <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-lg">{l.bedrooms} ch.</span>}
                    {l.bathrooms && <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-lg">{l.bathrooms} sdb.</span>}
                    {l.livable_area && <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-lg">{parseInt(l.livable_area).toLocaleString()} pi²</span>}
                    {l.year_built && <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-lg">{l.year_built}</span>}
                  </div>

                  {l.features && l.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {l.features.slice(0, 3).map(f => (
                        <span key={f} className="text-xs bg-green-950 text-green-400 border border-green-900 px-2 py-0.5 rounded-lg">{f}</span>
                      ))}
                      {l.features.length > 3 && <span className="text-xs text-gray-500">+{l.features.length - 3}</span>}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => openEdit(l)} className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 rounded-lg transition">
                      Modifier
                    </button>
                    <a href={`https://www.centris.ca/fr/proprietes~a-vendre?uc=1&view=Thumbnail&ls=${l.mls}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-xs bg-blue-950 hover:bg-blue-900 text-blue-300 py-1.5 rounded-lg transition text-center">
                      Centris →
                    </a>
                    <button onClick={() => deleteListing(l.id)} className="text-xs bg-red-950 hover:bg-red-900 text-red-400 px-3 py-1.5 rounded-lg transition">
                      ✕
                    </button>
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
