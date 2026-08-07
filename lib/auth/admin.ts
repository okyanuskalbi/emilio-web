import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface AdminIdentity {
  id: string
  email: string
}

function allowedAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

/**
 * The first production-safe role source is a server-only allow-list. It fails
 * closed when no address is configured; no browser-editable metadata is trusted.
 */
export const getAdminIdentity = cache(async (): Promise<AdminIdentity | null> => {
  const client = await createServerSupabaseClient()
  const { data, error } = await client.auth.getClaims()
  const claims = data?.claims
  const id = typeof claims?.sub === 'string' ? claims.sub : null
  const email = typeof claims?.email === 'string' ? claims.email.toLowerCase() : null

  if (error || !id || !email || !allowedAdminEmails().has(email)) {
    return null
  }

  return { id, email }
})

export async function requireAdmin(returnTo = '/admin'): Promise<AdminIdentity> {
  const admin = await getAdminIdentity()
  if (admin) return admin

  redirect(`/account?next=${encodeURIComponent(returnTo)}`)
}
