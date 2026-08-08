'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { getCartItemLineId, useCart } from '@/lib/cart-store'
import { CurrencyPrice } from '@/components/currency/CurrencyProvider'

export function CartDrawer() {
  const items = useCart((state) => state.items)
  const isOpen = useCart((state) => state.isOpen)
  const toggle = useCart((state) => state.toggle)
  const updateQuantity = useCart((state) => state.updateQuantity)
  const removeItem = useCart((state) => state.removeItem)
  const total = useCart((state) => state.total)
  const drawerRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        toggle(false)
        return
      }
      if (event.key !== 'Tab') return

      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [isOpen, toggle])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
        onClick={() => toggle(false)}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-gold/20 bg-[#0c0b09] shadow-[-24px_0_70px_rgba(0,0,0,0.45)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/20 p-6">
          <h2 id="cart-drawer-title" className="text-xl font-serif font-semibold text-cream">Your Bag</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => toggle(false)}
            aria-label="Close cart"
            className="grid h-11 w-11 place-items-center rounded-full text-2xl leading-none text-cream/60 transition-colors hover:bg-cream/5 hover:text-gold"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <p className="font-serif text-xl text-cream">Your bag is empty</p>
              <p className="mt-2 max-w-64 text-sm leading-6 text-cream/50">Discover signature pieces. Your selections will stay safely stored here.</p>
              <Link href="/#featured-products" onClick={() => toggle(false)} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold hover:text-black">
                Explore the collection
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const lineId = getCartItemLineId(item)
              return (
                <div
                  key={lineId}
                  className="flex gap-4 rounded-2xl border border-cream/10 bg-cream/[0.025] p-3"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
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
                        aria-label={`Decrease ${item.name} quantity`}
                        className="grid h-11 w-11 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:border-gold hover:text-gold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums text-cream">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(lineId, item.quantity + 1)}
                        aria-label={`Increase ${item.name} quantity`}
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
              <span className="text-sm text-cream/60">Total</span>
              <CurrencyPrice amountTry={total()} variant="total" />
            </div>
            <Link
              href="/checkout"
              onClick={() => toggle(false)}
              className="flex min-h-12 w-full items-center justify-center rounded-full bg-gold px-5 text-center text-xs font-semibold uppercase tracking-widest text-black transition-colors hover:bg-gold/80 active:translate-y-px"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
