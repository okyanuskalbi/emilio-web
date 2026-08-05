import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductDetail } from '@/components/product/ProductDetail'
import { getProductBySlug, getRelatedProducts, productImage } from '@/lib/queries'

export const revalidate = 60

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const related = await getRelatedProducts(product.category_id, product.id)

  const images = (product.product_images || [])
    .sort((a, b) => a.position - b.position)
    .map((i) => i.url)

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <ProductDetail
          id={product.id}
          name={product.name}
          slug={product.slug}
          description={product.description}
          price={product.price}
          comparePrice={product.compare_price ?? undefined}
          material={product.material}
          images={images.length ? images : [productImage(product)]}
        />

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-cream mb-8">
              Benzer Ürünler
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  price={p.price}
                  comparePrice={p.compare_price ?? undefined}
                  image={productImage(p)}
                  material={p.material}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
