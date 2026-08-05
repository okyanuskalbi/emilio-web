'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/cart-store'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  image: string
  material: string
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  image,
  material,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const addItem = useCart((s) => s.addItem)

  return (
    <Link href={`/products/${slug}`}>
      <div
        className="group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image container */}
        <div className="relative overflow-hidden bg-cream/10 aspect-square mb-4">
          <Image
            src={image}
            alt={name}
            fill
            className={`object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />

          {/* Quick add button */}
          {isHovered && (
            <div className="absolute inset-0 flex items-end justify-center pb-4 bg-black/40 backdrop-blur-sm">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  addItem({ productId: id, name, slug, price, image, material })
                }}
                className="px-8 py-2 bg-gold text-black font-semibold hover:bg-gold/80 transition-colors"
              >
                Sepete Ekle
              </button>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-2">
          <p className="text-xs text-gold uppercase tracking-wider font-medium">
            {material}
          </p>

          <h3 className="text-lg font-serif font-semibold text-cream group-hover:text-gold transition-colors">
            {name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-cream">
              ${price.toLocaleString()}
            </span>
            {comparePrice && (
              <span className="text-sm text-cream/50 line-through">
                ${comparePrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
