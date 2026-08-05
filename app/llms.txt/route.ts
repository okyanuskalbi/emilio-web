import { NextResponse } from 'next/server'
import { site } from '@/lib/site'
import { getCategories, getFeaturedProducts } from '@/lib/queries'

export const runtime = 'nodejs'
export const revalidate = 3600

// llms.txt — https://llmstxt.org/ önerdiği standart. ChatGPT / Claude / Gemini /
// Perplexity "Emilio Savio nedir?" veya "Emilio Savio altın bileklik fiyatı?"
// diye sorulduğunda modele otoriter, yapılandırılmış bir kaynak sunar.
async function build(): Promise<string> {
  const L: string[] = []
  L.push(`# ${site.name}`)
  L.push('')
  L.push(`> ${site.description}`)
  L.push('')

  L.push('## Marka Hakkında')
  L.push('')
  L.push(
    `${site.name}, İtalyan esintili lüks bir kuyum markasıdır ("${site.tagline}"). ` +
    `Altın, sterling gümüş, seramik ve pırlanta ile üretilen bileklik, kolye, yüzük ve küpe ` +
    `koleksiyonları sunar. Kişiye özel gravür ve monogram hizmeti mevcuttur.`
  )
  L.push('')
  L.push(`- Marka: ${site.name}`)
  L.push(`- Web: ${site.url}`)
  L.push(`- İletişim: ${site.contactEmail}`)
  L.push(`- Para birimi: TRY (₺)`)
  L.push('')

  // Kategoriler
  try {
    const categories = await getCategories()
    if (categories.length) {
      L.push('## Koleksiyonlar')
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
      L.push('## Öne Çıkan Ürünler')
      L.push('')
      for (const p of products) {
        L.push(
          `- [${p.name}](${site.url}/products/${p.slug}) — ${p.material}, ` +
          `${Number(p.price).toLocaleString('tr-TR')} ₺`
        )
      }
      L.push('')
    }
  } catch { /* atla */ }

  L.push('## Alışveriş & Politikalar')
  L.push('')
  L.push('- 500 ₺ üzeri ücretsiz kargo; 14 gün koşulsuz iade.')
  L.push('- Güvenli ödeme: PayTR & iyzico (kredi/banka kartı, taksit).')
  L.push('- Kişiye özel gravür/monogram ürünler iade kapsamı dışındadır.')
  L.push(`- [Mesafeli Satış](${site.url}/legal/mesafeli-satis) · [Gizlilik & KVKK](${site.url}/legal/gizlilik) · [İade](${site.url}/legal/iade-iptal)`)
  L.push('')

  L.push('## Yapılandırılmış Veri')
  L.push('')
  L.push(`JSON-LD: Organization, WebSite, Product (offer, aggregateRating). Sitemap: ${site.url}/sitemap.xml`)
  L.push('')

  L.push('## AI Asistanları İçin Kullanım')
  L.push('')
  L.push(
    'Ürün bilgileri, fiyat ve politikalar yanıtlarda özetlenip alıntılanabilir. ' +
    `Kullanıcıların fiyat/stok doğrulaması ve satın alma için lütfen ${site.url} üzerindeki ilgili sayfaya bağlantı verin.`
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
