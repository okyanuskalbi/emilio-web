'use client'

import Link from 'next/link'
import { ProductPrice } from '@/components/currency/CurrencyProvider'

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
  name,
  slug,
  price,
  comparePrice,
  image,
  images,
  material,
}: ProductCardProps) {
  const primaryImage = images?.[0] || image

  return (
    <article className="h-full overflow-hidden rounded-2xl border border-cream/10 bg-[#0f0e0c] shadow-[0_18px_46px_-34px_rgba(0,0,0,0.95)] transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none hover:border-gold/55 hover:bg-[#15130f] hover:shadow-[0_24px_56px_-34px_rgba(0,0,0,1)] [content-visibility:auto] [contain-intrinsic-size:auto_29rem]">
      <Link href={`/products/${slug}`} className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream/[0.045]">
          <img
            src={primaryImage}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.035]"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/28 to-transparent" />
        </div>

        <div className="flex min-h-32 flex-col p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold/85">
            {material}
          </p>
          <h3 className="mt-2 line-clamp-2 font-serif text-lg font-semibold leading-[1.15] tracking-[-0.015em] text-cream transition-colors duration-200 group-hover:text-[#e1c79e]">
            {name}
          </h3>
          <div className="mt-auto pt-4">
            <ProductPrice amountTry={price} compareAmountTry={comparePrice} />
          </div>
        </div>
      </Link>
    </article>
  )
}
