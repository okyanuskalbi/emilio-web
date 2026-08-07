import { NextResponse } from 'next/server'
import { site } from '@/lib/site'
import { getFeaturedProducts, productImage } from '@/lib/queries'
import { getStoreConfig } from '@/lib/store-config'
import { formatCurrency, publicCurrencyConfig } from '@/lib/currency'

export const runtime = 'nodejs'
export const revalidate = 3600

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// RSS 2.0 — yeni/öne çıkan ürünlerin makineler ve okuyucular tarafından takip
// edilmesini kolaylaştırır (GEO içerik dağıtımı).
export async function GET() {
  let items = ''
  try {
    const products = await getFeaturedProducts()
    const currency = publicCurrencyConfig(await getStoreConfig())
    items = products
      .map((p) => {
        const url = `${site.url}/products/${p.slug}`
        const desc = `${p.material} — ${formatCurrency(Number(p.price), currency)}. ${p.description || ''}`.trim()
        return `    <item>
      <title>${esc(p.name)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${esc(desc)}</description>
      <enclosure url="${esc(productImage(p))}" type="image/jpeg" />
    </item>`
      })
      .join('\n')
  } catch { /* DB yoksa boş feed döner */ }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${site.url}</link>
    <description>${esc(site.description)}</description>
    <language>tr</language>
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, max-age=600',
    },
  })
}
