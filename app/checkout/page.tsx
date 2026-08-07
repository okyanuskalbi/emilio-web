'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getCartItemLineId, useCart } from '@/lib/cart-store'
import { CurrencyPrice } from '@/components/currency/CurrencyProvider'
import { supabase } from '@/lib/supabase'

type PaymentProvider = 'paytr' | 'iyzico'
type Step = 'form' | 'processing' | 'success'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
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
      setError('Sipariş takibi için önce üyelik hesabınıza giriş yapmalısınız.')
      return
    }
    if (!consent) {
      setError('Devam etmek için sözleşmeleri onaylayın.')
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
        setError(data?.error || 'Sipariş oluşturulamadı.')
        return
      }
      setOrderNumber(data.order?.order_number || '')
      clear()
      setStep('success')
    } catch {
      setStep('form')
      setError('Bağlantı kurulamadı. Lütfen tekrar deneyin.')
    }
  }

  if (step === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 pt-32">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gold/10 text-4xl text-gold">✓</div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Sipariş kaydı oluşturuldu</p>
          <h1 className="mt-3 text-3xl font-serif font-bold text-cream">Siparişiniz alındı</h1>
          {orderNumber && <p className="mt-3 font-mono text-sm tracking-wider text-gold">{orderNumber}</p>}
          <p className="mt-5 text-sm leading-6 text-cream/60">Ödeme ve stok onayı sonrasında sipariş durumunuz hesabınızdaki takip akışında güncellenecek.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/account" className="bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black transition-colors hover:bg-gold/80">Siparişimi takip et</Link>
            <Link href="/" className="border border-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-black">Alışverişe dön</Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 pt-32">
        <div className="text-center">
          <p className="mb-6 text-cream/60">Sepetiniz boş.</p>
          <Link href="/" className="bg-gold px-8 py-3 font-semibold uppercase tracking-widest text-black">Alışverişe başla</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-20 pt-24 md:pt-32">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Güvenli sipariş</p>
        <h1 className="mt-2 text-3xl font-serif font-bold text-cream md:text-5xl">Siparişi tamamla</h1>

        {!memberReady ? (
          <p className="mt-8 text-sm text-cream/50">Üyelik oturumu kontrol ediliyor…</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
              {!user && (
                <section className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
                  <h2 className="font-serif text-lg font-semibold text-cream">Siparişi takip etmek için üyelik gerekli</h2>
                  <p className="mt-2 text-sm leading-6 text-cream/60">Siparişiniz hesabınıza bağlanır; kargo durumu ve satın aldığınız ürünlere ait yorum hakkı buradan yönetilir.</p>
                  <Link href="/account?next=/checkout" className="mt-4 inline-flex bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black">Giriş yap veya üye ol</Link>
                </section>
              )}

              <section className="rounded-2xl border border-gold/20 bg-[#0f0e0c] p-5 shadow-[0_20px_48px_-38px_rgba(0,0,0,0.92)] sm:p-6">
                <h2 className="mb-2 text-lg font-serif font-semibold text-cream">Teslimat bilgileri</h2>
                {user && <p className="mb-4 text-sm text-cream/50">Sipariş hesabınıza şu e-posta ile bağlanacak: {user.email}</p>}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input required placeholder="Ad soyad" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="rounded-md border border-cream/20 bg-black px-4 py-3 text-cream outline-none focus:border-gold md:col-span-2" />
                  <input required inputMode="tel" placeholder="Telefon" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    className="rounded-md border border-cream/20 bg-black px-4 py-3 text-cream outline-none focus:border-gold" />
                  <input required placeholder="Şehir" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })}
                    className="rounded-md border border-cream/20 bg-black px-4 py-3 text-cream outline-none focus:border-gold" />
                  <textarea required rows={3} placeholder="Teslimat adresi" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })}
                    className="resize-y rounded-md border border-cream/20 bg-black px-4 py-3 text-cream outline-none focus:border-gold md:col-span-2" />
                </div>
              </section>

              <section className="rounded-2xl border border-gold/20 bg-[#0f0e0c] p-5 shadow-[0_20px_48px_-38px_rgba(0,0,0,0.92)] sm:p-6">
                <h2 className="mb-4 text-lg font-serif font-semibold text-cream">Ödeme yöntemi</h2>
                <div className="grid grid-cols-2 gap-4">
                  {(['paytr', 'iyzico'] as const).map((item) => (
                    <button key={item} type="button" onClick={() => setProvider(item)} className={`rounded-md border py-4 font-semibold uppercase tracking-wider transition-colors ${provider === item ? 'border-gold bg-gold text-black' : 'border-cream/20 bg-transparent text-cream hover:border-gold'}`}>
                      {item === 'paytr' ? 'PayTR' : 'iyzico'}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-cream/40">Sipariş kaydınız şimdi oluşturulur. Canlı ödeme sağlayıcısı bağlandığında ödeme onayı bu kayda otomatik işlenecektir.</p>
              </section>

              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-gold" />
                <span className="text-sm leading-6 text-cream/70"><Link href="/legal/distance-sales" className="text-gold underline">Mesafeli satış sözleşmesini</Link> ve <Link href="/legal/privacy" className="text-gold underline">ön bilgilendirme formunu</Link> okudum, kabul ediyorum.</span>
              </label>

              {error && <p aria-live="polite" className="border-l-2 border-red-400 pl-3 text-sm text-red-300">{error}</p>}
              <button type="submit" disabled={!user || step === 'processing'} className="w-full rounded-full bg-gold py-4 font-semibold uppercase tracking-widest text-black transition-colors hover:bg-gold/80 disabled:cursor-not-allowed disabled:opacity-40">
                {step === 'processing' ? 'Sipariş oluşturuluyor…' : <><CurrencyPrice amountTry={grandTotal} variant="compact" /> sipariş kaydı oluştur</>}
              </button>
            </form>

            <aside className="h-fit rounded-2xl border border-gold/25 bg-[#0f0e0c] p-5 shadow-[0_24px_56px_-40px_rgba(0,0,0,1)] sm:p-6">
              <h2 className="mb-4 text-lg font-serif font-semibold text-cream">Sipariş özeti</h2>
              <div className="mb-4 space-y-3">
                {items.map((item) => (
                  <div key={getCartItemLineId(item)} className="flex gap-3 text-sm">
                    <img src={item.image} alt="" className="h-14 w-14 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-cream">{item.name}</p>
                      <p className="truncate text-xs text-cream/50">{item.variantDetails ? `${item.variantDetails} · ` : item.size ? `Ölçü: ${item.size} · ` : ''}Adet: {item.quantity}</p>
                    </div>
                    <CurrencyPrice amountTry={item.price * item.quantity} variant="compact" />
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-cream/10 pt-4 text-sm">
                <div className="flex justify-between text-cream/70"><span>Ara toplam</span><CurrencyPrice amountTry={subtotal} variant="summary" /></div>
                <div className="flex justify-between text-cream/70"><span>Kargo</span><span>{shipping === 0 ? 'Ücretsiz' : <CurrencyPrice amountTry={shipping} variant="summary" />}</span></div>
                <div className="flex items-end justify-between border-t border-gold/20 pt-4 text-base font-semibold text-cream"><span>Toplam</span><CurrencyPrice amountTry={grandTotal} variant="total" /></div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
