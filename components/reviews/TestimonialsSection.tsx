import { TestimonialsColumn, type Testimonial } from '@/components/ui/testimonials-columns-1'
import type { FeaturedReview } from '@/lib/queries'

interface TestimonialsSectionProps {
  reviews: FeaturedReview[]
}

export function TestimonialsSection({ reviews }: TestimonialsSectionProps) {
  if (!reviews.length) return null

  const testimonials: Testimonial[] = reviews.map((review) => ({
    id: review.id,
    text: review.body,
    name: review.author_name,
    role: review.product?.name ? `${review.product.name} · Verified client` : 'Verified client',
    rating: review.rating,
  }))
  const columns = [0, 1, 2].map((index) => testimonials.filter((_, itemIndex) => itemIndex % 3 === index))

  return (
    <section className="border-y border-gold/15 bg-[#0d0d0d] py-16 md:py-24" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Client reviews</p>
          <h2 id="testimonials-heading" className="mt-3 text-4xl font-serif font-bold text-cream md:text-6xl">Real experiences, verified reviews</h2>
          <p className="mt-4 text-sm leading-6 text-cream/60 md:text-base">Published experiences from verified clients, reviewed by our team.</p>
        </div>

        <div className="mx-auto mt-10 max-w-sm overflow-hidden md:hidden" style={{ maxHeight: 520 }}>
          <TestimonialsColumn testimonials={testimonials} duration={30} />
        </div>

        <div className="mt-12 hidden max-h-[610px] grid-cols-3 gap-5 overflow-hidden md:grid">
          {columns.map((column, index) => (
            <TestimonialsColumn
              key={index}
              testimonials={column.length ? column : testimonials}
              duration={18 + index * 3}
              className={index === 1 ? 'pt-10' : index === 2 ? 'pt-4' : ''}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
