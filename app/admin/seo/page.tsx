'use client'

import { useEffect, useState } from 'react'

interface Tool {
  label: string
  path: string
  desc: string
}

const TOOLS: Tool[] = [
  { label: 'robots.txt', path: '/robots.txt', desc: 'LLM/arama botları + admin engelleri' },
  { label: 'sitemap.xml', path: '/sitemap.xml', desc: 'Tüm sayfa/koleksiyon/ürün haritası' },
  { label: 'llms.txt', path: '/llms.txt', desc: 'GEO — AI arama motorları için marka özeti' },
]

export default function AdminSeo() {
  const [status, setStatus] = useState<Record<string, string>>({})
  const [llms, setLlms] = useState('')

  useEffect(() => {
    TOOLS.forEach(async (t) => {
      try {
        const res = await fetch(t.path)
        setStatus((s) => ({ ...s, [t.path]: res.ok ? '✓ Yayında' : `Hata ${res.status}` }))
        if (t.path === '/llms.txt') setLlms(await res.text())
      } catch {
        setStatus((s) => ({ ...s, [t.path]: 'Erişilemedi' }))
      }
    })
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-cream mb-2">SEO / GEO Araçları</h1>
      <p className="text-cream/60 text-sm mb-8">
        Arama motoru (SEO) ve yapay zeka cevap motoru (GEO) optimizasyon araçları — canlı durum.
      </p>

      {/* Tool cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {TOOLS.map((t) => (
          <a key={t.path} href={t.path} target="_blank" rel="noreferrer"
            className="border border-gold/20 rounded-lg p-5 hover:border-gold transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-gold">{t.label}</span>
              <span className="text-xs text-cream/60">{status[t.path] || '...'}</span>
            </div>
            <p className="text-xs text-cream/50">{t.desc}</p>
          </a>
        ))}
      </div>

      {/* JSON-LD info */}
      <section className="mb-10">
        <h2 className="text-lg font-serif font-semibold text-cream mb-3">Yapılandırılmış Veri (JSON-LD)</h2>
        <ul className="text-sm text-cream/70 space-y-1 list-disc list-inside">
          <li><strong className="text-cream">Organization</strong> + <strong className="text-cream">WebSite</strong> — her sayfada (marka, iletişim, logo)</li>
          <li><strong className="text-cream">Product</strong> + Offer + iade/kargo politikası — her ürün sayfasında</li>
          <li>Google Merchant / Rich Results uyumlu; AI motorları için kaynak</li>
        </ul>
        <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer"
          className="inline-block mt-3 text-xs text-gold underline">
          Google Rich Results Test →
        </a>
      </section>

      {/* llms.txt preview */}
      <section>
        <h2 className="text-lg font-serif font-semibold text-cream mb-3">llms.txt Önizleme (GEO)</h2>
        <pre className="bg-cream/5 border border-cream/10 rounded-lg p-4 text-xs text-cream/70 overflow-x-auto max-h-96 whitespace-pre-wrap">
          {llms || 'Yükleniyor...'}
        </pre>
      </section>
    </div>
  )
}
