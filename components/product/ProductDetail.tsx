'use client'

import { useMemo, useState } from 'react'
import { useCart } from '@/lib/cart-store'
import { CurrencyPrice, ProductPrice } from '@/components/currency/CurrencyProvider'
import { site } from '@/lib/site'
import { formatVariantOptions, variantOptionsFromRecord, type VariantOptions } from '@/lib/product-variants'
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
}

interface SelectableVariant {
  id: string
  options: VariantOptions
  stockCount: number
  priceOverride: number | null
  sku: string
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
}: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [wantEngraving, setWantEngraving] = useState(false)
  const [engraving, setEngraving] = useState('')
  const [added, setAdded] = useState(false)
  const addItem = useCart((s) => s.addItem)

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

  const selectedVariantText = formatVariantOptions(selectedOptions)
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
    setTimeout(() => setAdded(false), 2000)
  }

  const whatsappMessage = [
    'Merhaba Emilio Savio,',
    `${name} (${material}) için sipariş vermek istiyorum.`,
    selectedVariantText ? `Seçenekler: ${selectedVariantText}.` : null,
    wantEngraving ? `Kazıma: ${engraving.trim() || 'Belirtmek istiyorum.'}` : null,
    `Ürün: ${site.url}/products/${slug}`,
  ].filter(Boolean).join('\n')
  const whatsappHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
    : null

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
      {/* Gallery */}
      <div>
        <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl border border-cream/10 bg-cream/[0.045] shadow-[0_22px_55px_-36px_rgba(0,0,0,0.95)]">
          <img
            src={images[activeImage]}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
        {images.length > 1 && (
          <div className="flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                aria-label={`${name} görseli ${idx + 1}`}
                aria-pressed={activeImage === idx}
                className={`h-16 w-16 overflow-hidden rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-20 sm:w-20 ${
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
      <div className="md:pt-3">
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
                  <span>{optionName}</span>
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
                Bu ürünün tüm varyasyonları şu an tükenmiş.
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
            <span className="text-sm text-cream/80">Add engraving / monogram</span>
          </label>
          {wantEngraving && (
            <input
              type="text"
              maxLength={20}
              value={engraving}
              onChange={(e) => setEngraving(e.target.value)}
              placeholder="Text (max 20 characters)"
              className="w-full rounded-xl border border-cream/20 bg-black px-4 py-3 text-cream outline-none focus:border-gold"
            />
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          disabled={isSoldOut || (configuredVariants.length > 0 && !selectedVariant)}
          className={`w-full rounded-full py-4 font-semibold uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            added ? 'bg-green-600 text-white' : 'bg-gold text-black hover:bg-gold/80'
          }`}
        >
          {added ? '✓ Sepete eklendi' : isSoldOut ? 'Tükendi' : 'Sepete ekle'}
        </button>

        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            aria-label={`${name} için WhatsApp ile sipariş ver`}
            className="mt-3 flex w-full items-center justify-center rounded-full bg-[#25D366] px-5 py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#071b0e] transition-colors hover:bg-[#20bd5b] active:translate-y-px"
          >
            WhatsApp ile sipariş ver
          </a>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="mt-3 flex w-full cursor-not-allowed items-center justify-center rounded-full bg-cream/10 px-5 py-4 text-sm font-bold uppercase tracking-[0.14em] text-cream/45"
          >
            WhatsApp sipariş hattı ayarlanıyor
          </button>
        )}

        {/* Trust badges */}
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gold/20 pt-8 text-center">
          <div>
            <p className="mb-1 text-xs text-gold">Ücretsiz kargo</p>
            <p className="text-[10px] text-cream/50"><CurrencyPrice amountTry={500} variant="compact" /> üzeri</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-gold">14 gün iade</p>
            <p className="text-[10px] text-cream/50">Kolay iade süreci</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-gold">Özgün ürün</p>
            <p className="text-[10px] text-cream/50">Kontrol edilmiş</p>
          </div>
        </div>
      </div>
    </div>
  )
}
