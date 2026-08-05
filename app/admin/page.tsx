'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, reviews: 0, offers: 0 })

  useEffect(() => {
    async function load() {
      const [p, o, r, of] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('offers').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        products: p.count || 0,
        orders: o.count || 0,
        reviews: r.count || 0,
        offers: of.count || 0,
      })
    }
    load()
  }, [])

  const cards = [
    { label: 'Ürünler', value: stats.products, href: '/admin/products' },
    { label: 'Siparişler', value: stats.orders, href: '/admin/products' },
    { label: 'Yorumlar', value: stats.reviews, href: '/admin/products' },
    { label: 'Kuponlar', value: stats.offers, href: '/admin/products' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-cream mb-8">Yönetim Paneli</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="border border-gold/20 rounded-lg p-6 hover:border-gold transition-colors">
            <p className="text-3xl font-bold text-gold mb-1">{c.value}</p>
            <p className="text-sm text-cream/60 uppercase tracking-wider">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/import" className="border border-gold/20 rounded-lg p-6 hover:border-gold transition-colors">
          <h3 className="text-lg font-serif font-semibold text-cream mb-2">📊 Excel ile Toplu Ürün</h3>
          <p className="text-sm text-cream/60">Excel dosyasından yüzlerce ürünü tek seferde yükleyin.</p>
        </Link>
        <Link href="/admin/media" className="border border-gold/20 rounded-lg p-6 hover:border-gold transition-colors">
          <h3 className="text-lg font-serif font-semibold text-cream mb-2">🖼️ Sürükle-Bırak Foto</h3>
          <p className="text-sm text-cream/60">Ürün fotoğraflarını sürükleyip bırakarak yükleyin.</p>
        </Link>
        <Link href="/admin/media" className="border border-gold/20 rounded-lg p-6 hover:border-gold transition-colors">
          <h3 className="text-lg font-serif font-semibold text-cream mb-2">✨ AI Görsel Üret</h3>
          <p className="text-sm text-cream/60">Atlas AI ile lüks ürün görselleri oluşturun.</p>
        </Link>
        <Link href="/admin/seo" className="border border-gold/20 rounded-lg p-6 hover:border-gold transition-colors">
          <h3 className="text-lg font-serif font-semibold text-cream mb-2">🔍 SEO / GEO Araçları</h3>
          <p className="text-sm text-cream/60">robots, sitemap, llms.txt ve JSON-LD durumu.</p>
        </Link>
      </div>

      <p className="text-xs text-cream/30 mt-8">
        ⚠️ Demo modu: Bu panel şu an herkese açık. Üretimde Supabase Auth admin rolü ile korunmalıdır.
      </p>
    </div>
  )
}
