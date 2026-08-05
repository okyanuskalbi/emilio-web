import type { Metadata } from 'next'
import { FAQ_CATEGORIES, FAQ_FLAT } from '@/lib/faq-content'
import { FaqJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular',
  description:
    'Emilio Savio hakkında sık sorulan sorular: kargo, iade, gravür, ürün bakımı, ödeme ve garanti. Kuyum alışverişinizle ilgili net cevaplar.',
  alternates: { canonical: `${site.url}/faq` },
}

export default function FaqPage() {
  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-20">
      <FaqJsonLd items={FAQ_FLAT} />
      <BreadcrumbJsonLd items={[{ name: 'Ana Sayfa', path: '/' }, { name: 'SSS', path: '/faq' }]} />

      <div className="max-w-3xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-cream/40 mb-6">
          <a href="/" className="hover:text-gold">Ana Sayfa</a> <span className="mx-1">/</span> SSS
        </nav>

        <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-2">
          Sıkça Sorulan Sorular
        </h1>
        <div className="h-1 w-24 bg-gold mb-4" />
        <p className="text-cream/60 mb-12">
          Kargo, iade, gravür, ürün bakımı ve ödeme hakkında merak edilenler.
        </p>

        <div className="space-y-12">
          {FAQ_CATEGORIES.map((cat) => (
            <section key={cat.title}>
              <h2 className="text-xl font-serif font-semibold text-gold mb-4">{cat.title}</h2>
              <div className="space-y-4">
                {cat.items.map((item) => (
                  <details
                    key={item.q}
                    className="group border border-cream/10 rounded-lg p-4 open:border-gold/40 transition-colors"
                  >
                    <summary className="cursor-pointer text-cream font-medium list-none flex justify-between items-center">
                      {item.q}
                      <span className="text-gold group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                    </summary>
                    <p className="text-cream/70 leading-relaxed mt-3">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center border-t border-cream/10 pt-10">
          <p className="text-cream/70 mb-4">Sorunuzu bulamadınız mı?</p>
          <a href="/iletisim" className="inline-block px-8 py-3 bg-gold text-black font-semibold uppercase tracking-widest hover:bg-gold/80 transition-colors">
            Bize Ulaşın
          </a>
        </div>
      </div>
    </div>
  )
}
