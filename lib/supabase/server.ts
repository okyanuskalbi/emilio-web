import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabasePublicConfig } from './config'

/**
 * Creates a request-scoped Supabase client backed by the verified auth cookie.
 * Cookie writes are intentionally ignored in Server Components; proxy.ts handles
 * token refresh responses where cookies can be persisted safely.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const { url, publishableKey } = getSupabasePublicConfig()

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Components cannot always mutate cookies. proxy.ts refreshes
          // sessions before the page is rendered, so this is safe to ignore here.
        }
      },
    },
  })
}
