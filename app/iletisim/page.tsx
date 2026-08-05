import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'İletişim',
  description:
    'Emilio Savio ile iletişime geçin. Sipariş, ürün, gravür ve iade sorularınız için e-posta ve sosyal medya kanallarımız.',
  alternates: { canonical: `${site.url}/iletisim` },
}

export default function ContactPage() {
  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-20">
      <BreadcrumbJsonLd items={[{ name: 'Ana Sayfa', path: '/' }, { name: 'İletişim', path: '/iletisim' }]} />
      <div className="max-w-2xl mx-auto px-4 md:px-8">
        <nav className="text-xs text-cream/40 mb-6">
          <a href="/" className="hover:text-gold">Ana Sayfa</a> <span className="mx-1">/</span> İletişim
        </nav>

        <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-2">İletişim</h1>
        <div className="h-1 w-24 bg-gold mb-8" />

        <p className="text-cream/80 leading-relaxed mb-8">
          Sipariş, ürün, gravür veya iade sorularınız için bize ulaşın. E-postalarınızı
          genellikle 1 iş günü içinde yanıtlıyoruz.
        </p>

        <div className="space-y-4 mb-10">
          <div className="border border-gold/20 rounded-lg p-5">
            <p className="text-xs text-gold uppercase tracking-wider mb-1">E-posta</p>
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
            <p className="text-xs text-gold uppercase tracking-wider mb-1">Çalışma Saatleri</p>
            <p className="text-cream">Hafta içi 09:00 – 18:00 (destek)</p>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-8">
          <p className="text-cream/60 text-sm">
            Sık sorulan sorular için <a href="/faq" className="text-gold underline">SSS sayfamıza</a> göz atın.
          </p>
        </div>
      </div>
    </div>
  )
}
