'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface AdminProduct {
  id: string
  name: string
  price: number
  material: string
  featured: boolean
  active: boolean
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let active = true

    const fetchProducts = async () => {
      const response = await fetch('/api/admin/products')
      const data = response.ok ? await response.json() : null
      if (active) {
        setProducts(data?.products || [])
        setLoading(false)
      }
    }

    void fetchProducts()
    return () => { active = false }
  }, [])

  const toggleFeatured = async (id: string, current: boolean) => {
    const response = await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, changes: { featured: !current } }),
    })
    if (!response.ok) return
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, featured: !current } : x)))
  }

  const toggleActive = async (id: string, current: boolean) => {
    const response = await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, changes: { active: !current } }),
    })
    if (!response.ok) return
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, active: !current } : x)))
  }

  const remove = async (id: string) => {
    if (!confirm('Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?')) return
    const response = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!response.ok) return
    setProducts((p) => p.filter((x) => x.id !== id))
  }

  const exportProducts = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/admin/products/export')
      if (!response.ok) return
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = 'emilio-urunler.xlsx'
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <p className="text-cream/50">Yükleniyor...</p>

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-serif font-bold text-cream">Ürünler ({products.length})</h1>
        <button onClick={exportProducts} disabled={exporting}
          className="border border-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-black disabled:opacity-50">
          {exporting ? 'Excel hazırlanıyor...' : '↓ Excel’e aktar'}
        </button>
      </div>

      <div className="overflow-x-auto border border-gold/20 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-cream/5">
            <tr className="text-left text-cream/60 uppercase text-xs tracking-wider">
              <th className="p-3">Ürün</th>
              <th className="p-3">Fiyat</th>
              <th className="p-3">Materyal</th>
              <th className="p-3">Öne Çıkan</th>
              <th className="p-3">Aktif</th>
              <th className="p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-cream/10 text-cream">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.price.toLocaleString('tr-TR')} ₺</td>
                <td className="p-3 text-cream/60">{p.material}</td>
                <td className="p-3">
                  <button onClick={() => toggleFeatured(p.id, p.featured)}
                    className={`px-2 py-1 rounded text-xs ${p.featured ? 'bg-gold text-black' : 'bg-cream/10 text-cream/50'}`}>
                    {p.featured ? 'Evet' : 'Hayır'}
                  </button>
                </td>
                <td className="p-3">
                  <button onClick={() => toggleActive(p.id, p.active)}
                    className={`px-2 py-1 rounded text-xs ${p.active ? 'bg-green-600/30 text-green-400' : 'bg-red-600/30 text-red-400'}`}>
                    {p.active ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td className="p-3">
                  <Link href={`/admin/products/${p.id}/variants`} className="mr-3 text-gold hover:text-cream text-xs">Varyasyonlar</Link>
                  <button onClick={() => remove(p.id)} className="text-red-400 hover:text-red-300 text-xs">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
