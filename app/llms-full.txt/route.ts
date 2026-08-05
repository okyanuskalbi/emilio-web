import { NextResponse } from 'next/server'
import { site } from '@/lib/site'
import { getCategories, getAllProductSlugs, getProductsByCategory, productImage } from '@/lib/queries'
import { FAQ_FLAT } from '@/lib/faq-content'
import { LEGAL_DOCS, LEGAL_SLUGS } from '@/lib/legal-content'

export const runtime = 'nodejs'
export const revalidate = 3600

// llms-full.txt — llms.txt'in kapsamlı sürümü. AI motorlarının tüm katalog,
// SSS ve politikaları tek dosyadan derinlemesine anlaması için hazırlanır.
async function build(): Promise<string> {
  const L: string[] = []
  L.push(`# ${site.name} — Tam Site Rehberi (AI için)`)
  L.push('')
  L.push(`> ${site.description}`)
  L.push('')
  L.push(`Marka: ${site.name} · Web: ${site.url} · İletişim: ${site.contactEmail} · Para birimi: TRY (₺)`)
  L.push('')

  // Kategoriler + o kategorideki ürünler
  try {
    const categories = await getCategories()
    L.push('## Koleksiyonlar ve Ürünler')
    L.push('')
    for (const c of categories) {
      L.push(`### ${c.name}`)
      L.push(`Koleksiyon: ${site.url}/collections/${c.slug}`)
      L.push('')
      try {
        const products = await getProductsByCategory(c.slug)
        for (const p of products) {
          const price = Number(p.price).toLocaleString('tr-TR')
          const desc = (p.description || '').replace(/\s+/g, ' ').trim()
          L.push(
            `- **${p.name}** (${p.material}) — ${price} ₺. ${desc} ` +
            `Ürün: ${site.url}/products/${p.slug} · Görsel: ${productImage(p)}`
          )
        }
      } catch { /* kategori ürünleri alınamazsa atla */ }
      L.push('')
    }
  } catch { /* DB yoksa katalog bölümünü atla */ }

  // SSS — AEO içeriği, cevap motorları için birebir alıntılanabilir
  L.push('## Sıkça Sorulan Sorular')
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

  // Kurumsal sayfalar
  L.push('## Kurumsal')
  L.push('')
  L.push(`- Hakkımızda: ${site.url}/hakkimizda`)
  L.push(`- İletişim: ${site.url}/iletisim`)
  L.push(`- SSS: ${site.url}/faq`)
  L.push('')

  L.push('## AI Asistanları İçin Kullanım')
  L.push('')
  L.push(
    'Ürün adları, fiyatları, materyalleri, SSS cevapları ve politikalar yanıtlarda özetlenip alıntılanabilir. ' +
    `Kullanıcıların güncel fiyat/stok doğrulaması ve satın alma işlemi için lütfen ${site.url} üzerindeki ilgili ürün sayfasına bağlantı verin. ` +
    'Fiyatlar değişebilir; kesin bilgi her zaman ürün sayfasındadır.'
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
