import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  const { clientId, clientName, criteria } = await req.json()

  const { data: client } = await supabase
    .from('clients')
    .select('agent_email')
    .eq('id', clientId)
    .single()

  const agentEmail = client?.agent_email

  await supabase
    .from('clients')
    .update({
      criteria_alert: true,
      criteria_updated_at: new Date().toISOString()
    })
    .eq('id', clientId)

  const emailBody = `
Votre client ${clientName} a mis à jour ses critères de recherche.

LOCALISATION
Régions: ${criteria.regions?.join(', ') || 'Non spécifié'}
Villes: ${criteria.cities?.join(', ') || 'Non spécifié'}
Quartiers: ${criteria.neighbourhoods || 'Non spécifié'}

BUDGET
Min: ${criteria.budget_min ? `${criteria.budget_min.toLocaleString()}$` : 'Non spécifié'}
Max: ${criteria.budget_max ? `${criteria.budget_max.toLocaleString()}$` : 'Non spécifié'}

PROPRIÉTÉ
Types: ${criteria.property_types?.join(', ') || 'Non spécifié'}
Bâtiment: ${criteria.building_types?.join(', ') || 'Non spécifié'}

DIMENSIONS
Chambres min: ${criteria.bedrooms_min || 'Non spécifié'}
Salles de bain min: ${criteria.bathrooms_min || 'Non spécifié'}
Superficie habitable min: ${criteria.livable_area_min ? `${criteria.livable_area_min} pi²` : 'Non spécifié'}
Superficie terrain min: ${criteria.lot_area_min ? `${criteria.lot_area_min} pi²` : 'Non spécifié'}

STATIONNEMENT
Garage: ${criteria.garage ? 'Oui' : 'Non'}
Stationnement intérieur: ${criteria.indoor_parking || 'Non spécifié'}
Stationnement extérieur: ${criteria.outdoor_parking || 'Non spécifié'}

CARACTÉRISTIQUES
Piscine: ${criteria.pool ? 'Oui' : 'Non'}
Bord de l'eau: ${criteria.waterfront ? 'Oui' : 'Non'}
Intergénérationnel: ${criteria.intergenerational ? 'Oui' : 'Non'}
Nouvelle construction: ${criteria.new_construction ? 'Oui' : 'Non'}

INCONTOURNABLES
${criteria.must_haves?.join(', ') || 'Non spécifié'}

ÉLIMINATOIRES
${criteria.deal_breakers || 'Non spécifié'}

NOTES
${criteria.notes || 'Aucune'}

---
Connectez-vous à ImmoPortal pour voir le dossier complet.
  `

  if (agentEmail) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'ImmoPortal <onboarding@resend.dev>',
          to: agentEmail,
          subject: `🏠 ${clientName} a mis à jour ses critères`,
          text: emailBody
        })
      })
    } catch (e) {
      console.log('Email failed:', e)
    }
  }

  return NextResponse.json({ success: true })
}
