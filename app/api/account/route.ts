import { NextRequest, NextResponse } from 'next/server'
import { getCustomerIdentity } from '@/lib/auth/user'
import { ensureCustomerProfile } from '@/lib/customer-profile'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export async function GET() {
  const identity = await getCustomerIdentity()
  if (!identity) return NextResponse.json({ error: 'Üyelik oturumu gerekli.' }, { status: 401 })

  try {
    await ensureCustomerProfile(identity)
    const supabase = createServiceSupabaseClient()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, created_at, updated_at')
      .eq('id', identity.id)
      .single()

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, total, currency, shipping_city, tracking_provider, tracking_number, tracking_url, created_at, updated_at')
      .eq('user_id', identity.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 })

    const orderIds = (orders || []).map((order) => order.id)
    const [itemsResult, eventsResult] = orderIds.length
      ? await Promise.all([
          supabase
            .from('order_items')
            .select('id, order_id, product_name, product_slug, image_url, material, variant_details, engraving, unit_price, quantity')
            .in('order_id', orderIds),
          supabase
            .from('order_events')
            .select('id, order_id, status, note, created_at')
            .in('order_id', orderIds)
            .eq('visible_to_customer', true)
            .order('created_at', { ascending: true }),
        ])
      : [{ data: [], error: null }, { data: [], error: null }]

    const relatedError = itemsResult.error || eventsResult.error
    if (relatedError) return NextResponse.json({ error: relatedError.message }, { status: 500 })

    const itemsByOrder = new Map<string, unknown[]>()
    for (const item of itemsResult.data || []) {
      const current = itemsByOrder.get(item.order_id) || []
      current.push(item)
      itemsByOrder.set(item.order_id, current)
    }
    const eventsByOrder = new Map<string, unknown[]>()
    for (const event of eventsResult.data || []) {
      const current = eventsByOrder.get(event.order_id) || []
      current.push(event)
      eventsByOrder.set(event.order_id, current)
    }

    return NextResponse.json({
      profile,
      orders: (orders || []).map((order) => ({
        ...order,
        items: itemsByOrder.get(order.id) || [],
        events: eventsByOrder.get(order.id) || [],
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Hesap bilgileri alınamadı.' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  const identity = await getCustomerIdentity()
  if (!identity) return NextResponse.json({ error: 'Üyelik oturumu gerekli.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const fullName = normalizeText(body?.full_name, 80)
  const phone = normalizeText(body?.phone, 30)
  if (!fullName) return NextResponse.json({ error: 'Ad soyad gerekli.' }, { status: 400 })

  try {
    await ensureCustomerProfile(identity)
    const { data, error } = await createServiceSupabaseClient()
      .from('profiles')
      .update({ full_name: fullName, phone: phone || null, email: identity.email })
      .eq('id', identity.id)
      .select('id, email, full_name, phone, created_at, updated_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ profile: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Profil güncellenemedi.' },
      { status: 500 },
    )
  }
}
