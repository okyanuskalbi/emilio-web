import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description:
    'Emilio Savio, İtalyan zanaatkârlığından ilham alan lüks bir kuyum markasıdır. Altın, gümüş, seramik ve pırlanta ile üretilen zamansız mücevherler. "Change the Story".',
  alternates: { canonical: `${site.url}/hakkimizda` },
}

export default function AboutPage() {
  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-20">
      <BreadcrumbJsonLd items={[{ name: 'Ana Sayfa', path: '/' }, { name: 'Hakkımızda', path: '/hakkimizda' }]} />
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <nav className="text-xs text-cream/40 mb-6">
          <a href="/" className="hover:text-gold">Ana Sayfa</a> <span className="mx-1">/</span> Hakkımızda
        </nav>

        <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-2">Hakkımızda</h1>
        <div className="h-1 w-24 bg-gold mb-8" />

        {/* AEO: ilk paragrafta net tanım */}
        <p className="text-lg text-cream/80 leading-relaxed mb-6">
          <strong className="text-cream">Emilio Savio</strong>, İtalyan zanaatkârlığından ilham alan,
          modern ve zamansız tasarımları bir araya getiren lüks bir kuyum markasıdır. Altın, sterling
          gümüş, seramik ve pırlanta ile ürettiğimiz bileklik, kolye, yüzük ve küpe koleksiyonları;
          günlük şıklıktan özel anlara kadar her hikâyeye eşlik eder.
        </p>

        <h2 className="text-xl font-serif font-semibold text-gold mt-10 mb-3">Felsefemiz</h2>
        <p className="text-cream/70 leading-relaxed mb-6">
          Sloganımız <em>“Change the Story”</em> — her mücevherin bir hikâye anlattığına inanıyoruz.
          Malzeme dürüstlüğü, ince işçilik ve gösterişsiz bir zarafet anlayışıyla; abartıdan uzak,
          kalıcı parçalar tasarlıyoruz.
        </p>

        <h2 className="text-xl font-serif font-semibold text-gold mt-10 mb-3">Kalite & Güven</h2>
        <ul className="list-disc list-inside space-y-2 text-cream/70 mb-6">
          <li>Her ürün orijinallik sertifikasıyla gönderilir.</li>
          <li>Kişiye özel gravür ve monogram hizmeti.</li>
          <li>14 gün koşulsuz iade, ücretsiz hediye paketi.</li>
          <li>Güvenli ödeme: PayTR & iyzico, 256-bit SSL.</li>
        </ul>

        <h2 className="text-xl font-serif font-semibold text-gold mt-10 mb-3">İletişim</h2>
        <p className="text-cream/70 leading-relaxed">
          Sorularınız için <a href={`mailto:${site.contactEmail}`} className="text-gold underline">{site.contactEmail}</a> adresinden
          veya <a href="/iletisim" className="text-gold underline">iletişim sayfamızdan</a> bize ulaşabilirsiniz.
        </p>

        <div className="mt-12 text-center border-t border-cream/10 pt-10">
          <a href="/faq" className="inline-block px-8 py-3 border border-gold text-gold font-semibold uppercase tracking-widest hover:bg-gold hover:text-black transition-colors">
            Sıkça Sorulan Sorular
          </a>
        </div>
      </div>
    </div>
  )
}
