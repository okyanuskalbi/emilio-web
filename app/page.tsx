import { HeroSection } from '@/components/hero/HeroSection'
import { ProductCard } from '@/components/product/ProductCard'

const FEATURED_PRODUCTS = [
  {
    id: '1',
    name: 'Gold Cuban Chain Bracelet',
    slug: 'gold-cuban-chain-bracelet',
    price: 1250,
    comparePrice: 1500,
    image: 'https://via.placeholder.com/400x400?text=Gold+Bracelet',
    material: 'Gold Vermeil',
  },
  {
    id: '2',
    name: 'Sterling Silver Signet Ring',
    slug: 'sterling-silver-signet-ring',
    price: 450,
    image: 'https://via.placeholder.com/400x400?text=Silver+Ring',
    material: 'Sterling Silver',
  },
  {
    id: '3',
    name: 'Diamond Pendant Necklace',
    slug: 'diamond-pendant-necklace',
    price: 2800,
    comparePrice: 3200,
    image: 'https://via.placeholder.com/400x400?text=Diamond+Pendant',
    material: 'Gold & Diamond',
  },
  {
    id: '4',
    name: 'Pearl Drop Earrings',
    slug: 'pearl-drop-earrings',
    price: 650,
    image: 'https://via.placeholder.com/400x400?text=Pearl+Earrings',
    material: 'Gold & Pearl',
  },
]

const CATEGORIES = [
  { name: 'Bracelets', slug: 'bracelets', image: 'https://via.placeholder.com/300x300?text=Bracelets' },
  { name: 'Necklaces', slug: 'necklaces', image: 'https://via.placeholder.com/300x300?text=Necklaces' },
  { name: 'Rings', slug: 'rings', image: 'https://via.placeholder.com/300x300?text=Rings' },
  { name: 'Earrings', slug: 'earrings', image: 'https://via.placeholder.com/300x300?text=Earrings' },
  { name: 'Custom Design', slug: 'custom', image: 'https://via.placeholder.com/300x300?text=Custom' },
]

export default function Home() {
  return (
    <div className="bg-black min-h-screen">
      {/* Hero section */}
      <HeroSection />

      {/* Featured collection */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-cream mb-2">
            Featured Collection
          </h2>
          <div className="h-1 w-24 bg-gold" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 md:px-8 bg-cream/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-cream mb-2">
              Shop by Category
            </h2>
            <div className="h-1 w-24 bg-gold" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {CATEGORIES.map((category) => (
              <div key={category.slug} className="group cursor-pointer">
                <div className="relative overflow-hidden bg-cream/10 aspect-square mb-3 rounded-lg">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-lg font-serif font-semibold text-cream group-hover:text-gold transition-colors">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand promise */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { title: 'Free Shipping', desc: 'On orders over $500' },
            { title: '30-Day Returns', desc: 'No questions asked' },
            { title: 'Gift Wrapping', desc: 'Complimentary service' },
            { title: 'Personalization', desc: 'Engraving available' },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="text-lg font-serif font-semibold text-cream mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-cream/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
