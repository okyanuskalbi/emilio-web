import { NextResponse } from 'next/server'
import { getAdminIdentity } from '@/lib/auth/admin'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export async function GET() {
  if (!(await getAdminIdentity())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  const supabase = createServiceSupabaseClient()
  const [products, orders, reviews, pendingReviews, members] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])

  const error = products.error || orders.error || reviews.error || pendingReviews.error || members.error
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    products: products.count || 0,
    orders: orders.count || 0,
    reviews: reviews.count || 0,
    pendingReviews: pendingReviews.count || 0,
    members: members.count || 0,
  })
}
