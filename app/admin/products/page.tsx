'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

  const load = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, price, material, featured, active')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('products').update({ featured: !current }).eq('id', id)
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, featured: !current } : x)))
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ active: !current }).eq('id', id)
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, active: !current } : x)))
  }

  const remove = async (id: string) => {
    if (!confirm('Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts((p) => p.filter((x) => x.id !== id))
  }

  if (loading) return <p className="text-cream/50">Yükleniyor...</p>

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-cream mb-8">Ürünler ({products.length})</h1>

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
