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
      alert('Devam etmek için mesafeli satış sözleşmesini onaylayın.')
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
          <h1 className="text-3xl font-serif font-bold text-cream mb-4">Siparişiniz Alındı</h1>
          <p className="text-cream/60 mb-2">
            {provider === 'paytr' ? 'PayTR' : 'iyzico'} üzerinden ödemeniz başarıyla tamamlandı (DEMO).
          </p>
          <p className="text-cream/40 text-sm mb-8">
            Sipariş onay e-postası {form.email || 'e-posta adresinize'} gönderildi.
          </p>
          <Link href="/" className="inline-block px-8 py-3 bg-gold text-black font-semibold uppercase tracking-widest hover:bg-gold/80">
            Alışverişe Devam Et
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
            {provider === 'paytr' ? 'PayTR' : 'iyzico'} güvenli ödeme sayfasına yönlendiriliyorsunuz...
          </p>
          <p className="text-cream/40 text-xs mt-2">DEMO modu — gerçek ödeme alınmaz</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-black min-h-screen pt-32 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-cream/60 mb-6">Sepetiniz boş.</p>
          <Link href="/" className="px-8 py-3 bg-gold text-black font-semibold uppercase tracking-widest">
            Alışverişe Başla
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-8">Ödeme</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Address */}
            <div className="border border-gold/20 rounded-lg p-6">
              <h2 className="text-lg font-serif font-semibold text-cream mb-4">Teslimat Bilgileri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Ad Soyad" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none md:col-span-2" />
                <input required type="email" placeholder="E-posta" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none" />
                <input required placeholder="Telefon" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none" />
                <input required placeholder="Adres" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none md:col-span-2" />
                <input required placeholder="Şehir" value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none" />
              </div>
            </div>

            {/* Payment method */}
            <div className="border border-gold/20 rounded-lg p-6">
              <h2 className="text-lg font-serif font-semibold text-cream mb-4">Ödeme Yöntemi</h2>
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
                Kredi/banka kartı ile taksit seçenekleri ödeme sayfasında sunulur.
              </p>
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="accent-gold mt-1" />
              <span className="text-sm text-cream/70">
                <Link href="/legal/mesafeli-satis" className="text-gold underline">Mesafeli Satış Sözleşmesi</Link> ve{' '}
                <Link href="/legal/gizlilik" className="text-gold underline">Ön Bilgilendirme Formu</Link>'nu okudum, onaylıyorum.
              </span>
            </label>

            <button type="submit"
              className="w-full py-4 bg-gold text-black font-semibold uppercase tracking-widest hover:bg-gold/80 transition-colors">
              {grandTotal.toLocaleString('tr-TR')} ₺ Öde
            </button>
          </form>

          {/* Order summary */}
          <div className="border border-gold/20 rounded-lg p-6 h-fit">
            <h2 className="text-lg font-serif font-semibold text-cream mb-4">Sipariş Özeti</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3 text-sm">
                  <img src={item.image} alt="" className="w-14 h-14 object-cover rounded" />
                  <div className="flex-1">
                    <p className="text-cream">{item.name}</p>
                    <p className="text-cream/50 text-xs">
                      {item.size && `Beden: ${item.size} · `}Adet: {item.quantity}
                    </p>
                  </div>
                  <p className="text-cream">{(item.price * item.quantity).toLocaleString('tr-TR')} ₺</p>
                </div>
              ))}
            </div>
            <div className="border-t border-cream/10 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-cream/70">
                <span>Ara Toplam</span>
                <span>{total().toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between text-cream/70">
                <span>Kargo</span>
                <span>{shipping === 0 ? 'Ücretsiz' : `${shipping.toLocaleString('tr-TR')} ₺`}</span>
              </div>
              <div className="flex justify-between text-cream font-semibold text-base pt-2 border-t border-cream/10">
                <span>Toplam</span>
                <span>{grandTotal.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
