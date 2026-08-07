import { NextResponse } from 'next/server'
import writeXlsxFile from 'write-excel-file/node'
import { getAdminIdentity } from '@/lib/auth/admin'
import { formatVariantOptions, variantOptionsFromRecord } from '@/lib/product-variants'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function formatExportVariant(variant: {
  options?: Record<string, string> | null
  size?: string | null
  color?: string | null
  material?: string | null
  stock_count: number
  sku: string
  price_override: number | null
  active?: boolean | null
}) {
  const optionText = formatVariantOptions(variantOptionsFromRecord(variant))
  return [
    optionText.replaceAll(' · ', '; ').replaceAll(': ', '='),
    `Stok=${variant.stock_count}`,
    `SKU=${variant.sku}`,
    variant.price_override !== null ? `Fiyat=${variant.price_override}` : null,
    `Aktif=${variant.active === false ? 'Hayır' : 'Evet'}`,
  ].filter(Boolean).join('; ')
}

export async function GET() {
  if (!(await getAdminIdentity())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  const { data, error } = await createServiceSupabaseClient()
    .from('products')
    .select('name, price, compare_price, material, description, active, categories(slug), product_variants(options, size, color, material, stock_count, price_override, sku, active)')
    .order('created_at', { ascending: false })
    .limit(5000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const sheet = [
    ['Ürün Adı', 'Fiyat', 'Eski Fiyat', 'Materyal', 'Kategori', 'Açıklama', 'Ürün Aktif', 'Varyasyon Kullan', 'Varyasyonlar'],
    ...(data || []).map((product) => {
      const category = Array.isArray(product.categories) ? product.categories[0] : product.categories
      const variants = product.product_variants || []
      return [
        product.name,
        product.price,
        product.compare_price ?? '',
        product.material,
        category?.slug || 'bracelets',
        product.description || '',
        product.active ? 'Evet' : 'Hayır',
        variants.length ? 'Evet' : 'Hayır',
        variants.map(formatExportVariant).join(' | '),
      ]
    }),
  ]

  const workbook = await writeXlsxFile(sheet, { sheet: 'Ürünler' })
  const buffer = await workbook.toBuffer()
  const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="emilio-urunler.xlsx"',
      'Cache-Control': 'no-store',
    },
  })
}
