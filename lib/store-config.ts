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

export interface StoreConfig {
  currency: string
  free_shipping_threshold: number
  shipping_fee: number
  home: HomeConfig
}

const HERO_DEFAULT = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhonnaajslctnvjhhlgc.supabase.co'}/storage/v1/object/public/product-images/hero/home-hero.jpg`

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
  return {
    currency: raw.currency || 'TRY',
    free_shipping_threshold: raw.free_shipping_threshold ?? 500,
    shipping_fee: raw.shipping_fee ?? 49.9,
    home: { ...DEFAULT_HOME, ...(raw.home || {}) },
  }
}
