import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { getSupabasePublicConfig } from './config'

/**
 * Privileged database/storage access for authenticated admin route handlers only.
 * Never import this module in a Client Component or expose its key with NEXT_PUBLIC_.
 */
export function createServiceSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.')
  }

  const { url } = getSupabasePublicConfig()
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
