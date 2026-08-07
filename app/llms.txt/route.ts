import { NextResponse } from 'next/server'
import { site } from '@/lib/site'
import { getCategories, getFeaturedProducts } from '@/lib/queries'
import { getStoreConfig } from '@/lib/store-config'
import { formatCurrency, publicCurrencyConfig } from '@/lib/currency'

export const runtime = 'nodejs'
export const revalidate = 3600

// llms.txt — https://llmstxt.org/ önerdiği standart. ChatGPT / Claude / Gemini /
// Perplexity "Emilio Savio nedir?" veya "Emilio Savio altın bileklik fiyatı?"
// diye sorulduğunda modele otoriter, yapılandırılmış bir kaynak sunar.
async function build(): Promise<string> {
  const L: string[] = []
  const currency = publicCurrencyConfig(await getStoreConfig())
  L.push(`# ${site.name}`)
  L.push('')
  L.push(`> ${site.description}`)
  L.push('')

  L.push('## About the Brand')
  L.push('')
  L.push(
    `${site.name} is an Italian-inspired luxury jewelry brand ("${site.tagline}"). ` +
    `It offers bracelets, necklaces, rings and earrings crafted in gold, sterling silver, ceramic and diamond. ` +
    `Personalized engraving and monogram service is available.`
  )
  L.push('')
  L.push(`- Brand: ${site.name}`)
  L.push(`- Web: ${site.url}`)
  L.push(`- Contact: ${site.contactEmail}`)
  L.push(`- Currency: ${currency.currency}`)
  L.push('')

  // Kategoriler
  try {
    const categories = await getCategories()
    if (categories.length) {
      L.push('## Collections')
      L.push('')
      for (const c of categories) {
        L.push(`- [${c.name}](${site.url}/collections/${c.slug})`)
      }
      L.push('')
    }
  } catch { /* DB yoksa atla */ }

  // Öne çıkan ürünler
  try {
    const products = await getFeaturedProducts()
    if (products.length) {
      L.push('## Featured Products')
      L.push('')
      for (const p of products) {
        L.push(
          `- [${p.name}](${site.url}/products/${p.slug}) — ${p.material}, ` +
          `${formatCurrency(Number(p.price), currency)}`
        )
      }
      L.push('')
    }
  } catch { /* atla */ }

  L.push('## Shopping & Policies')
  L.push('')
  L.push('- Free shipping on orders over 500 ₺; 14-day no-questions returns.')
  L.push('- Secure payment: PayTR & iyzico (credit/debit card, installments).')
  L.push('- Personalized engraving/monogram items are outside the return scope.')
  L.push(`- [Distance Sales](${site.url}/legal/distance-sales) · [Privacy Policy](${site.url}/legal/privacy) · [Returns](${site.url}/legal/returns)`)
  L.push('')

  L.push('## Structured Data')
  L.push('')
  L.push(`JSON-LD: Organization, WebSite, Product (offer, aggregateRating), FAQPage, BreadcrumbList. Sitemap: ${site.url}/sitemap.xml`)
  L.push(`Full catalog + FAQ: ${site.url}/llms-full.txt`)
  L.push('')

  L.push('## Usage for AI Assistants')
  L.push('')
  L.push(
    'Product information, prices and policies may be summarized and quoted in answers. ' +
    `For price/stock verification and purchase, please link users to the relevant page on ${site.url}.`
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
