'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_HOME, type HomeConfig } from '@/lib/store-config'

export default function AdminHome() {
  const [home, setHome] = useState<HomeConfig>(DEFAULT_HOME)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetch('/api/admin/store-config')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const h = (data?.data as { home?: HomeConfig } | null)?.home
        if (h) setHome({ ...DEFAULT_HOME, ...h })
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setStatus('Kaydediliyor...')
    const response = await fetch('/api/admin/store-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ home }),
    })
    const data = await response.json().catch(() => null)
    setStatus(response.ok ? '✓ Kaydedildi. Ana sayfa güncellendi.' : `Hata: ${data?.error || 'Kaydetme tamamlanamadı.'}`)
    setTimeout(() => setStatus(''), 4000)
  }

  const setField = (k: keyof HomeConfig, v: string) => setHome((h) => ({ ...h, [k]: v }))
  const setPromise = (i: number, k: 'title' | 'desc', v: string) =>
    setHome((h) => ({ ...h, promises: h.promises.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)) }))

  if (loading) return <p className="text-cream/50">Yükleniyor...</p>

  const field = (label: string, k: keyof HomeConfig) => (
    <div>
      <label className="text-xs uppercase tracking-wider text-cream/60 mb-1 block">{label}</label>
      <input
        value={home[k] as string}
        onChange={(e) => setField(k, e.target.value)}
        className="w-full bg-black border border-cream/20 text-cream px-4 py-2 rounded-md focus:border-gold outline-none"
      />
    </div>
  )

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-serif font-bold text-cream mb-2">Ana Sayfa Düzenleme</h1>
      <p className="text-cream/60 text-sm mb-8">
        Hero başlığı, slogan, görsel ve bölüm başlıklarını buradan düzenleyin. Değişiklikler
        kaydedince ana sayfada (en geç 1 dk içinde) görünür.
      </p>

      <div className="space-y-6">
        <section className="border border-gold/20 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-serif font-semibold text-gold">Hero Bölümü</h2>
          <div className="grid grid-cols-2 gap-4">
            {field('Başlık 1. satır', 'hero_title_line1')}
            {field('Başlık 2. satır', 'hero_title_line2')}
          </div>
          {field('Slogan', 'hero_subtitle')}
          {field('Hero görsel URL', 'hero_image')}
          {field('Hero video URL (MP4/WebM, opsiyonel)', 'hero_video')}
          {home.hero_image && (
            <img src={home.hero_image} alt="" className="w-full h-40 object-cover rounded-md border border-cream/10" />
          )}
        </section>

        <section className="border border-gold/20 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-serif font-semibold text-gold">Bölüm Başlıkları</h2>
          {field('Öne çıkan koleksiyon başlığı', 'featured_title')}
          {field('Kategoriler başlığı', 'categories_title')}
        </section>

        <section className="border border-gold/20 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-serif font-semibold text-gold">Marka Vaatleri (4 adet)</h2>
          {home.promises.map((p, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <input value={p.title} onChange={(e) => setPromise(i, 'title', e.target.value)}
                placeholder="Başlık"
                className="bg-black border border-cream/20 text-cream px-3 py-2 rounded-md focus:border-gold outline-none text-sm" />
              <input value={p.desc} onChange={(e) => setPromise(i, 'desc', e.target.value)}
                placeholder="Açıklama"
                className="bg-black border border-cream/20 text-cream px-3 py-2 rounded-md focus:border-gold outline-none text-sm" />
            </div>
          ))}
        </section>

        <div className="flex items-center gap-4">
          <button onClick={save}
            className="px-8 py-3 bg-gold text-black font-semibold rounded-md hover:bg-gold/80 transition-colors uppercase tracking-wider">
            Kaydet
          </button>
          {status && <span className="text-sm text-gold">{status}</span>}
        </div>
      </div>
    </div>
  )
}
