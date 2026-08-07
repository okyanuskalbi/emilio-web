'use client'

import Link from 'next/link'
import { getCartItemLineId, useCart } from '@/lib/cart-store'
import { CurrencyPrice } from '@/components/currency/CurrencyProvider'

export function CartDrawer() {
  const { items, isOpen, toggle, updateQuantity, removeItem, total } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
        onClick={() => toggle(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-gold/20 bg-[#0c0b09] shadow-[-24px_0_70px_rgba(0,0,0,0.45)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/20 p-6">
          <h2 className="text-xl font-serif font-semibold text-cream">Sepetim</h2>
          <button
            onClick={() => toggle(false)}
            aria-label="Sepeti kapat"
            className="grid h-11 w-11 place-items-center rounded-full text-2xl leading-none text-cream/60 transition-colors hover:bg-cream/5 hover:text-gold"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <p className="py-12 text-center text-cream/50">Sepetiniz henüz boş.</p>
          ) : (
            items.map((item) => {
              const lineId = getCartItemLineId(item)
              return (
                <div
                  key={lineId}
                  className="flex gap-4 rounded-2xl border border-cream/10 bg-cream/[0.025] p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-cream">{item.name}</h3>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-gold/85">{item.material}</p>
                    {item.variantDetails && <p className="text-xs text-cream/50">{item.variantDetails}</p>}
                    {item.size && <p className="text-xs text-cream/50">Size: {item.size}</p>}
                    {item.engraving && (
                      <p className="text-xs text-cream/50">Engraving: {item.engraving}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(lineId, item.quantity - 1)}
                        aria-label={`${item.name} adedini azalt`}
                        className="grid h-11 w-11 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:border-gold hover:text-gold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums text-cream">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(lineId, item.quantity + 1)}
                        aria-label={`${item.name} adedini artır`}
                        className="grid h-11 w-11 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:border-gold hover:text-gold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(lineId)}
                        className="ml-auto min-h-11 px-2 text-xs text-cream/40 transition-colors hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="pt-1 text-right">
                    <CurrencyPrice amountTry={item.price * item.quantity} variant="compact" />
                  </p>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gold/20 p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <span className="text-sm text-cream/60">Toplam</span>
              <CurrencyPrice amountTry={total()} variant="total" />
            </div>
            <Link
              href="/checkout"
              onClick={() => toggle(false)}
              className="block w-full rounded-full bg-gold py-3.5 text-center text-xs font-semibold uppercase tracking-widest text-black transition-colors hover:bg-gold/80"
            >
              Siparişi tamamla
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
