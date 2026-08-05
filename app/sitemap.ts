import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'
import { getCategories, getAllProductSlugs } from '@/lib/queries'
import { LEGAL_SLUGS } from '@/lib/legal-content'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const u = (path: string) => `${site.url}${path}`

  const entries: MetadataRoute.Sitemap = [
    { url: u('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
  ]

  // Koleksiyonlar
  try {
    const categories = await getCategories()
    for (const c of categories) {
      entries.push({
        url: u(`/collections/${c.slug}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  } catch { /* DB erişilemezse sitemap yine geçerli kalır */ }

  // Ürünler
  try {
    const products = await getAllProductSlugs()
    for (const p of products) {
      entries.push({
        url: u(`/products/${p.slug}`),
        lastModified: new Date(p.updated),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  } catch { /* yok say */ }

  // Yasal sayfalar
  for (const slug of LEGAL_SLUGS) {
    entries.push({
      url: u(`/legal/${slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    })
  }

  return entries
}
