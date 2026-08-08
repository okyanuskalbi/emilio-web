'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCart } from '@/lib/cart-store'
import { CurrencyPrice, ProductPrice } from '@/components/currency/CurrencyProvider'
import { site } from '@/lib/site'
import { variantOptionsFromRecord, type VariantOptions } from '@/lib/product-variants'
import type { ProductVariant } from '@/lib/queries'

interface ProductDetailProps {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  material: string
  images: string[]
  variants?: ProductVariant[]
  whatsappPhone: string
  freeShippingThreshold?: number
}

interface SelectableVariant {
  id: string
  options: VariantOptions
  stockCount: number
  priceOverride: number | null
  sku: string
}

const STOREFRONT_OPTION_LABELS: Record<string, string> = {
  'ölçü': 'Size',
  'yüzük ölçüsü': 'Ring size',
  'renk': 'Color',
  'materyal': 'Material',
  'malzeme': 'Material',
  'karat': 'Carat',
}

function storefrontOptionLabel(name: string) {
  return STOREFRONT_OPTION_LABELS[name.trim().toLocaleLowerCase('tr-TR')] || name
}

function formatStorefrontVariantOptions(options: VariantOptions) {
  return Object.entries(options)
    .map(([name, value]) => `${storefrontOptionLabel(name)}: ${value}`)
    .join(' · ')
}

