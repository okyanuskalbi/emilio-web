import { supabase } from './supabase'

export interface Promise_ {
  title: string
  desc: string
}

export interface HomeConfig {
  hero_title_line1: string
  hero_title_line2: string
  hero_subtitle: string
  hero_image: string
  hero_video?: string
  featured_title: string
  categories_title: string
  promises: Promise_[]
}

export type CurrencyCode = 'TRY' | 'USD' | 'EUR'
export type CurrencyRateSource = 'manual' | 'frankfurter' | 'open_er_api'

export interface CurrencyRates {
  USD: number
  EUR: number
}

export interface StoreConfig {
  currency: CurrencyCode
  currency_rate_source: CurrencyRateSource
  currency_rates: CurrencyRates
  currency_rates_updated_at: string | null
  whatsapp_phone: string
  free_shipping_threshold: number
  shipping_fee: number
  home: HomeConfig
}

const HERO_DEFAULT = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhonnaajslctnvjhhlgc.supabase.co'}/storage/v1/object/public/product-images/hero/home-hero.jpg`

export const DEFAULT_CURRENCY_RATES: CurrencyRates = { USD: 0.025, EUR: 0.023 }

/** wa.me bağlantısı için telefon numarasını ülke kodlu E.164 rakam biçimine çevirir. */
export function normalizeWhatsAppPhone(value: unknown): string {
  if (typeof value !== 'string') return ''
  const digits = value.replace(/\D/g, '')
  const international = digits.startsWith('00') ? digits.slice(2) : digits
  return /^[1-9]\d{7,14}$/.test(international) ? international : ''
}

// Var olan ortam değişkeni kullanan kurulumlar için başlangıç geri dönüşü.
// Yönetici panelinden bir numara kaydedildiğinde bu değer geçersiz kalır.
export const DEFAULT_WHATSAPP_PHONE = normalizeWhatsAppPhone(
  process.env.WHATSAPP_PHONE || process.env.NEXT_PUBLIC_WHATSAPP_PHONE
)

// Admin boş bıraktığında kullanılan varsayılanlar.
export const DEFAULT_HOME: HomeConfig = {
  hero_title_line1: 'EMILIO',
  hero_title_line2: 'SAVIO',
  hero_subtitle: 'CHANGE THE STORY',
  hero_image: HERO_DEFAULT,
  hero_video: '',
  featured_title: 'Featured Collection',
  categories_title: 'Shop by Category',
  promises: [
    { title: 'Free Shipping', desc: 'On orders over 500 ₺' },
    { title: '14-Day Returns', desc: 'No questions asked' },
    { title: 'Gift Wrapping', desc: 'Complimentary box' },
    { title: 'Personalization', desc: 'Engraving & monogram' },
  ],
}

/** store_config satırını okur, home alanını default'larla birleştirir. */
export async function getStoreConfig(): Promise<StoreConfig> {
  const { data } = await supabase.from('store_config').select('data').eq('id', 1).single()
  const raw = (data?.data as Partial<StoreConfig>) || {}
  const hasStoredWhatsappPhone = typeof raw.whatsapp_phone === 'string'
  return {
    currency: raw.currency === 'USD' || raw.currency === 'EUR' ? raw.currency : 'TRY',
    currency_rate_source:
      raw.currency_rate_source === 'frankfurter' ||
      raw.currency_rate_source === 'open_er_api'
        ? raw.currency_rate_source
        : 'manual',
    currency_rates: {
      ...DEFAULT_CURRENCY_RATES,
      ...(raw.currency_rates || {}),
    },
    currency_rates_updated_at: raw.currency_rates_updated_at || null,
    whatsapp_phone: hasStoredWhatsappPhone
      ? normalizeWhatsAppPhone(raw.whatsapp_phone)
      : DEFAULT_WHATSAPP_PHONE,
    free_shipping_threshold: raw.free_shipping_threshold ?? 500,
    shipping_fee: raw.shipping_fee ?? 49.9,
    home: { ...DEFAULT_HOME, ...(raw.home || {}) },
  }
}
