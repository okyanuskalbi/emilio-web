const fallbackUrl = 'https://zhonnaajslctnvjhhlgc.supabase.co'
const fallbackPublishableKey = 'sb_publishable_aUuLwpdCtMWZ3NF4G9yU6Q_X217NoW8'

/** Public connection values only. Access to data is enforced by Auth + RLS. */
export function getSupabasePublicConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl,
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackPublishableKey,
  }
}
