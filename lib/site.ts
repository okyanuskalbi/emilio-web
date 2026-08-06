// Merkezi site yapılandırması — SEO/GEO, JSON-LD ve metadata bunu kullanır.

// URL'i güvene al: env "emilio.emreyuksel.com" gibi protokolsüz/boşluklu
// girilse bile geçerli bir mutlak URL üret (new URL() patlamaz).
function normalizeUrl(raw?: string): string {
  const fallback = 'https://emilio.emreyuksel.com'
  const v = (raw || '').trim().replace(/\/+$/, '')
  if (!v) return fallback
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`
  try {
    return new URL(withProto).toString().replace(/\/+$/, '')
  } catch {
    return fallback
  }
}

export const site = {
  name: 'Emilio Savio',
  tagline: 'Change the Story',
  url: normalizeUrl(process.env.NEXT_PUBLIC_APP_URL),
  description:
    'Emilio Savio — Italian-inspired luxury jewelry. Gold, silver, ceramic and diamond bracelets, necklaces, rings and earrings. Personalized engraving and monogram.',
  contactEmail: 'info@emiliosavio.com',
  locale: 'en_US',
  currency: 'TRY',
  social: {
    instagram: 'https://instagram.com/emiliosavio',
    tiktok: '',
    facebook: '',
  },
} as const
