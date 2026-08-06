import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Emilio Savio. Email and social channels for your order, product, engraving and return questions.',
  alternates: { canonical: `${site.url}/contact` },
}

export default function ContactPage() {
  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-20">
      <BreadcrumbJsonLd items={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} />
      <div className="max-w-2xl mx-auto px-4 md:px-8">
        <nav className="text-xs text-cream/40 mb-6">
          <a href="/" className="hover:text-gold">Home</a> <span className="mx-1">/</span> Contact
        </nav>

        <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-2">Contact</h1>
        <div className="h-1 w-24 bg-gold mb-8" />

        <p className="text-cream/80 leading-relaxed mb-8">
          Reach us for any order, product, engraving or return questions. We usually reply
          within one business day.
        </p>

        <div className="space-y-4 mb-10">
          <div className="border border-gold/20 rounded-lg p-5">
            <p className="text-xs text-gold uppercase tracking-wider mb-1">Email</p>
            <a href={`mailto:${site.contactEmail}`} className="text-cream hover:text-gold text-lg">
              {site.contactEmail}
            </a>
          </div>
          <div className="border border-gold/20 rounded-lg p-5">
            <p className="text-xs text-gold uppercase tracking-wider mb-1">Instagram</p>
            <a href={site.social.instagram} target="_blank" rel="noreferrer" className="text-cream hover:text-gold text-lg">
              @emiliosavio
            </a>
          </div>
          <div className="border border-gold/20 rounded-lg p-5">
            <p className="text-xs text-gold uppercase tracking-wider mb-1">Working Hours</p>
            <p className="text-cream">Weekdays 09:00 – 18:00 (support)</p>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-8">
          <p className="text-cream/60 text-sm">
            For common questions, see our <a href="/faq" className="text-gold underline">FAQ page</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
