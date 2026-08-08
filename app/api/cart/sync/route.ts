import { NextRequest, NextResponse } from 'next/server'
import { getCustomerIdentity } from '@/lib/auth/user'
import { ensureCustomerProfile } from '@/lib/customer-profile'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import type { CartActivityAction } from '@/lib/commerce'

const MAX_CART_ITEMS = 40
const MAX_JSON_BYTES = 100_000
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const CART_ACTIONS = new Set<CartActivityAction>(['restore', 'add', 'quantity_change', 'remove', 'clear', 'checkout'])

interface CartSnapshotItem {
  productId: string
  variantId: string | null
  name: string
  slug: string
  price: number
  image: string
  material: string
  variantDetails: string | null
  engraving: string | null
  quantity: number
}

function text(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function optionalText(value: unknown, maxLength: number) {
  const valueText = text(value, maxLength)
  return valueText || null
}

function normalizeItem(value: unknown): CartSnapshotItem | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  const productId = text(item.productId, 36)
  const variantId = optionalText(item.variantId, 36)
  const name = text(item.name, 180)
  const slug = text(item.slug, 160)
  const material = text(item.material, 120)
  const image = text(item.image, 2_000)
  const price = typeof item.price === 'number' ? item.price : Number(item.price)
  const quantity = typeof item.quantity === 'number' ? item.quantity : Number(item.quantity)

  if (!UUID_PATTERN.test(productId) || (variantId && !UUID_PATTERN.test(variantId))) return null
  if (!name || !slug || !material || !image || !Number.isFinite(price) || price < 0 || price > 10_000_000) return null
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null

  return {
    productId,
    variantId,
    name,
    slug,
    price: Math.round(price * 100) / 100,
    image,
    material,
    variantDetails: optionalText(item.variantDetails, 300),
    engraving: optionalText(item.engraving, 80),
    quantity,
  }
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BYTES) {
    return NextResponse.json({ error: 'The cart data is too large.' }, { status: 413 })
  }

  const identity = await getCustomerIdentity()
  if (!identity) return NextResponse.json({ error: 'An account session is required.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const rawItems: unknown[] | null = Array.isArray(body?.items) ? body.items as unknown[] : null
  const action = typeof body?.action === 'string' && CART_ACTIONS.has(body.action as CartActivityAction)
    ? body.action as CartActivityAction
    : null

  if (!rawItems || rawItems.length > MAX_CART_ITEMS || !action) {
    return NextResponse.json({ error: 'The cart data is invalid.' }, { status: 400 })
  }

  const items = rawItems.map(normalizeItem)
  if (items.some((item) => item === null)) {
    return NextResponse.json({ error: 'Your bag contains an invalid product.' }, { status: 400 })
  }

  const safeItems = items as CartSnapshotItem[]
  const itemCount = safeItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = safeItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  try {
    await ensureCustomerProfile(identity)
    const supabase = createServiceSupabaseClient()
    const snapshot = {
      user_id: identity.id,
      items: safeItems,
      item_count: itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
      last_action: action,
      updated_at: new Date().toISOString(),
    }

    const [{ error: snapshotError }, { error: eventError }] = await Promise.all([
      supabase.from('cart_snapshots').upsert(snapshot, { onConflict: 'user_id' }),
      supabase.from('cart_events').insert({
        user_id: identity.id,
        action,
        items: safeItems,
        item_count: itemCount,
        subtotal: snapshot.subtotal,
      }),
    ])

    const error = snapshotError || eventError
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Your bag could not be saved.' },
      { status: 500 },
    )
  }
}
