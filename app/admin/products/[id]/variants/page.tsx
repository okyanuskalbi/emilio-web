'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatVariantOptions, normalizeVariantOptions, variantOptionsFromRecord, type VariantOptions } from '@/lib/product-variants'

interface AdminVariant {
  id: string
  options?: VariantOptions | null
  size?: string | null
  color?: string | null
  material?: string | null
  stock_count: number
  price_override: number | null
  sku: string
  active: boolean
}

interface ProductResponse {
  id: string
  name: string
  price: number
  material: string
  product_variants: AdminVariant[]
}

const EMPTY_FORM = {
  options: 'Yüzük ölçüsü=14\nKarat=0,50 ct',
  sku: '',
  stock: '1',
  priceOverride: '',
}

function parseOptions(value: string): VariantOptions | null {
  const entries = value
    .split(/\n|;/)
    .map((field) => field.trim())
    .filter(Boolean)
    .map((field) => {
      const separator = field.indexOf('=')
      return separator > 0 ? [field.slice(0, separator), field.slice(separator + 1)] : null
    })

  if (entries.some((entry) => !entry)) return null
  const options = normalizeVariantOptions(Object.fromEntries(entries as [string, string][]))
  return Object.keys(options).length ? options : null
}

export default function ProductVariantsPage() {
  const params = useParams<{ id: string }>()
  const productId = params.id
  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let current = true
    const load = async () => {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/variants`)
      const data = response.ok ? await response.json() : null
      if (!current) return
      setProduct(data?.product || null)
      setStatus(response.ok ? '' : data?.error || 'Varyasyonlar yüklenemedi.')
    }
    void load()
    return () => { current = false }
  }, [productId])

  const addVariant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const options = parseOptions(form.options)
    const stockCount = Number(form.stock)
    const priceOverride = form.priceOverride.trim() === '' ? null : Number(form.priceOverride.replace(',', '.'))
    if (!options || !form.sku.trim() || !Number.isInteger(stockCount) || stockCount < 0 ||
      (priceOverride !== null && !Number.isFinite(priceOverride))) {
      setStatus('Seçenekleri Anahtar=Değer şeklinde, stok ve SKU ile birlikte girin.')
      return
    }

    setSaving(true)
    setStatus('')
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          options,
          sku: form.sku.trim(),
          stock_count: stockCount,
          price_override: priceOverride,
          active: true,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setStatus(data?.error || 'Varyasyon eklenemedi.')
        return
      }
      setProduct((current) => current ? {
        ...current,
        product_variants: [...current.product_variants, data.variant],
      } : current)
      setForm(EMPTY_FORM)
      setStatus('Varyasyon eklendi.')
    } catch {
      setStatus('İstek tamamlanamadı.')
    } finally {
      setSaving(false)
    }
  }

  const setActive = async (variant: AdminVariant) => {
    const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/variants`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variantId: variant.id,
        options: variantOptionsFromRecord(variant),
        sku: variant.sku,
        stock_count: variant.stock_count,
        price_override: variant.price_override,
        active: !variant.active,
      }),
    })
    const data = response.ok ? await response.json() : null
    if (!response.ok) {
      setStatus(data?.error || 'Varyasyon güncellenemedi.')
      return
    }
    setProduct((current) => current ? {
      ...current,
      product_variants: current.product_variants.map((item) => item.id === variant.id ? data.variant : item),
    } : current)
  }

  const removeVariant = async (variantId: string) => {
    if (!confirm('Bu varyasyon kalıcı olarak silinsin mi?')) return
    const response = await fetch(
      `/api/admin/products/${encodeURIComponent(productId)}/variants?variantId=${encodeURIComponent(variantId)}`,
      { method: 'DELETE' }
    )
    if (!response.ok) {
      setStatus('Varyasyon silinemedi.')
      return
    }
    setProduct((current) => current ? {
      ...current,
      product_variants: current.product_variants.filter((variant) => variant.id !== variantId),
    } : current)
  }

  return (
    <div className="max-w-4xl">
      <Link href="/admin/products" className="text-sm text-gold hover:text-cream">← Ürünlere dön</Link>
      <h1 className="mt-4 text-3xl font-serif font-bold text-cream">{product?.name || 'Varyasyonlar'}</h1>
      {product && <p className="mt-2 text-sm text-cream/60">{product.material} · Ana fiyat: {product.price.toLocaleString('tr-TR')} ₺</p>}

      <form onSubmit={addVariant} className="mt-8 border border-gold/20 bg-cream/[0.03] p-5 md:p-6">
        <h2 className="font-serif text-xl font-semibold text-cream">Yeni SKU kombinasyonu</h2>
        <p className="mt-2 text-sm leading-relaxed text-cream/55">Her satır bir seçenek grubudur. Örnek: yüzük ölçüsü, karat, renk. Aynı kombinasyonun stok ve fiyatını burada ayrı yönetirsiniz.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2 text-sm text-cream/70">
            Seçenekler
            <textarea value={form.options} onChange={(event) => setForm((current) => ({ ...current, options: event.target.value }))}
              rows={3} className="mt-2 w-full resize-y border border-cream/20 bg-black px-3 py-2 text-sm text-cream outline-none focus:border-gold" />
          </label>
          <label className="text-sm text-cream/70">
            SKU
            <input value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
              placeholder="YZ-14-050" className="mt-2 w-full border border-cream/20 bg-black px-3 py-3 text-sm text-cream outline-none focus:border-gold" />
          </label>
          <label className="text-sm text-cream/70">
            Stok
            <input inputMode="numeric" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
              className="mt-2 w-full border border-cream/20 bg-black px-3 py-3 text-sm text-cream outline-none focus:border-gold" />
          </label>
          <label className="text-sm text-cream/70">
            Özel fiyat (isteğe bağlı)
            <input inputMode="decimal" value={form.priceOverride} onChange={(event) => setForm((current) => ({ ...current, priceOverride: event.target.value }))}
              placeholder="Ana fiyat kullanılır" className="mt-2 w-full border border-cream/20 bg-black px-3 py-3 text-sm text-cream outline-none focus:border-gold" />
          </label>
        </div>
        <button disabled={saving} className="mt-5 w-full bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-black transition-colors hover:bg-gold/80 disabled:opacity-50">
          {saving ? 'Kaydediliyor...' : 'Varyasyon ekle'}
        </button>
      </form>

      {status && <p className="mt-4 text-sm text-gold">{status}</p>}

      <section className="mt-8 overflow-hidden border border-gold/20">
        <div className="border-b border-gold/20 px-5 py-4 text-sm text-cream/60">{product?.product_variants.length || 0} varyasyon</div>
        <div className="divide-y divide-cream/10">
          {product?.product_variants.map((variant) => (
            <div key={variant.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-cream">{formatVariantOptions(variantOptionsFromRecord(variant))}</p>
                <p className="mt-1 text-xs text-cream/50">SKU: {variant.sku} · Stok: {variant.stock_count} · {variant.price_override === null ? 'Ana fiyat' : `${variant.price_override.toLocaleString('tr-TR')} ₺`}</p>
              </div>
              <div className="flex gap-4 text-xs">
                <button onClick={() => setActive(variant)} className={variant.active ? 'text-green-400 hover:text-green-300' : 'text-cream/45 hover:text-cream'}>
                  {variant.active ? 'Aktif' : 'Pasif'}
                </button>
                <button onClick={() => removeVariant(variant.id)} className="text-red-400 hover:text-red-300">Sil</button>
              </div>
            </div>
          ))}
          {product && product.product_variants.length === 0 && <p className="p-5 text-sm text-cream/45">Henüz varyasyon eklenmedi.</p>}
        </div>
      </section>
    </div>
  )
}
