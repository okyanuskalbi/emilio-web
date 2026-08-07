import Link from 'next/link'
import { HeroSection } from '@/components/hero/HeroSection'
import { ProductCard } from '@/components/product/ProductCard'
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

      {/* Featured collection */}
      <section className="py-16 md:py-20 px-4 md:px-8 max-w-7xl mx-auto [content-visibility:auto] [contain-intrinsic-size:auto_48rem]">
        <div className="mb-8 md:mb-12">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-cream mb-2">
            {home.featured_title}
          </h2>
          <div className="h-1 w-24 bg-gold" />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:gap-x-7 md:gap-y-10 lg:grid-cols-4">
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
                  <img
                    src={category.image_url || `https://via.placeholder.com/300x300/0A0A0A/C9A97D?text=${encodeURIComponent(category.name)}`}
                    alt={category.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.035]"
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

      {/* Brand promise */}
      <section className="py-16 md:py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {home.promises.map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="text-base md:text-lg font-serif font-semibold text-cream mb-2">
                {item.title}
              </h3>
              <p className="text-xs md:text-sm text-cream/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
