import 'server-only'

import { cache } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface CustomerIdentity {
  id: string
  email: string
  fullName: string | null
}

/**
 * Reads identity only from a verified Supabase JWT. Do not use browser-supplied
 * ids or mutable user_metadata for authorization decisions.
 */
export const getCustomerIdentity = cache(async (): Promise<CustomerIdentity | null> => {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.getClaims()
  const claims = data?.claims
  const id = typeof claims?.sub === 'string' ? claims.sub : null
  const email = typeof claims?.email === 'string' ? claims.email.trim().toLowerCase() : null
  const fullName = typeof claims?.user_metadata?.full_name === 'string'
    ? claims.user_metadata.full_name.trim().slice(0, 80) || null
    : null

  if (error || !id || !email) return null
  return { id, email, fullName }
})
