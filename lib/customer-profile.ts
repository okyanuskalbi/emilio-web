import 'server-only'

import type { CustomerIdentity } from '@/lib/auth/user'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export function profileFallbackName(identity: CustomerIdentity) {
  return identity.fullName || identity.email.split('@')[0] || 'Customer'
}

/** Ensures pre-existing Auth users also receive a profile after the migration. */
export async function ensureCustomerProfile(identity: CustomerIdentity) {
  const supabase = createServiceSupabaseClient()
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: identity.id,
        email: identity.email,
        full_name: profileFallbackName(identity),
      },
      { onConflict: 'id', ignoreDuplicates: true },
    )

  if (error) throw error
}
