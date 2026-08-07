'use client'

import { useEffect, useState } from 'react'
import type { CurrencyCode, CurrencyRateSource, CurrencyRates } from '@/lib/store-config'
import { DEFAULT_CURRENCY_RATES, normalizeWhatsAppPhone } from '@/lib/store-config'

const SOURCE_LABELS: Record<CurrencyRateSource, string> = {
  manual: 'Manuel kur',
  frankfurter: 'Frankfurter / ECB',
  open_er_api: 'Open ER API',
}

export default function AdminSettingsPage() {
  const [currency, setCurrency] = useState<CurrencyCode>('TRY')
  const [source, setSource] = useState<CurrencyRateSource>('manual')
  const [rates, setRates] = useState<CurrencyRates>(DEFAULT_CURRENCY_RATES)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetch('/api/admin/store-config')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const value = (data?.data || {}) as Record<string, unknown>
        const rawRates = (value.currency_rates || {}) as Partial<CurrencyRates>
        setCurrency(value.currency === 'USD' || value.currency === 'EUR' ? value.currency : 'TRY')
        setSource(value.currency_rate_source === 'frankfurter' || value.currency_rate_source === 'open_er_api' ? value.currency_rate_source : 'manual')
        setRates({ USD: Number(rawRates.USD) || DEFAULT_CURRENCY_RATES.USD, EUR: Number(rawRates.EUR) || DEFAULT_CURRENCY_RATES.EUR })
        setUpdatedAt(typeof value.currency_rates_updated_at === 'string' ? value.currency_rates_updated_at : null)
        setWhatsappPhone(typeof value.whatsapp_phone === 'string' ? value.whatsapp_phone : '')
      })
  }, [])

  const save = async () => {
    if (rates.USD <= 0 || rates.EUR <= 0) {
      setStatus('USD ve EUR kurları sıfırdan büyük olmalı.')
      return
    }
    if (whatsappPhone.trim() && !normalizeWhatsAppPhone(whatsappPhone)) {
      setStatus('WhatsApp numarasını ülke koduyla girin. Örnek: +90 532 000 00 00')
      return
    }
    setStatus('Kaydediliyor...')
    const response = await fetch('/api/admin/store-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currency,
        currency_rate_source: source,
        currency_rates: rates,
        currency_rates_updated_at: updatedAt,
        whatsapp_phone: whatsappPhone,
      }),
    })
    const data = await response.json().catch(() => null)
    if (response.ok) {
      const savedPhone = data?.data?.whatsapp_phone
      if (typeof savedPhone === 'string') setWhatsappPhone(savedPhone)
      setStatus('✓ Mağaza ayarları kaydedildi.')
      return
    }
    setStatus(`Hata: ${data?.error || 'Kaydetme tamamlanamadı.'}`)
  }

  const fetchRates = async () => {
    if (source === 'manual') return
    setStatus('Güncel kurlar alınıyor...')
    const response = await fetch(`/api/currency/rates?source=${source}`)
    const data = await response.json()
    if (!response.ok) {
      setStatus(`Hata: ${data.error || 'Kur alınamadı.'}`)
      return
    }
    setRates(data.rates)
    setUpdatedAt(data.updatedAt)
    setStatus('Kurlar alındı. Kaydet düğmesine basarak yayına alın.')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-serif font-bold text-cream mb-2">Mağaza ayarları</h1>
      <p className="text-cream/60 text-sm mb-8">WhatsApp sipariş hattını, mağaza para birimini ve kur yönetimini tek yerden kontrol edin.</p>

      <section className="border border-gold/20 rounded-lg p-6 space-y-5">
        <div>
          <label htmlFor="whatsapp-phone" className="text-xs uppercase tracking-wider text-cream/60 mb-2 block">WhatsApp sipariş numarası</label>
          <input
            id="whatsapp-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={24}
            value={whatsappPhone}
            onChange={(event) => setWhatsappPhone(event.target.value)}
            placeholder="+90 532 000 00 00"
            className="w-full bg-black border border-cream/20 text-cream px-4 py-3 rounded-md placeholder:text-cream/30 focus:border-gold outline-none"
          />
          <p className="text-xs text-cream/40 mt-2">Ülke koduyla girin. Bu numara tüm ürün detaylarındaki “WhatsApp ile sipariş ver” düğmesinde kullanılır.</p>
        </div>

        <div className="border-t border-cream/10 pt-5">
          <p className="text-xs uppercase tracking-wider text-gold mb-4">Para birimi ve kurlar</p>
          <div>
            <label className="text-xs uppercase tracking-wider text-cream/60 mb-2 block">Mağaza para birimi</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} className="w-full bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none">
              <option value="TRY">Türk lirası (TRY / ₺)</option>
              <option value="USD">Amerikan doları (USD / $)</option>
              <option value="EUR">Euro (EUR / €)</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-cream/60 mb-2 block">Kur kaynağı</label>
            <select value={source} onChange={(e) => setSource(e.target.value as CurrencyRateSource)} className="w-full bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none">
              {(Object.keys(SOURCE_LABELS) as CurrencyRateSource[]).map((key) => <option key={key} value={key}>{SOURCE_LABELS[key]}</option>)}
            </select>
            <p className="text-xs text-cream/40 mt-2">Otomatik kaynak seçerseniz kurlar bu panelden alınır; otomatik olarak satış fiyatını değiştirmez.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['USD', 'EUR'] as const).map((code) => (
              <label key={code} className="text-xs text-cream/60">
                1 TRY = {code}
                <input type="number" min="0" step="0.000001" value={rates[code]} onChange={(e) => setRates((value) => ({ ...value, [code]: Number(e.target.value) }))} disabled={source !== 'manual'} className="mt-2 w-full bg-black border border-cream/20 text-cream px-4 py-3 rounded-md disabled:opacity-40 focus:border-gold outline-none" />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={fetchRates} disabled={source === 'manual'} className="px-5 py-3 border border-gold text-gold rounded-md disabled:opacity-40 hover:bg-gold/10 transition-colors">Kurları getir</button>
            <button onClick={save} className="px-6 py-3 bg-gold text-black font-semibold rounded-md hover:bg-gold/80 transition-colors">Kaydet</button>
            {status && <span className="text-sm text-gold">{status}</span>}
          </div>
          {updatedAt && <p className="text-xs text-cream/40">Son kur güncellemesi: {new Date(updatedAt).toLocaleString('tr-TR')}</p>}
        </div>
      </section>
    </div>
  )
}
