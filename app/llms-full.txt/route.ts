import { NextResponse } from 'next/server'
import { site } from '@/lib/site'
import { getCategories, getProductsByCategory, productImage } from '@/lib/queries'
import { FAQ_FLAT } from '@/lib/faq-content'
import { LEGAL_DOCS, LEGAL_SLUGS } from '@/lib/legal-content'
import { getStoreConfig } from '@/lib/store-config'
import { formatCurrency, publicCurrencyConfig } from '@/lib/currency'

export const runtime = 'nodejs'
export const revalidate = 3600

// llms-full.txt — llms.txt'in kapsamlı sürümü. AI motorlarının tüm katalog,
// FAQ ve politikaları tek dosyadan derinlemesine anlaması için hazırlanır.
async function build(): Promise<string> {
  const L: string[] = []
  const currency = publicCurrencyConfig(await getStoreConfig())
  L.push(`# ${site.name} — Full Site Guide (for AI)`)
  L.push('')
  L.push(`> ${site.description}`)
  L.push('')
  L.push(`Brand: ${site.name} · Web: ${site.url} · Contact: ${site.contactEmail} · Currency: ${currency.currency}`)
  L.push('')

  // Kategoriler + o kategorideki ürünler
  try {
    const categories = await getCategories()
    L.push('## Collections and Products')
    L.push('')
    for (const c of categories) {
      L.push(`### ${c.name}`)
      L.push(`Collection: ${site.url}/collections/${c.slug}`)
      L.push('')
      try {
        const products = await getProductsByCategory(c.slug)
        for (const p of products) {
          const price = formatCurrency(Number(p.price), currency)
          const desc = (p.description || '').replace(/\s+/g, ' ').trim()
          L.push(
            `- **${p.name}** (${p.material}) — ${price}. ${desc} ` +
            `Product: ${site.url}/products/${p.slug} · Image: ${productImage(p)}`
          )
        }
      } catch { /* kategori ürünleri alınamazsa atla */ }
      L.push('')
    }
  } catch { /* DB yoksa katalog bölümünü atla */ }

  // FAQ — AEO içeriği, cevap motorları için birebir alıntılanabilir
  L.push('## Frequently Asked Questions')
  L.push('')
  for (const item of FAQ_FLAT) {
    L.push(`**S: ${item.q}**`)
    L.push(`C: ${item.a}`)
    L.push('')
  }

  // Politikalar — özet
  L.push('## Politikalar')
  L.push('')
  for (const slug of LEGAL_SLUGS) {
    const doc = LEGAL_DOCS[slug]
    if (!doc) continue
    const firstPara = doc.body.split('\n\n').find((b) => !b.startsWith('## ')) || ''
    L.push(`- **${doc.title}** (${site.url}/legal/${slug}): ${firstPara.replace(/\s+/g, ' ').trim().slice(0, 200)}`)
  }
  L.push('')

  // Company sayfalar
  L.push('## Company')
  L.push('')
  L.push(`- About Us: ${site.url}/about`)
  L.push(`- Contact: ${site.url}/contact`)
  L.push(`- FAQ: ${site.url}/faq`)
  L.push('')

  L.push('## Usage for AI Assistants')
  L.push('')
  L.push(
    'Product names, prices, materials, FAQ answers and policies may be summarized and quoted in answers. ' +
    `For current price/stock verification and purchase, please link users to the relevant product page on ${site.url}. ` +
    'Prices may change; the definitive information is always on the product page.'
  )
  L.push('')

  return L.join('\n')
}

export async function GET() {
  return new NextResponse(await build(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, max-age=600',
    },
  })
}
