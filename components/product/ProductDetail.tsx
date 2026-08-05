'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-store'

interface ProductDetailProps {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  material: string
  images: string[]
}

const SIZES = ['S', 'M', 'L']

export function ProductDetail({
  id,
  name,
  slug,
  description,
  price,
  comparePrice,
  material,
  images,
}: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState<string>('M')
  const [wantEngraving, setWantEngraving] = useState(false)
  const [engraving, setEngraving] = useState('')
  const [added, setAdded] = useState(false)
  const addItem = useCart((s) => s.addItem)

  const handleAdd = () => {
    addItem({
      productId: id,
      name,
      slug,
      price,
      image: images[0],
      material,
      size,
      engraving: wantEngraving ? engraving : undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {/* Gallery */}
      <div>
        <div className="relative aspect-square bg-cream/5 rounded-lg overflow-hidden mb-4">
          <img
            src={images[activeImage]}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        {images.length > 1 && (
          <div className="flex gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                  activeImage === idx ? 'border-gold' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <p className="text-xs text-gold uppercase tracking-widest font-medium mb-2">
          {material}
        </p>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-4">
          {name}
        </h1>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-semibold text-cream">
            {price.toLocaleString('tr-TR')} ₺
          </span>
          {comparePrice && (
            <span className="text-lg text-cream/40 line-through">
              {comparePrice.toLocaleString('tr-TR')} ₺
            </span>
          )}
        </div>

        <p className="text-cream/70 leading-relaxed mb-8">{description}</p>

        {/* Size selector */}
        <div className="mb-6">
          <label className="text-xs uppercase tracking-wider text-cream/60 mb-2 block">
            Beden
          </label>
          <div className="flex gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`w-12 h-12 rounded-md border transition-colors ${
                  size === s
                    ? 'bg-gold text-black border-gold'
                    : 'bg-transparent text-cream border-cream/20 hover:border-gold'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Engraving */}
        <div className="mb-8">
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={wantEngraving}
              onChange={(e) => setWantEngraving(e.target.checked)}
              className="accent-gold"
            />
            <span className="text-sm text-cream/80">Gravür / Monogram ekle</span>
          </label>
          {wantEngraving && (
            <input
              type="text"
              maxLength={20}
              value={engraving}
              onChange={(e) => setEngraving(e.target.value)}
              placeholder="Metin (max 20 karakter)"
              className="w-full bg-black border border-cream/20 text-cream px-4 py-2 rounded-md focus:border-gold outline-none"
            />
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          className={`w-full py-4 font-semibold uppercase tracking-widest transition-colors ${
            added ? 'bg-green-600 text-white' : 'bg-gold text-black hover:bg-gold/80'
          }`}
        >
          {added ? '✓ Sepete Eklendi' : 'Sepete Ekle'}
        </button>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gold/20 text-center">
          <div>
            <p className="text-xs text-gold mb-1">Ücretsiz Kargo</p>
            <p className="text-[10px] text-cream/50">500₺ üzeri</p>
          </div>
          <div>
            <p className="text-xs text-gold mb-1">14 Gün İade</p>
            <p className="text-[10px] text-cream/50">Koşulsuz</p>
          </div>
          <div>
            <p className="text-xs text-gold mb-1">Sertifikalı</p>
            <p className="text-[10px] text-cream/50">Orijinal ürün</p>
          </div>
        </div>
      </div>
    </div>
  )
}
