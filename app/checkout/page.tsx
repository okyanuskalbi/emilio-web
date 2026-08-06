'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-store'

type PaymentProvider = 'paytr' | 'iyzico'
type Step = 'form' | 'processing' | 'success'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const [provider, setProvider] = useState<PaymentProvider>('paytr')
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '',
  })
  const [consent, setConsent] = useState(false)

  const shipping = total() >= 500 ? 0 : 49.9
  const grandTotal = total() + shipping

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) {
      alert('Please accept the distance sales agreement to continue.')
      return
    }
    // DEMO ödeme akışı — gerçek entegrasyonda /api/checkout çağrılır
    setStep('processing')
    setTimeout(() => {
      setStep('success')
      clear()
    }, 2500)
  }

  if (step === 'success') {
    return (
      <div className="bg-black min-h-screen pt-32 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-600/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-green-500">✓</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-cream mb-4">Order Received</h1>
          <p className="text-cream/60 mb-2">
            {provider === 'paytr' ? 'PayTR' : 'iyzico'} payment completed successfully (DEMO).
          </p>
          <p className="text-cream/40 text-sm mb-8">
            An order confirmation email was sent to {form.email || 'your email address'} .
          </p>
          <Link href="/" className="inline-block px-8 py-3 bg-gold text-black font-semibold uppercase tracking-widest hover:bg-gold/80">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="bg-black min-h-screen pt-32 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-6" />
          <p className="text-cream/70">
            {provider === 'paytr' ? 'PayTR' : 'iyzico'} secure payment page, redirecting...
          </p>
          <p className="text-cream/40 text-xs mt-2">DEMO mode — no real payment is taken</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-black min-h-screen pt-32 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-cream/60 mb-6">Your bag is empty.</p>
          <Link href="/" className="px-8 py-3 bg-gold text-black font-semibold uppercase tracking-widest">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Address */}
            <div className="border border-gold/20 rounded-lg p-6">
              <h2 className="text-lg font-serif font-semibold text-cream mb-4">Shipping Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Full Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none md:col-span-2" />
                <input required type="email" placeholder="Email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none" />
                <input required placeholder="Phone" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none" />
                <input required placeholder="Address" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none md:col-span-2" />
                <input required placeholder="City" value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none" />
              </div>
            </div>

            {/* Payment method */}
            <div className="border border-gold/20 rounded-lg p-6">
              <h2 className="text-lg font-serif font-semibold text-cream mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 gap-4">
                {(['paytr', 'iyzico'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`py-4 rounded-md border font-semibold uppercase tracking-wider transition-colors ${
                      provider === p
                        ? 'bg-gold text-black border-gold'
                        : 'bg-transparent text-cream border-cream/20 hover:border-gold'
                    }`}
                  >
                    {p === 'paytr' ? 'PayTR' : 'iyzico'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-cream/40 mt-3">
                Credit/debit card installment options are offered on the payment page.
              </p>
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="accent-gold mt-1" />
              <span className="text-sm text-cream/70">
                <Link href="/legal/distance-sales" className="text-gold underline">Distance Sales Agreement</Link> and{' '}
                <Link href="/legal/privacy" className="text-gold underline">Preliminary Information Form</Link> — I have read and accept.
              </span>
            </label>

            <button type="submit"
              className="w-full py-4 bg-gold text-black font-semibold uppercase tracking-widest hover:bg-gold/80 transition-colors">
              {grandTotal.toLocaleString('en-US')} ₺ Pay
            </button>
          </form>

          {/* Order summary */}
          <div className="border border-gold/20 rounded-lg p-6 h-fit">
            <h2 className="text-lg font-serif font-semibold text-cream mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3 text-sm">
                  <img src={item.image} alt="" className="w-14 h-14 object-cover rounded" />
                  <div className="flex-1">
                    <p className="text-cream">{item.name}</p>
                    <p className="text-cream/50 text-xs">
                      {item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-cream">{(item.price * item.quantity).toLocaleString('en-US')} ₺</p>
                </div>
              ))}
            </div>
            <div className="border-t border-cream/10 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-cream/70">
                <span>Ara Total</span>
                <span>{total().toLocaleString('en-US')} ₺</span>
              </div>
              <div className="flex justify-between text-cream/70">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `${shipping.toLocaleString('en-US')} ₺`}</span>
              </div>
              <div className="flex justify-between text-cream font-semibold text-base pt-2 border-t border-cream/10">
                <span>Total</span>
                <span>{grandTotal.toLocaleString('en-US')} ₺</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
