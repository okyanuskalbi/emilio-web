'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/cart-store'
import { GlowCard } from '@/components/ui/spotlight-card'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  image: string
  images?: string[]
  material: string
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  image,
  images,
  material,
}: ProductCardProps) {
  const gallery = images && images.length ? images : [image]
  const [activeIdx, setActiveIdx] = useState(0)
  const [hovered, setHovered] = useState(false)
  const addItem = useCart((s) => s.addItem)

  return (
    <GlowCard
      customSize
      glowColor="gold"
      className="w-full !p-3 !gap-3 !aspect-auto"
    >
      {/* Görsel (grid row 1) */}
      <Link
        href={`/products/${slug}`}
        className="relative block overflow-hidden rounded-lg bg-cream/5 aspect-square"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={gallery[activeIdx]}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-110' : 'scale-100'}`}
        />
        {comparePrice && (
          <span className="absolute top-2 left-2 bg-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Sale
          </span>
        )}
        {hovered && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 bg-black/30">
            <button
              onClick={(e) => {
                e.preventDefault()
                addItem({ productId: id, name, slug, price, image: gallery[activeIdx], material })
              }}
              className="px-6 py-2 bg-gold text-black text-sm font-semibold rounded-md hover:bg-gold/80 transition-colors"
            >
              Add to Bag
            </button>
          </div>
        )}
      </Link>

      {/* Bilgi + görsel varyant (grid row 2) */}
      <div>
        {/* Minimal görsel varyant seçici (renk yerine mini görseller) */}
        {gallery.length > 1 && (
          <div className="flex gap-1.5 mb-2">
            {gallery.slice(0, 4).map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={(e) => { e.preventDefault(); setActiveIdx(idx) }}
                aria-label={`Image ${idx + 1}`}
                className={`w-8 h-8 rounded-md overflow-hidden border transition-colors ${
                  activeIdx === idx ? 'border-gold' : 'border-cream/20 hover:border-gold/60'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <Link href={`/products/${slug}`} className="block group">
          <p className="text-[10px] text-gold uppercase tracking-wider font-medium mb-0.5">
            {material}
          </p>
          <h3 className="text-sm md:text-base font-serif font-semibold text-cream group-hover:text-gold transition-colors leading-tight line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-cream">
              {price.toLocaleString('en-US')} ₺
            </span>
            {comparePrice && (
              <span className="text-xs text-cream/40 line-through">
                {comparePrice.toLocaleString('en-US')} ₺
              </span>
            )}
          </div>
        </Link>
      </div>
    </GlowCard>
  )
}
