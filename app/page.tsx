import Image from 'next/image'
import Link from 'next/link'
import { HeroSection } from '@/components/hero/HeroSection'
import { ProductCard } from '@/components/product/ProductCard'
import { CurrencyPrice } from '@/components/currency/CurrencyProvider'
import { TestimonialsSection } from '@/components/reviews/TestimonialsSection'
import { getFeaturedProducts, getCategories, getFeaturedReviews, productImage, productImages } from '@/lib/queries'
import { getStoreConfig } from '@/lib/store-config'

export const revalidate = 60

export default async function Home() {
  const [products, categories, config, reviews] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getStoreConfig(),
    getFeaturedReviews(),
  ])
  const home = config.home

  return (
    <div className="bg-black min-h-screen">
      <HeroSection
        titleLine1={home.hero_title_line1}
        titleLine2={home.hero_title_line2}
        subtitle={home.hero_subtitle}
        image={home.hero_image}
        video={home.hero_video}
      />

      <section className="border-y border-gold/15 bg-[#0d0c0a]" aria-labelledby="store-promises-heading">
        <h2 id="store-promises-heading" className="sr-only">Shopping assurances</h2>
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 md:grid-cols-4 md:px-8">
          {home.promises.map((item, index) => {
            const isShippingPromise = item.title.toLowerCase().includes('shipping')
            return (
              <article key={item.title} className="relative min-h-28 border-cream/10 px-3 py-6 odd:border-r md:min-h-32 md:border-r md:px-6 md:py-7 md:last:border-r-0">
                <span aria-hidden="true" className="text-[10px] font-bold tracking-[0.18em] text-gold/65">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-base font-serif font-semibold tracking-[-0.01em] text-cream md:text-lg">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-cream/50 md:text-sm">
                  {isShippingPromise ? <>On orders over <CurrencyPrice amountTry={config.free_shipping_threshold} variant="compact" /></> : item.desc}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      {/* Featured collection */}
      <section id="featured-products" className="scroll-mt-24 py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8 md:mb-12">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-cream mb-2">
            {home.featured_title}
          </h2>
          <div className="h-1 w-24 bg-gold" />
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-7 min-[360px]:grid-cols-2 md:gap-x-7 md:gap-y-10 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              comparePrice={product.compare_price ?? undefined}
              image={productImage(product)}
              images={productImages(product)}
              material={product.material}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-cream/5 [content-visibility:auto] [contain-intrinsic-size:auto_42rem]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 md:mb-12">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-cream mb-2">
              {home.categories_title}
            </h2>
            <div className="h-1 w-24 bg-gold" />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
            {categories.map((category) => (
              <Link key={category.slug} href={`/collections/${category.slug}`} className="group block overflow-hidden rounded-2xl border border-cream/10 bg-[#0f0e0c] p-2 shadow-[0_18px_46px_-34px_rgba(0,0,0,0.95)] transition-[background-color,border-color] duration-300 hover:border-gold/55 hover:bg-[#15130f]">
                <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-xl bg-cream/[0.045]">
                  <Image
                    src={category.image_url || `https://via.placeholder.com/300x300/0A0A0A/C9A97D?text=${encodeURIComponent(category.name)}`}
                    alt={category.name}
                    fill
                    sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 20vw"
                    className="object-cover transition-transform duration-700 motion-reduce:transition-none group-hover:scale-[1.035]"
                  />
                </div>
                <h3 className="px-2 pb-2 text-base font-serif font-semibold text-cream transition-colors group-hover:text-gold md:text-lg">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection reviews={reviews} />
    </div>
  )
}
