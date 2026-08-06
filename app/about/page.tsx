import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Emilio Savio is a luxury jewelry house inspired by Italian craftsmanship. Timeless pieces in gold, silver, ceramic and diamond. "Change the Story".',
  alternates: { canonical: `${site.url}/about` },
}

export default function AboutPage() {
  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-20">
      <BreadcrumbJsonLd items={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]} />
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <nav className="text-xs text-cream/40 mb-6">
          <a href="/" className="hover:text-gold">Home</a> <span className="mx-1">/</span> About
        </nav>

        <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-2">About Us</h1>
        <div className="h-1 w-24 bg-gold mb-8" />

        {/* AEO: clear definition in the first paragraph */}
        <p className="text-lg text-cream/80 leading-relaxed mb-6">
          <strong className="text-cream">Emilio Savio</strong> is a luxury jewelry house inspired by
          Italian craftsmanship, blending modern and timeless design. Our collections of bracelets,
          necklaces, rings and earrings — crafted in gold, sterling silver, ceramic and diamond —
          accompany every story, from everyday elegance to special moments.
        </p>

        <h2 className="text-xl font-serif font-semibold text-gold mt-10 mb-3">Our Philosophy</h2>
        <p className="text-cream/70 leading-relaxed mb-6">
          Our motto <em>“Change the Story”</em> reflects our belief that every piece tells a story.
          With material honesty, fine workmanship and a quiet sense of elegance, we design lasting
          pieces that never shout.
        </p>

        <h2 className="text-xl font-serif font-semibold text-gold mt-10 mb-3">Quality &amp; Trust</h2>
        <ul className="list-disc list-inside space-y-2 text-cream/70 mb-6">
          <li>Every product ships with an authenticity certificate.</li>
          <li>Personalized engraving and monogram service.</li>
          <li>14-day no-questions returns, complimentary gift wrapping.</li>
          <li>Secure payment: PayTR &amp; iyzico, 256-bit SSL.</li>
        </ul>

        <h2 className="text-xl font-serif font-semibold text-gold mt-10 mb-3">Contact</h2>
        <p className="text-cream/70 leading-relaxed">
          For any questions, reach us at <a href={`mailto:${site.contactEmail}`} className="text-gold underline">{site.contactEmail}</a> or
          via our <a href="/contact" className="text-gold underline">contact page</a>.
        </p>

        <div className="mt-12 text-center border-t border-cream/10 pt-10">
          <a href="/faq" className="inline-block px-8 py-3 border border-gold text-gold font-semibold uppercase tracking-widest hover:bg-gold hover:text-black transition-colors">
            Frequently Asked Questions
          </a>
        </div>
      </div>
    </div>
  )
}
