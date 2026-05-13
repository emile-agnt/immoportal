import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  const { clientId } = await req.json()

  const { data: client, error } = await supabase
    .from('clients')
    .select('id, name, email, invite_token')
    .eq('id', clientId)
    .single()

  if (error || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/client/setup?token=${client.invite_token}`

  return NextResponse.json({ inviteUrl, clientName: client.name })
}
