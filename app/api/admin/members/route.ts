import { NextResponse } from 'next/server'
import { getAdminIdentity } from '@/lib/auth/admin'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export async function GET() {
  if (!(await getAdminIdentity())) return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })

  const supabase = createServiceSupabaseClient()
  const [profilesResult, cartsResult, ordersResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name, phone, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('cart_snapshots')
      .select('user_id, items, item_count, subtotal, last_action, updated_at'),
    supabase
      .from('orders')
      .select('user_id, id, status, created_at'),
  ])

  const error = profilesResult.error || cartsResult.error || ordersResult.error
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const cartByUser = new Map((cartsResult.data || []).map((cart) => [cart.user_id, cart]))
  const orderSummary = new Map<string, { total: number; latestOrderAt: string | null; delivered: number }>()
  for (const order of ordersResult.data || []) {
    const summary = orderSummary.get(order.user_id) || { total: 0, latestOrderAt: null, delivered: 0 }
    summary.total += 1
    summary.delivered += order.status === 'delivered' ? 1 : 0
    if (!summary.latestOrderAt || order.created_at > summary.latestOrderAt) summary.latestOrderAt = order.created_at
    orderSummary.set(order.user_id, summary)
  }

  return NextResponse.json({
    members: (profilesResult.data || []).map((profile) => ({
      ...profile,
      cart: cartByUser.get(profile.id) || null,
      orders: orderSummary.get(profile.id) || { total: 0, latestOrderAt: null, delivered: 0 },
    })),
  })
}
