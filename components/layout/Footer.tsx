import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-black border-t border-gold/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-serif font-bold text-gold mb-2">EMILIO SAVIO</h3>
            <p className="text-xs text-cream/50 tracking-widest uppercase">Change the Story</p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">Alışveriş</h4>
            <ul className="space-y-2 text-sm text-cream/60">
              <li><Link href="/collections/bracelets" className="hover:text-gold">Bileklikler</Link></li>
              <li><Link href="/collections/necklaces" className="hover:text-gold">Kolyeler</Link></li>
              <li><Link href="/collections/rings" className="hover:text-gold">Yüzükler</Link></li>
              <li><Link href="/collections/earrings" className="hover:text-gold">Küpeler</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">Yasal</h4>
            <ul className="space-y-2 text-sm text-cream/60">
              <li><Link href="/legal/mesafeli-satis" className="hover:text-gold">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="/legal/gizlilik" className="hover:text-gold">Gizlilik & KVKK</Link></li>
              <li><Link href="/legal/iade-iptal" className="hover:text-gold">İade & İptal</Link></li>
              <li><Link href="/legal/teslimat" className="hover:text-gold">Teslimat</Link></li>
              <li><Link href="/legal/cerez" className="hover:text-gold">Çerez Politikası</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">İletişim</h4>
            <ul className="space-y-2 text-sm text-cream/60">
              <li><Link href="/account" className="hover:text-gold">Hesabım</Link></li>
              <li><a href="mailto:info@emiliosavio.com" className="hover:text-gold">info@emiliosavio.com</a></li>
              <li><a href="https://instagram.com" className="hover:text-gold">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream/40">
            © {new Date().getFullYear()} Emilio Savio. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-cream/40">
            Güvenli ödeme: PayTR & iyzico · 256-bit SSL
          </p>
        </div>
      </div>
    </footer>
  )
}
