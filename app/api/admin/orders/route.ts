import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminIdentity } from '@/lib/auth/admin'
import { isOrderStatus } from '@/lib/commerce'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function safeText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function safeTrackingUrl(value: unknown) {
  const url = safeText(value, 2_000)
  if (!url) return null
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : null
  } catch {
    return null
  }
}

export async function GET() {
  if (!(await getAdminIdentity())) return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })

  const supabase = createServiceSupabaseClient()
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, user_id, order_number, status, total, currency, customer_name, customer_email, customer_phone, shipping_address, shipping_city, tracking_provider, tracking_number, tracking_url, payment_provider, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 })

  const orderIds = (orders || []).map((order) => order.id)
  const userIds = [...new Set((orders || []).map((order) => order.user_id).filter(Boolean))]
  const [itemsResult, eventsResult, profilesResult] = await Promise.all([
    orderIds.length
      ? supabase.from('order_items').select('id, order_id, product_name, product_slug, image_url, material, variant_details, engraving, unit_price, quantity').in('order_id', orderIds)
      : Promise.resolve({ data: [], error: null }),
    orderIds.length
      ? supabase.from('order_events').select('id, order_id, status, note, visible_to_customer, created_at').in('order_id', orderIds).order('created_at', { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    userIds.length
      ? supabase.from('profiles').select('id, full_name, email, phone').in('id', userIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  const relatedError = itemsResult.error || eventsResult.error || profilesResult.error
  if (relatedError) return NextResponse.json({ error: relatedError.message }, { status: 500 })

  const itemsByOrder = new Map<string, unknown[]>()
  for (const item of itemsResult.data || []) {
    const entries = itemsByOrder.get(item.order_id) || []
    entries.push(item)
    itemsByOrder.set(item.order_id, entries)
  }
  const eventsByOrder = new Map<string, unknown[]>()
  for (const event of eventsResult.data || []) {
    const entries = eventsByOrder.get(event.order_id) || []
    entries.push(event)
    eventsByOrder.set(event.order_id, entries)
  }
  const profileById = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]))

  return NextResponse.json({
    orders: (orders || []).map((order) => ({
      ...order,
      profile: profileById.get(order.user_id) || null,
      items: itemsByOrder.get(order.id) || [],
      events: eventsByOrder.get(order.id) || [],
    })),
  })
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdminIdentity()
  if (!admin) return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id : ''
  if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: 'Geçersiz sipariş kimliği.' }, { status: 400 })

  const requestedStatus = body?.status
  if (requestedStatus !== undefined && !isOrderStatus(requestedStatus)) {
    return NextResponse.json({ error: 'Geçersiz sipariş durumu.' }, { status: 400 })
  }
  if (body?.tracking_url && !safeTrackingUrl(body.tracking_url)) {
    return NextResponse.json({ error: 'Kargo takip bağlantısı geçerli bir http(s) adresi olmalı.' }, { status: 400 })
  }

  const supabase = createServiceSupabaseClient()
  const { data: existing, error: existingError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', id)
    .single()
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 })

  const updates: Record<string, unknown> = {}
  if (requestedStatus !== undefined) updates.status = requestedStatus
  if (Object.prototype.hasOwnProperty.call(body || {}, 'tracking_provider')) updates.tracking_provider = safeText(body.tracking_provider, 80) || null
  if (Object.prototype.hasOwnProperty.call(body || {}, 'tracking_number')) updates.tracking_number = safeText(body.tracking_number, 120) || null
  if (Object.prototype.hasOwnProperty.call(body || {}, 'tracking_url')) updates.tracking_url = safeTrackingUrl(body.tracking_url)

  const effectiveStatus = (requestedStatus || existing.status) as string
  if (requestedStatus !== existing.status && requestedStatus === 'shipped') updates.shipped_at = new Date().toISOString()
  if (requestedStatus !== existing.status && requestedStatus === 'delivered') updates.delivered_at = new Date().toISOString()
  if (requestedStatus !== existing.status && requestedStatus === 'cancelled') updates.cancelled_at = new Date().toISOString()
  if (!Object.keys(updates).length) return NextResponse.json({ error: 'Güncellenecek bilgi yok.' }, { status: 400 })

  const { data: order, error: updateError } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select('id, order_number, status, tracking_provider, tracking_number, tracking_url')
    .single()
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  const eventNote = safeText(body?.note, 500)
  if ((requestedStatus !== undefined && requestedStatus !== existing.status) || eventNote) {
    const { error: eventError } = await supabase.from('order_events').insert({
      order_id: id,
      status: effectiveStatus,
      note: eventNote || null,
      visible_to_customer: body?.visible_to_customer !== false,
      created_by: admin.id,
    })
    if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 })
  }

  revalidatePath('/account')
  return NextResponse.json({ order })
}
