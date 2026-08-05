import Link from 'next/link'
import { HeroSection } from '@/components/hero/HeroSection'
import { ProductCard } from '@/components/product/ProductCard'
import { getFeaturedProducts, getCategories, productImage } from '@/lib/queries'

export const revalidate = 60

export default async function Home() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <div className="bg-black min-h-screen">
      <HeroSection />

      {/* Featured collection */}
      <section className="py-16 md:py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8 md:mb-12">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-cream mb-2">
            Featured Collection
          </h2>
          <div className="h-1 w-24 bg-gold" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              comparePrice={product.compare_price ?? undefined}
              image={productImage(product)}
              material={product.material}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-cream/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 md:mb-12">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-cream mb-2">
              Shop by Category
            </h2>
            <div className="h-1 w-24 bg-gold" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link key={category.slug} href={`/collections/${category.slug}`} className="group cursor-pointer">
                <div className="relative overflow-hidden bg-cream/10 aspect-square mb-3 rounded-lg">
                  <img
                    src={category.image_url || `https://via.placeholder.com/300x300/0A0A0A/C9A97D?text=${encodeURIComponent(category.name)}`}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-base md:text-lg font-serif font-semibold text-cream group-hover:text-gold transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand promise */}
      <section className="py-16 md:py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { title: 'Ücretsiz Kargo', desc: '500₺ üzeri siparişlerde' },
            { title: '14 Gün İade', desc: 'Koşulsuz iade hakkı' },
            { title: 'Hediye Paketi', desc: 'Ücretsiz özel kutu' },
            { title: 'Kişiselleştirme', desc: 'Gravür & monogram' },
          ].map((item) => (
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
