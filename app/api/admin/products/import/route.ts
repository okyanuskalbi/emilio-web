import { NextRequest, NextResponse } from 'next/server'
import { getAdminIdentity } from '@/lib/auth/admin'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { parseVariantImport, type ParsedVariantImport } from '@/lib/product-variants'

interface ImportRow {
  name: string
  price: number
  compare_price?: number
  material: string
  category: string
  description?: string
  active?: boolean
  has_variants?: boolean
  variants?: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function isImportRow(value: unknown): value is ImportRow {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return typeof row.name === 'string' && row.name.trim().length > 0 &&
    typeof row.price === 'number' && Number.isFinite(row.price) && row.price > 0 &&
    typeof row.material === 'string' && typeof row.category === 'string' &&
    (row.active === undefined || typeof row.active === 'boolean') &&
    (row.has_variants === undefined || typeof row.has_variants === 'boolean') &&
    (row.variants === undefined || typeof row.variants === 'string')
}

export async function POST(request: NextRequest) {
  if (!(await getAdminIdentity())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const rawRows: unknown[] = Array.isArray(body?.rows) ? body.rows : []
  const rows = rawRows.filter(isImportRow)
  if (!rows.length || rows.length > 500) {
    return NextResponse.json({ error: '1–500 arası geçerli ürün gönderin.' }, { status: 400 })
  }

  const variantsByRow: ParsedVariantImport[][] = []
  for (const [index, row] of rows.entries()) {
    const hasVariants = row.has_variants === true
    const rawVariants = typeof row.variants === 'string' ? row.variants.trim() : ''
    if (!hasVariants && rawVariants) {
      return NextResponse.json({ error: `Satır ${index + 2}: Varyasyonlar doluysa “Varyasyon Kullan” alanını Evet işaretleyin.` }, { status: 400 })
    }

    const parsed = parseVariantImport(hasVariants ? rawVariants : '')
    if (parsed.error) {
      return NextResponse.json({ error: `Satır ${index + 2}: ${parsed.error}` }, { status: 400 })
    }
    if (hasVariants && !parsed.variants.length) {
      return NextResponse.json({ error: `Satır ${index + 2}: “Varyasyon Kullan” Evet seçildiği için en az bir varyasyon gerekli.` }, { status: 400 })
    }
    variantsByRow.push(parsed.variants)
  }

  const supabase = createServiceSupabaseClient()
  const { data: categories, error: categoriesError } = await supabase.from('categories').select('id, slug')
  if (categoriesError) return NextResponse.json({ error: categoriesError.message }, { status: 500 })

  const categoryIds = new Map((categories || []).map((category) => [category.slug, category.id]))
  const defaultCategory = categoryIds.get('bracelets') || categories?.[0]?.id
  if (!defaultCategory) {
    return NextResponse.json({ error: 'İçe aktarma için en az bir kategori gerekli.' }, { status: 409 })
  }

  const products = rows.map((row) => ({
    name: row.name.trim(),
    slug: `${slugify(row.name)}-${crypto.randomUUID().slice(0, 8)}`,
    description: typeof row.description === 'string' ? row.description.trim() : '',
    price: row.price,
    compare_price: typeof row.compare_price === 'number' && Number.isFinite(row.compare_price)
      ? row.compare_price
      : null,
    material: row.material.trim(),
    category_id: categoryIds.get(row.category) || defaultCategory,
    featured: false,
    active: row.active !== false,
  }))

  const { data, error } = await supabase.from('products').insert(products).select('id, slug')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const productIdsBySlug = new Map((data || []).map((product) => [product.slug, product.id]))
  const variantRows = products.flatMap((product, index) => {
    const productId = productIdsBySlug.get(product.slug)
    if (!productId) return []
    return variantsByRow[index].map((variant) => ({ ...variant, product_id: productId }))
  })

  if (variantRows.length) {
    const { error: variantsError } = await supabase.from('product_variants').insert(variantRows)
    if (variantsError) {
      const insertedIds = (data || []).map((product) => product.id)
      if (insertedIds.length) await supabase.from('products').delete().in('id', insertedIds)
      return NextResponse.json({
        error: `Ürün varyasyonları kaydedilemedi: ${variantsError.message}`,
      }, { status: 500 })
    }
  }

  return NextResponse.json({ imported: data?.length || 0, variants: variantRows.length }, { status: 201 })
}
