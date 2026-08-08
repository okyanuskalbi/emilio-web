'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, type PointerEvent } from 'react'
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
  const galleryImages = images?.length ? images : [image]
  const [activeImage, setActiveImage] = useState(0)
  const touchStartXRef = useRef<number | null>(null)
  const suppressNavigationRef = useRef(false)
  const hasAlternateImage = galleryImages.length > 1
  const discountPercent = comparePrice && comparePrice > price
    ? Math.round((1 - price / comparePrice) * 100)
    : 0

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' || !hasAlternateImage) return
    touchStartXRef.current = event.clientX
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current
    touchStartXRef.current = null
    if (startX === null || event.pointerType === 'mouse') return

    const distance = event.clientX - startX
    if (Math.abs(distance) < 28) return
    suppressNavigationRef.current = true
    window.setTimeout(() => {
      suppressNavigationRef.current = false
    }, 400)
    setActiveImage((current) => (
      distance < 0
        ? Math.min(current + 1, galleryImages.length - 1)
        : Math.max(current - 1, 0)
    ))
  }

  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-cream/10 bg-[#0f0e0c] shadow-[0_18px_46px_-34px_rgba(0,0,0,0.95)] transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none hover:border-gold/55 hover:bg-[#15130f] hover:shadow-[0_24px_56px_-34px_rgba(0,0,0,1)]">
      <div
        className="relative aspect-[4/5] touch-pan-y overflow-hidden bg-cream/[0.045]"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { touchStartXRef.current = null }}
      >
        <Link
          href={`/products/${slug}`}
          aria-label={`View ${name}`}
          onClick={(event) => {
            if (!suppressNavigationRef.current) return
            event.preventDefault()
            suppressNavigationRef.current = false
          }}
          className="absolute inset-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
        >
          {galleryImages.map((galleryImage, index) => (
            <Image
              key={galleryImage}
              src={galleryImage}
              alt={index === 0 ? name : `${name} worn on model`}
              fill
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
              className={`object-cover transition-[transform,opacity] duration-700 motion-reduce:transition-none md:group-hover:scale-[1.025] md:group-focus-within:scale-[1.025] ${
                activeImage === index ? 'opacity-100' : 'opacity-0'
              } ${
                index === 0
                  ? hasAlternateImage
                    ? 'md:opacity-100 md:group-hover:opacity-0 md:group-focus-within:opacity-0'
                    : 'md:opacity-100'
                  : index === 1
                    ? 'md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100'
                    : 'md:hidden'
              }`}
            />
          ))}
          {discountPercent > 0 && (
            <span className="absolute left-3 top-3 border border-cream/20 bg-black/75 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-cream backdrop-blur-sm">
              Save {discountPercent}%
            </span>
          )}
          {hasAlternateImage && (
            <>
              <span className="absolute right-3 top-3 border border-cream/15 bg-black/65 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-cream/80 backdrop-blur-sm md:hidden">
                Swipe
              </span>
              <span className="sr-only">Swipe left or right to view alternate images.</span>
            </>
          )}
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/28 to-transparent" />
        </Link>

        {hasAlternateImage && (
          <>
            <button
              type="button"
              onClick={() => setActiveImage((current) => Math.max(current - 1, 0))}
              disabled={activeImage === 0}
              aria-label={`Show previous image of ${name}`}
              className={`absolute left-1 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-cream/20 bg-black/70 text-2xl text-cream backdrop-blur-sm transition-opacity md:hidden ${activeImage === 0 ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setActiveImage((current) => Math.min(current + 1, galleryImages.length - 1))}
              disabled={activeImage === galleryImages.length - 1}
              aria-label={`Show next image of ${name}`}
              className={`absolute right-1 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-cream/20 bg-black/70 text-2xl text-cream backdrop-blur-sm transition-opacity md:hidden ${activeImage === galleryImages.length - 1 ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            >
              ›
            </button>
            <div aria-hidden="true" className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 md:hidden">
              {galleryImages.map((galleryImage, index) => (
                <span key={galleryImage} className={`h-1.5 rounded-full transition-[width,background-color] ${activeImage === index ? 'w-5 bg-cream' : 'w-1.5 bg-cream/45'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <Link
        href={`/products/${slug}`}
        className="flex min-h-32 flex-col p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold sm:p-5"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold/85">
          {material}
        </p>
        <h3 className="mt-2 line-clamp-2 font-serif text-lg font-semibold leading-[1.15] tracking-[-0.015em] text-cream transition-colors duration-200 group-hover:text-[#e1c79e]">
          {name}
        </h3>
        <div className="mt-auto pt-4">
          <ProductPrice amountTry={price} compareAmountTry={comparePrice} />
        </div>
      </Link>
    </article>
  )
}
