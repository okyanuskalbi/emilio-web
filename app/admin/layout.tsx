import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="bg-black min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Admin nav */}
        <div className="flex flex-wrap gap-4 mb-8 pb-4 border-b border-gold/20">
          <span className="text-gold font-serif font-bold text-lg mr-4">Admin</span>
          <Link href="/admin" className="text-cream/70 hover:text-gold text-sm uppercase tracking-wider">Panel</Link>
          <Link href="/admin/anasayfa" className="text-cream/70 hover:text-gold text-sm uppercase tracking-wider">Ana Sayfa</Link>
          <Link href="/admin/products" className="text-cream/70 hover:text-gold text-sm uppercase tracking-wider">Ürünler</Link>
          <Link href="/admin/orders" className="text-cream/70 hover:text-gold text-sm uppercase tracking-wider">Siparişler</Link>
          <Link href="/admin/reviews" className="text-cream/70 hover:text-gold text-sm uppercase tracking-wider">Yorumlar</Link>
          <Link href="/admin/members" className="text-cream/70 hover:text-gold text-sm uppercase tracking-wider">Üyeler / Sepetler</Link>
          <Link href="/admin/siralama" className="text-cream/70 hover:text-gold text-sm uppercase tracking-wider">Sıralama</Link>
          <Link href="/admin/import" className="text-cream/70 hover:text-gold text-sm uppercase tracking-wider">Excel İçe Aktar</Link>
          <Link href="/admin/media" className="text-cream/70 hover:text-gold text-sm uppercase tracking-wider">Medya / AI Görsel</Link>
          <Link href="/admin/seo" className="text-cream/70 hover:text-gold text-sm uppercase tracking-wider">SEO / GEO</Link>
          <Link href="/admin/ayarlar" className="text-cream/70 hover:text-gold text-sm uppercase tracking-wider">Ayarlar</Link>
          <Link href="/" className="text-cream/40 hover:text-gold text-sm uppercase tracking-wider ml-auto">← Siteye Dön</Link>
        </div>
        {children}
      </div>
    </div>
  )
}
