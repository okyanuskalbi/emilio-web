import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/product/ProductCard'
import { CollectionFilter } from '@/components/product/CollectionFilter'
import { getProductsByCategory, getCategories, productImage } from '@/lib/queries'

export const revalidate = 60

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((c) => ({ slug: c.slug }))
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
      <div className="max-w-7xl mx-auto px-4 md:px-8">
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
