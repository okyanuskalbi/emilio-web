'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getCartItemLineId, useCart } from '@/lib/cart-store'
import { CurrencyPrice } from '@/components/currency/CurrencyProvider'
import { supabase } from '@/lib/supabase'

type PaymentProvider = 'paytr' | 'iyzico'
type Step = 'form' | 'processing' | 'success'

export default function CheckoutPage() {
  const items = useCart((state) => state.items)
  const total = useCart((state) => state.total)
  const clear = useCart((state) => state.clear)
  const [user, setUser] = useState<User | null>(null)
  const [memberReady, setMemberReady] = useState(false)
  const [provider, setProvider] = useState<PaymentProvider>('paytr')
  const [step, setStep] = useState<Step>('form')
  const [orderNumber, setOrderNumber] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '' })
  const [consent, setConsent] = useState(false)

  const subtotal = total()
  const shipping = subtotal >= 500 ? 0 : 49.9
  const grandTotal = subtotal + shipping

  useEffect(() => {
    let active = true
    const syncUser = (nextUser: User | null) => {
      if (!active) return
      setUser(nextUser)
      setForm((current) => ({
        ...current,
        name: current.name || (typeof nextUser?.user_metadata?.full_name === 'string' ? nextUser.user_metadata.full_name : ''),
      }))
      setMemberReady(true)
    }

    void supabase.auth.getUser().then(({ data }) => syncUser(data.user))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => syncUser(session?.user ?? null))
    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!user) {
      setError('Sign in to your account before placing a tracked order.')
      return
    }
    if (!consent) {
      setError('Accept the agreements to continue.')
      return
    }

    setStep('processing')
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: form,
          paymentProvider: provider,
        }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setStep('form')
        setError(data?.error || 'Your order could not be created.')
        return
      }
      setOrderNumber(data.order?.order_number || '')
      clear()
      setStep('success')
    } catch {
      setStep('form')
      setError('We could not connect. Please try again.')
    }
  }

  if (step === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 pt-32">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gold/10 text-4xl text-gold">✓</div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Order created</p>
          <h1 className="mt-3 text-3xl font-serif font-bold text-cream">Thank you for your order</h1>
          {orderNumber && <p className="mt-3 font-mono text-sm tracking-wider text-gold">{orderNumber}</p>}
          <p className="mt-5 text-sm leading-6 text-cream/60">Your account timeline will update after payment and stock confirmation.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/account" className="bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black transition-colors hover:bg-gold/80">Track my order</Link>
            <Link href="/" className="border border-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-black">Continue shopping</Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 pt-32">
        <div className="text-center">
          <p className="mb-6 text-cream/60">Your bag is empty.</p>
          <Link href="/" className="bg-gold px-8 py-3 font-semibold uppercase tracking-widest text-black">Start shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-20 pt-24 md:pt-32">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Secure checkout</p>
        <h1 className="mt-2 text-3xl font-serif font-bold text-cream md:text-5xl">Complete your order</h1>

        {!memberReady ? (
          <p className="mt-8 text-sm text-cream/50">Checking your account…</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
              {!user && (
                <section className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
                  <h2 className="font-serif text-lg font-semibold text-cream">An account is required for order tracking</h2>
                  <p className="mt-2 text-sm leading-6 text-cream/60">Your order, delivery updates, and verified review access will be connected to your account.</p>
                  <Link href="/account?next=/checkout" className="mt-4 inline-flex bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black">Sign in or create an account</Link>
                </section>
              )}

              <section className="rounded-2xl border border-gold/20 bg-[#0f0e0c] p-5 shadow-[0_20px_48px_-38px_rgba(0,0,0,0.92)] sm:p-6">
                <h2 className="mb-2 text-lg font-serif font-semibold text-cream">Delivery details</h2>
                {user && <p className="mb-4 text-sm text-cream/50">This order will be linked to {user.email}.</p>}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input required placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="rounded-md border border-cream/20 bg-black px-4 py-3 text-cream outline-none focus:border-gold md:col-span-2" />
                  <input required inputMode="tel" placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    className="rounded-md border border-cream/20 bg-black px-4 py-3 text-cream outline-none focus:border-gold" />
                  <input required placeholder="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })}
                    className="rounded-md border border-cream/20 bg-black px-4 py-3 text-cream outline-none focus:border-gold" />
                  <textarea required rows={3} placeholder="Delivery address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })}
                    className="resize-y rounded-md border border-cream/20 bg-black px-4 py-3 text-cream outline-none focus:border-gold md:col-span-2" />
                </div>
              </section>

              <section className="rounded-2xl border border-gold/20 bg-[#0f0e0c] p-5 shadow-[0_20px_48px_-38px_rgba(0,0,0,0.92)] sm:p-6">
                <h2 className="mb-4 text-lg font-serif font-semibold text-cream">Payment method</h2>
                <div className="grid grid-cols-2 gap-4">
                  {(['paytr', 'iyzico'] as const).map((item) => (
                    <button key={item} type="button" onClick={() => setProvider(item)} className={`rounded-md border py-4 font-semibold uppercase tracking-wider transition-colors ${provider === item ? 'border-gold bg-gold text-black' : 'border-cream/20 bg-transparent text-cream hover:border-gold'}`}>
                      {item === 'paytr' ? 'PayTR' : 'iyzico'}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-cream/40">Your order record is created now. Payment confirmation will be attached automatically when the live provider is connected.</p>
              </section>

              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-gold" />
                <span className="text-sm leading-6 text-cream/70">I have read and accept the <Link href="/legal/distance-sales" className="text-gold underline">distance sales agreement</Link> and the <Link href="/legal/privacy" className="text-gold underline">privacy notice</Link>.</span>
              </label>

              {error && <p aria-live="polite" className="border-l-2 border-red-400 pl-3 text-sm text-red-300">{error}</p>}
              <button type="submit" disabled={!user || step === 'processing'} className="w-full rounded-full bg-gold py-4 font-semibold uppercase tracking-widest text-black transition-colors hover:bg-gold/80 disabled:cursor-not-allowed disabled:opacity-40">
                {step === 'processing' ? 'Creating your order…' : <>Place order · <CurrencyPrice amountTry={grandTotal} variant="compact" /></>}
              </button>
            </form>

            <aside className="h-fit rounded-2xl border border-gold/25 bg-[#0f0e0c] p-5 shadow-[0_24px_56px_-40px_rgba(0,0,0,1)] sm:p-6">
              <h2 className="mb-4 text-lg font-serif font-semibold text-cream">Order summary</h2>
              <div className="mb-4 space-y-3">
                {items.map((item) => (
                  <div key={getCartItemLineId(item)} className="flex gap-3 text-sm">
                    <Image src={item.image} alt={item.name} width={56} height={56} className="h-14 w-14 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-cream">{item.name}</p>
                      <p className="truncate text-xs text-cream/50">{item.variantDetails ? `${item.variantDetails} · ` : item.size ? `Size: ${item.size} · ` : ''}Qty: {item.quantity}</p>
                    </div>
                    <CurrencyPrice amountTry={item.price * item.quantity} variant="compact" />
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-cream/10 pt-4 text-sm">
                <div className="flex justify-between text-cream/70"><span>Subtotal</span><CurrencyPrice amountTry={subtotal} variant="summary" /></div>
                <div className="flex justify-between text-cream/70"><span>Shipping</span><span>{shipping === 0 ? 'Free' : <CurrencyPrice amountTry={shipping} variant="summary" />}</span></div>
                <div className="flex items-end justify-between border-t border-gold/20 pt-4 text-base font-semibold text-cream"><span>Total</span><CurrencyPrice amountTry={grandTotal} variant="total" /></div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
