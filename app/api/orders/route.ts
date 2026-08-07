import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getCustomerIdentity } from '@/lib/auth/user'
import { ensureCustomerProfile } from '@/lib/customer-profile'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_ITEMS = 25

interface CheckoutItemInput {
  productId: string
  variantId: string | null
  quantity: number
  engraving: string | null
}

function safeText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function optionalText(value: unknown, maxLength: number) {
  return safeText(value, maxLength) || null
}

function normalizeCheckoutItem(value: unknown): CheckoutItemInput | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  const productId = safeText(item.productId, 36)
  const variantId = optionalText(item.variantId, 36)
  const quantity = typeof item.quantity === 'number' ? item.quantity : Number(item.quantity)

  if (!UUID_PATTERN.test(productId) || (variantId && !UUID_PATTERN.test(variantId))) return null
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null

  return {
    productId,
    variantId,
    quantity,
    engraving: optionalText(item.engraving, 80),
  }
}

function createOrderNumber() {
  const now = new Date()
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('')
  const entropy = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  return `ES-${date}-${entropy}`
}

function firstImage(product: Record<string, unknown>) {
  const images = Array.isArray(product.product_images) ? product.product_images : []
  const sorted = [...images].sort((left, right) => {
    const leftPosition = typeof (left as { position?: unknown }).position === 'number' ? (left as { position: number }).position : 0
    const rightPosition = typeof (right as { position?: unknown }).position === 'number' ? (right as { position: number }).position : 0
    return leftPosition - rightPosition
  })
  const url = sorted[0] && typeof (sorted[0] as { url?: unknown }).url === 'string'
    ? (sorted[0] as { url: string }).url
    : null
  return url
}

function formatOptions(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const entries = Object.entries(value)
    .filter(([, optionValue]) => typeof optionValue === 'string' && optionValue.trim())
    .map(([key, optionValue]) => `${key}: ${String(optionValue).trim()}`)
  return entries.length ? entries.join(' · ').slice(0, 300) : null
}

export async function POST(request: NextRequest) {
  const identity = await getCustomerIdentity()
  if (!identity) return NextResponse.json({ error: 'Sipariş takibi için giriş yapmalısınız.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const rawItems: unknown[] | null = Array.isArray(body?.items) ? body.items as unknown[] : null
  const customerName = safeText(body?.customer?.name, 80)
  const phone = safeText(body?.customer?.phone, 30)
  const address = safeText(body?.customer?.address, 500)
  const city = safeText(body?.customer?.city, 100)
  const paymentProvider = body?.paymentProvider === 'iyzico' ? 'iyzico' : body?.paymentProvider === 'paytr' ? 'paytr' : null

  if (!rawItems || !rawItems.length || rawItems.length > MAX_ITEMS || !customerName || !phone || !address || !city || !paymentProvider) {
    return NextResponse.json({ error: 'Sipariş bilgilerini kontrol edin.' }, { status: 400 })
  }

  const requestedItems = rawItems.map(normalizeCheckoutItem)
  if (requestedItems.some((item) => item === null)) {
    return NextResponse.json({ error: 'Sepette geçersiz ürün var.' }, { status: 400 })
  }

  const items = requestedItems as CheckoutItemInput[]
  const productIds = [...new Set(items.map((item) => item.productId))]

  try {
    await ensureCustomerProfile(identity)
    const supabase = createServiceSupabaseClient()
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: customerName, phone, email: identity.email })
      .eq('id', identity.id)
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug, price, material, active, product_images(url, position), product_variants(id, product_id, options, stock_count, price_override, active)')
      .in('id', productIds)

    if (productsError) return NextResponse.json({ error: productsError.message }, { status: 500 })
    const productById = new Map((products || []).map((product) => [product.id, product as Record<string, unknown>]))

    const orderItems: Array<Record<string, unknown>> = []
    for (const item of items) {
      const product = productById.get(item.productId)
      if (!product || product.active !== true) {
        return NextResponse.json({ error: 'Sepetteki ürün artık satışta değil.' }, { status: 409 })
      }

      const variants = Array.isArray(product.product_variants) ? product.product_variants : []
      const variant = item.variantId
        ? variants.find((candidate) => {
            const record = candidate as Record<string, unknown>
            return record.id === item.variantId && record.product_id === item.productId && record.active !== false && Number(record.stock_count) > 0
          }) as Record<string, unknown> | undefined
        : undefined

      if (item.variantId && !variant) {
        return NextResponse.json({ error: 'Seçilen ürün varyasyonu artık satışta değil.' }, { status: 409 })
      }

      const basePrice = Number(product.price)
      const override = variant && typeof variant.price_override === 'number' ? variant.price_override : null
      const unitPrice = override !== null && Number.isFinite(override) ? override : basePrice
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return NextResponse.json({ error: 'Ürün fiyatı doğrulanamadı.' }, { status: 409 })
      }

      orderItems.push({
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: safeText(product.name, 180),
        product_slug: safeText(product.slug, 160),
        material: optionalText(product.material, 120),
        image_url: firstImage(product),
        variant_details: formatOptions(variant?.options),
        engraving: item.engraving,
        unit_price: Math.round(unitPrice * 100) / 100,
        quantity: item.quantity,
      })
    }

    const subtotal = orderItems.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0)
    const shippingAmount = subtotal >= 500 ? 0 : 49.9
    const total = Math.round((subtotal + shippingAmount) * 100) / 100

    let order: { id: string; order_number: string; status: string; total: number; currency: string } | null = null
    for (let attempt = 0; attempt < 3 && !order; attempt += 1) {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: identity.id,
          order_number: createOrderNumber(),
          status: 'pending',
          total,
          shipping_address: address,
          shipping_amount: shippingAmount,
          currency: 'TRY',
          customer_name: customerName,
          customer_email: identity.email,
          customer_phone: phone,
          shipping_city: city,
          payment_provider: paymentProvider,
          payment_ref: `demo-${crypto.randomUUID()}`,
        })
        .select('id, order_number, status, total, currency')
        .single()

      if (!error && data) order = data
      if (error && error.code !== '23505') return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!order) return NextResponse.json({ error: 'Sipariş numarası oluşturulamadı, tekrar deneyin.' }, { status: 500 })

    const lines = orderItems.map((item) => ({ ...item, order_id: order.id }))
    const [{ error: itemsError }, { error: eventError }] = await Promise.all([
      supabase.from('order_items').insert(lines),
      supabase.from('order_events').insert({
        order_id: order.id,
        status: 'pending',
        note: 'Siparişiniz alındı. Ödeme ve stok kontrolü bekleniyor.',
        visible_to_customer: true,
        created_by: identity.id,
      }),
    ])

    const creationError = itemsError || eventError
    if (creationError) {
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: creationError.message }, { status: 500 })
    }

    await supabase.from('cart_events').insert({
      user_id: identity.id,
      action: 'checkout',
      items: orderItems,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
    })

    revalidatePath('/account')
    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sipariş oluşturulamadı.' },
      { status: 500 },
    )
  }
}
