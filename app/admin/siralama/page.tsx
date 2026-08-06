'use client'

import { useEffect, useState } from 'react'
import { ReorderList } from '@/components/ui/reorder-list'
import { supabase } from '@/lib/supabase'

interface OrderProduct {
  id: string
  name: string
  material: string
  price: number
  image: string
  featured: boolean
}

export default function AdminSiralama() {
  const [products, setProducts] = useState<OrderProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  const load = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, material, price, featured, product_images(url, position)')
      .eq('featured', true)
      .eq('active', true)
      .order('sort_order', { ascending: true })

    setProducts(
      (data || []).map((p) => {
        const imgs = (p.product_images as { url: string; position: number }[] | null) || []
        const first = imgs.sort((a, b) => a.position - b.position)[0]
        return {
          id: p.id,
          name: p.name,
          material: p.material,
          price: p.price,
          featured: p.featured,
          image: first?.url || 'https://via.placeholder.com/80x80/0A0A0A/C9A97D?text=ES',
        }
      })
    )
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Sürükle bittiğinde yeni sırayı DB'ye yaz
  const commit = async (next: OrderProduct[]) => {
    setSaved(false)
    await Promise.all(
      next.map((p, idx) =>
        supabase.from('products').update({ sort_order: idx + 1 }).eq('id', p.id)
      )
    )
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <p className="text-cream/50">Yükleniyor...</p>

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-cream mb-2">Ana Sayfa Ürün Sıralaması</h1>
      <p className="text-cream/60 text-sm mb-8">
        Öne çıkan ürünleri sürükleyip bırakarak ana sayfadaki sırasını belirleyin.
        Değişiklik anında kaydedilir. (Klavye: Boşluk tut, ok tuşlarıyla taşı.)
      </p>

      {saved && <p className="text-green-400 text-sm mb-4">✓ Sıralama kaydedildi</p>}

      {products.length === 0 ? (
        <p className="text-cream/50">
          Öne çıkan ürün yok. <a href="/admin/products" className="text-gold underline">Ürünler</a> sayfasından ürünleri "Öne Çıkan" yapın.
        </p>
      ) : (
        <div className="max-w-xl">
          <ReorderList
            items={products}
            getId={(p) => p.id}
            getLabel={(p) => p.name}
            onReorder={setProducts}
            onCommit={commit}
            label="Öne çıkan ürün sıralaması"
          >
            {(p) => (
              <div className="flex items-center gap-3">
                <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-200">{p.name}</p>
                  <p className="text-xs text-stone-400">{p.material}</p>
                </div>
                <p className="shrink-0 text-sm text-gold font-semibold">
                  {p.price.toLocaleString('tr-TR')} ₺
                </p>
              </div>
            )}
          </ReorderList>
        </div>
      )}
    </div>
  )
}