export function ProductDetail({
  id,
  name,
  slug,
  description,
  price,
  comparePrice,
  material,
  images,
  variants = [],
  whatsappPhone,
  freeShippingThreshold = 500,
}: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [wantEngraving, setWantEngraving] = useState(false)
  const [engraving, setEngraving] = useState('')
  const [added, setAdded] = useState(false)
  const [showMobileBar, setShowMobileBar] = useState(false)
  const primaryCtaRef = useRef<HTMLButtonElement>(null)
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const galleryTouchStartRef = useRef<number | null>(null)
  const addItem = useCart((s) => s.addItem)

  useEffect(() => () => {
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
  }, [])

  useEffect(() => {
    const target = primaryCtaRef.current
    if (!target || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(([entry]) => {
      setShowMobileBar(!entry.isIntersecting)
    }, { threshold: 0.15 })

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  const configuredVariants = useMemo<SelectableVariant[]>(() => (
    variants
      .filter((variant) => variant.active !== false)
      .map((variant) => ({
        id: variant.id,
        options: variantOptionsFromRecord(variant),
        stockCount: variant.stock_count,
        priceOverride: variant.price_override,
        sku: variant.sku,
      }))
      .filter((variant) => Object.keys(variant.options).length > 0)
  ), [variants])

  const purchasableVariants = useMemo(
    () => configuredVariants.filter((variant) => variant.stockCount > 0),
    [configuredVariants]
  )

  const optionGroups = useMemo(() => {
    const groups = new Map<string, Set<string>>()
    for (const variant of purchasableVariants) {
      for (const [optionName, optionValue] of Object.entries(variant.options)) {
        const values = groups.get(optionName) || new Set<string>()
        values.add(optionValue)
        groups.set(optionName, values)
      }
    }
    return Array.from(groups, ([name, values]) => ({ name, values: Array.from(values) }))
  }, [purchasableVariants])

  const [selectedOptions, setSelectedOptions] = useState<VariantOptions>(() => (
    purchasableVariants[0]?.options || {}
  ))

  const selectedVariant = useMemo(() => {
    if (!optionGroups.length) return undefined
    return purchasableVariants.find((variant) => (
      optionGroups.every(({ name }) => variant.options[name] === selectedOptions[name])
    ))
  }, [optionGroups, purchasableVariants, selectedOptions])

  const selectedVariantText = formatStorefrontVariantOptions(selectedOptions)
  const displayPrice = selectedVariant?.priceOverride ?? price
  const isSoldOut = configuredVariants.length > 0 && purchasableVariants.length === 0

  const isOptionAvailable = (optionName: string, optionValue: string) => (
    purchasableVariants.some((variant) => {
      if (variant.options[optionName] !== optionValue) return false
      return Object.entries(selectedOptions).every(([selectedName, selectedValue]) => (
        selectedName === optionName || variant.options[selectedName] === selectedValue
      ))
    })
  )

  const selectOption = (optionName: string, optionValue: string) => {
    const nextSelection = { ...selectedOptions, [optionName]: optionValue }
    const compatibleVariant = purchasableVariants.find((variant) => (
      Object.entries(nextSelection).every(([name, value]) => variant.options[name] === value)
    ))
    setSelectedOptions(compatibleVariant?.options || nextSelection)
  }

  const showPreviousImage = () => {
    setActiveImage((current) => (current - 1 + images.length) % images.length)
  }

  const showNextImage = () => {
    setActiveImage((current) => (current + 1) % images.length)
  }

  const handleGalleryPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' || images.length < 2) return
    galleryTouchStartRef.current = event.clientX
  }

  const handleGalleryPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const startX = galleryTouchStartRef.current
    galleryTouchStartRef.current = null
    if (startX === null || event.pointerType === 'mouse') return

    const distance = event.clientX - startX
    if (Math.abs(distance) < 32) return
    if (distance < 0) showNextImage()
    else showPreviousImage()
  }

  const handleAdd = () => {
    if (isSoldOut || (configuredVariants.length > 0 && !selectedVariant)) return
    addItem({
      productId: id,
      name,
      slug,
      price: displayPrice,
      image: images[0],
      material,
      variantId: selectedVariant?.id,
      variantDetails: selectedVariantText || undefined,
      engraving: wantEngraving ? engraving : undefined,
    })
    setAdded(true)
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
    addedTimerRef.current = setTimeout(() => setAdded(false), 2000)
  }

  const whatsappMessage = [
    'Hello Emilio Savio,',
    `I would like to order the ${name} (${material}).`,
    selectedVariantText ? `Options: ${selectedVariantText}.` : null,
    wantEngraving ? `Engraving: ${engraving.trim() || 'I would like to discuss the details.'}` : null,
    `Product: ${site.url}/products/${slug}`,
  ].filter(Boolean).join('\n')
  const whatsappHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
    : null

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
      {/* Gallery */}
      <div>
        <div
          className="group relative mb-4 aspect-[4/5] touch-pan-y overflow-hidden rounded-2xl border border-cream/10 bg-cream/[0.045] shadow-[0_22px_55px_-36px_rgba(0,0,0,0.95)]"
          onPointerDown={handleGalleryPointerDown}
          onPointerUp={handleGalleryPointerUp}
          onPointerCancel={() => { galleryTouchStartRef.current = null }}
        >
          <Image
            src={images[activeImage]}
            alt={`${name}, image ${activeImage + 1} of ${images.length}`}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPreviousImage}
                aria-label={`View previous image of ${name}`}
                className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-cream/20 bg-black/65 text-xl text-cream backdrop-blur-sm transition-[opacity,background-color] hover:bg-black/85 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={showNextImage}
                aria-label={`View next image of ${name}`}
                className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-cream/20 bg-black/65 text-xl text-cream backdrop-blur-sm transition-[opacity,background-color] hover:bg-black/85 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              >
                ›
              </button>
              <div aria-hidden="true" className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/50 px-3 py-2 backdrop-blur-sm">
                {images.map((image, index) => (
                  <span key={image} className={`h-1.5 rounded-full transition-[width,background-color] ${activeImage === index ? 'w-6 bg-cream' : 'w-1.5 bg-cream/45'}`} />
                ))}
              </div>
              <span className="sr-only">Swipe left or right to browse product images.</span>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                aria-label={`View ${name} image ${idx + 1}`}
                aria-pressed={activeImage === idx}
                className={`relative h-16 w-16 overflow-hidden rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-20 sm:w-20 ${
                  activeImage === idx ? 'border-gold' : 'border-transparent'
                }`}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="md:sticky md:top-28 md:self-start md:pt-3">
        <p className="text-xs text-gold uppercase tracking-widest font-medium mb-2">
          {material}
        </p>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-4">
          {name}
        </h1>

        <div className="mb-7 border-y border-gold/20 py-5">
          <ProductPrice amountTry={displayPrice} compareAmountTry={comparePrice} variant="detail" />
        </div>

        <p className="text-cream/70 leading-relaxed mb-8">{description}</p>

        {configuredVariants.length > 0 && (
          <div className="mb-7 space-y-5">
            {optionGroups.map(({ name: optionName, values }) => (
              <fieldset key={optionName}>
                <legend className="mb-2 flex w-full items-baseline justify-between text-xs uppercase tracking-[0.12em] text-cream/60">
                  <span>{storefrontOptionLabel(optionName)}</span>
                  {selectedOptions[optionName] && (
                    <span className="text-gold normal-case tracking-normal">{selectedOptions[optionName]}</span>
                  )}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {values.map((optionValue) => {
                    const selected = selectedOptions[optionName] === optionValue
                    const available = isOptionAvailable(optionName, optionValue)
                    return (
                      <button
                        key={optionValue}
                        type="button"
                        onClick={() => selectOption(optionName, optionValue)}
                        disabled={!available}
                        aria-pressed={selected}
                        className={`min-h-12 min-w-12 rounded-xl border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                          selected
                            ? 'border-gold bg-gold text-black'
                            : 'border-cream/20 bg-transparent text-cream hover:border-gold'
                        }`}
                      >
                        {optionValue}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}
            {isSoldOut && (
              <p className="border-l-2 border-red-400 pl-3 text-sm text-red-300">
                All variations of this piece are currently sold out.
              </p>
            )}
          </div>
        )}

        {/* Engraving */}
        <div className="mb-8">
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={wantEngraving}
              onChange={(e) => setWantEngraving(e.target.checked)}
              className="accent-gold"
            />
            <span className="text-sm text-cream/80">Add engraving or a monogram</span>
          </label>
          {wantEngraving && (
            <input
              type="text"
              maxLength={20}
              value={engraving}
              onChange={(e) => setEngraving(e.target.value)}
              placeholder="Text (up to 20 characters)"
              className="w-full rounded-xl border border-cream/20 bg-black px-4 py-3 text-cream outline-none focus:border-gold"
            />
          )}
        </div>

        {/* Add to cart */}
        <button
          ref={primaryCtaRef}
          type="button"
          onClick={handleAdd}
          disabled={isSoldOut || (configuredVariants.length > 0 && !selectedVariant)}
          className={`w-full rounded-full py-4 font-semibold uppercase tracking-widest transition-[background-color,transform] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 ${
            added ? 'bg-green-600 text-white' : 'bg-gold text-black hover:bg-gold/80'
          }`}
        >
          {added ? '✓ Added to bag' : isSoldOut ? 'Sold out' : 'Add to bag'}
        </button>

        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            aria-label={`Order ${name} on WhatsApp`}
            className="mt-3 flex w-full items-center justify-center rounded-full bg-[#25D366] px-5 py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#071b0e] transition-colors hover:bg-[#20bd5b] active:translate-y-px"
          >
            Order on WhatsApp
          </a>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="mt-3 flex w-full cursor-not-allowed items-center justify-center rounded-full bg-cream/10 px-5 py-4 text-sm font-bold uppercase tracking-[0.14em] text-cream/45"
          >
            WhatsApp ordering is being set up
          </button>
        )}

        {/* Trust badges */}
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gold/20 pt-8 text-center">
          <div>
            <p className="mb-1 text-xs text-gold">Free shipping</p>
            <p className="text-[10px] text-cream/50">On orders over <CurrencyPrice amountTry={freeShippingThreshold} variant="compact" /></p>
          </div>
          <div>
            <p className="mb-1 text-xs text-gold">14-day returns</p>
            <p className="text-[10px] text-cream/50">Simple return process</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-gold">Authentic piece</p>
            <p className="text-[10px] text-cream/50">Quality inspected</p>
          </div>
        </div>
      </div>

      <div
        aria-hidden={!showMobileBar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-gold/25 bg-[#0b0a08]/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-[transform,opacity] duration-300 md:hidden ${
          showMobileBar ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 shrink-0">
            <p className="max-w-28 truncate text-[10px] uppercase tracking-[0.12em] text-cream/45">{name}</p>
            <CurrencyPrice amountTry={displayPrice} variant="compact" />
          </div>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#25D366]/65 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#65e893]"
            >
              WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isSoldOut || (configuredVariants.length > 0 && !selectedVariant)}
            className="min-h-12 min-w-0 flex-1 rounded-full bg-gold px-4 text-xs font-bold uppercase tracking-[0.12em] text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {added ? 'Added' : isSoldOut ? 'Sold out' : 'Add to bag'}
          </button>
        </div>
      </div>
    </div>
  )
}
