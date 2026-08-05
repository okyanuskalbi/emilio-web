import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CollectionFilter } from '@/components/product/CollectionFilter'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { getProductsByCategory, getCategories, productImage } from '@/lib/queries'
import { site } from '@/lib/site'

export const revalidate = 60

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const categories = await getCategories()
  const category = categories.find((c) => c.slug === slug)
  if (!category) return { title: 'Koleksiyon bulunamadı' }
  const desc = `${category.name} koleksiyonu — Emilio Savio lüks kuyum. Altın, gümüş, seramik ve pırlanta ${category.name.toLowerCase()} modelleri.`
  return {
    title: category.name,
    description: desc,
    alternates: { canonical: `${site.url}/collections/${slug}` },
    openGraph: { title: `${category.name} | ${site.name}`, description: desc, url: `${site.url}/collections/${slug}` },
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const categories = await getCategories()
  const category = categories.find((c) => c.slug === slug)

  if (!category) notFound()

  const products = await getProductsByCategory(slug)

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32">
      <BreadcrumbJsonLd items={[{ name: 'Ana Sayfa', path: '/' }, { name: category.name, path: `/collections/${slug}` }]} />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-cream/40 mb-6">
          <a href="/" className="hover:text-gold">Ana Sayfa</a> <span className="mx-1">/</span>
          <span className="text-cream/60">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-cream mb-2">
            {category.name}
          </h1>
          <div className="h-1 w-24 bg-gold mb-4" />
          <p className="text-cream/60 text-sm">
            {products.length} ürün
          </p>
        </div>

        {/* Filter + grid */}
        <CollectionFilter
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            comparePrice: p.compare_price ?? undefined,
            image: productImage(p),
            material: p.material,
          }))}
        />
      </div>
    </div>
  )
}
