import { createClient } from '@supabase/supabase-js'

export function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export const supabase = {
  from: (...args) => getSupabaseClient().from(...args),
  auth: {
    getUser: (...args) => getSupabaseClient().auth.getUser(...args),
    signUp: (...args) => getSupabaseClient().auth.signUp(...args),
    signInWithPassword: (...args) => getSupabaseClient().auth.signInWithPassword(...args),
    signOut: (...args) => getSupabaseClient().auth.signOut(...args),
  }
}
