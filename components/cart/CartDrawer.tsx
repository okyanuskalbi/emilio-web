'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-store'

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
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-black border-l border-gold/20 z-[70] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <h2 className="text-xl font-serif font-semibold text-cream">Sepetim</h2>
          <button
            onClick={() => toggle(false)}
            className="text-cream/60 hover:text-gold text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-cream/50 text-center py-12">Sepetiniz boş.</p>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 border-b border-cream/10 pb-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-cream">{item.name}</h3>
                  <p className="text-xs text-gold">{item.material}</p>
                  {item.size && <p className="text-xs text-cream/50">Beden: {item.size}</p>}
                  {item.engraving && (
                    <p className="text-xs text-cream/50">Gravür: {item.engraving}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="w-6 h-6 border border-cream/20 text-cream rounded hover:border-gold"
                    >
                      −
                    </button>
                    <span className="text-sm text-cream w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="w-6 h-6 border border-cream/20 text-cream rounded hover:border-gold"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="ml-auto text-xs text-cream/40 hover:text-red-400"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-cream">
                  {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gold/20">
            <div className="flex justify-between mb-4">
              <span className="text-cream/70">Toplam</span>
              <span className="text-xl font-semibold text-cream">
                {total().toLocaleString('tr-TR')} ₺
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => toggle(false)}
              className="block w-full py-3 bg-gold text-black text-center font-semibold uppercase tracking-widest hover:bg-gold/80 transition-colors"
            >
              Ödemeye Geç
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
