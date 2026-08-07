import { NextRequest, NextResponse } from 'next/server'
import { getAdminIdentity } from '@/lib/auth/admin'
import { normalizeVariantOptions } from '@/lib/product-variants'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

interface VariantInput {
  options: Record<string, string>
  sku: string
  stock_count: number
  price_override: number | null
  active: boolean
}

function validateVariantInput(value: unknown): VariantInput | { error: string } {
  if (!value || typeof value !== 'object') return { error: 'Geçersiz varyasyon verisi.' }
  const body = value as Record<string, unknown>
  const options = normalizeVariantOptions(body.options)
  const sku = typeof body.sku === 'string' ? body.sku.trim().slice(0, 100) : ''
  const stockCount = typeof body.stock_count === 'number' ? body.stock_count : Number.NaN
  const priceOverride = body.price_override

  if (!Object.keys(options).length) return { error: 'En az bir seçenek grubu ekleyin.' }
  if (!sku) return { error: 'SKU gerekli.' }
  if (!Number.isInteger(stockCount) || stockCount < 0 || stockCount > 1_000_000) {
    return { error: 'Stok 0 ile 1.000.000 arasında tam sayı olmalı.' }
  }
  if (priceOverride !== null && priceOverride !== undefined &&
    (typeof priceOverride !== 'number' || !Number.isFinite(priceOverride) || priceOverride < 0 || priceOverride > 10_000_000)) {
    return { error: 'Varyant fiyatı geçerli bir sayı olmalı.' }
  }

  return {
    options,
    sku,
    stock_count: stockCount,
    price_override: typeof priceOverride === 'number' ? priceOverride : null,
    active: typeof body.active === 'boolean' ? body.active : true,
  }
}

async function ensureAdmin() {
  return Boolean(await getAdminIdentity())
}

export async function GET(_request: NextRequest, context: RouteContext<'/api/admin/products/[id]/variants'>) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  const { id } = await context.params

  const { data, error } = await createServiceSupabaseClient()
    .from('products')
    .select('id, name, price, material, product_variants(id, options, size, color, material, stock_count, price_override, sku, active, created_at)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 })
  return NextResponse.json({ product: data })
}

export async function POST(request: NextRequest, context: RouteContext<'/api/admin/products/[id]/variants'>) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  const { id: productId } = await context.params
  const input = validateVariantInput(await request.json().catch(() => null))
  if ('error' in input) return NextResponse.json(input, { status: 400 })

  const supabase = createServiceSupabaseClient()
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .single()
  if (productError || !product) return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 })

  const { data, error } = await supabase
    .from('product_variants')
    .insert({ ...input, product_id: productId })
    .select('id, options, size, color, material, stock_count, price_override, sku, active, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ variant: data }, { status: 201 })
}

export async function PATCH(request: NextRequest, context: RouteContext<'/api/admin/products/[id]/variants'>) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  const { id: productId } = await context.params
  const body = await request.json().catch(() => null)
  const variantId = typeof body?.variantId === 'string' ? body.variantId : ''
  const input = validateVariantInput(body)
  if (!variantId || 'error' in input) {
    return NextResponse.json('error' in input ? input : { error: 'Varyant kimliği gerekli.' }, { status: 400 })
  }

  const { data, error } = await createServiceSupabaseClient()
    .from('product_variants')
    .update(input)
    .eq('id', variantId)
    .eq('product_id', productId)
    .select('id, options, size, color, material, stock_count, price_override, sku, active, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ variant: data })
}

export async function DELETE(request: NextRequest, context: RouteContext<'/api/admin/products/[id]/variants'>) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  const { id: productId } = await context.params
  const variantId = request.nextUrl.searchParams.get('variantId')
  if (!variantId) return NextResponse.json({ error: 'Varyant kimliği gerekli.' }, { status: 400 })

  const { error } = await createServiceSupabaseClient()
    .from('product_variants')
    .delete()
    .eq('id', variantId)
    .eq('product_id', productId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
