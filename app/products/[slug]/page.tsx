import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductDetail } from '@/components/product/ProductDetail'
import { ProductReviews } from '@/components/reviews/ProductReviews'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { getProductBySlug, getRelatedProducts, getCategories, getApprovedReviewsForProduct, productImage, productImages } from '@/lib/queries'
import { getStoreConfig } from '@/lib/store-config'
import { site } from '@/lib/site'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product not found' }

  const desc = product.description || `${product.name} — ${product.material}. ${site.name} luxury jewelry collection.`
  const image = productImage(product)
  return {
    title: product.name,
    description: desc,
    alternates: { canonical: `${site.url}/products/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.name,
      description: desc,
      images: [image],
      url: `${site.url}/products/${product.slug}`,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const [related, categories, storeConfig, reviews] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getCategories(),
    getStoreConfig(),
    getApprovedReviewsForProduct(product.id),
  ])
  const category = categories.find((c) => c.id === product.category_id)

  const images = (product.product_images || [])
    .sort((a, b) => a.position - b.position)
    .map((i) => i.url)

  const crumbs = [
    { name: 'Home', path: '/' },
    ...(category ? [{ name: category.name, path: `/collections/${category.slug}` }] : []),
    { name: product.name, path: `/products/${product.slug}` },
  ]

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-20">
      <ProductJsonLd
        name={product.name}
        slug={product.slug}
        description={product.description}
        price={product.price}
        material={product.material}
        images={images.length ? images : [productImage(product)]}
        currency={storeConfig.currency}
        rate={storeConfig.currency === 'TRY' ? 1 : storeConfig.currency_rates[storeConfig.currency]}
      />
      <BreadcrumbJsonLd items={crumbs} />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-cream/40 mb-6 flex flex-wrap gap-1">
          {crumbs.map((c, i) => (
            <span key={c.path}>
              {i > 0 && <span className="mx-1">/</span>}
              {i < crumbs.length - 1 ? (
                <a href={c.path} className="hover:text-gold">{c.name}</a>
              ) : (
                <span className="text-cream/60">{c.name}</span>
              )}
            </span>
          ))}
        </nav>

        <ProductDetail
          id={product.id}
          name={product.name}
          slug={product.slug}
          description={product.description}
          price={product.price}
          comparePrice={product.compare_price ?? undefined}
          material={product.material}
          images={images.length ? images : [productImage(product)]}
          variants={product.product_variants}
          whatsappPhone={storeConfig.whatsapp_phone}
        />

        <ProductReviews
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
          reviews={reviews}
        />

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-cream mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:gap-x-7 md:gap-y-10 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  price={p.price}
                  comparePrice={p.compare_price ?? undefined}
                  image={productImage(p)}
                  images={productImages(p)}
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
