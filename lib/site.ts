// Merkezi site yapılandırması — SEO/GEO, JSON-LD ve metadata bunu kullanır.
export const site = {
  name: 'Emilio Savio',
  tagline: 'Change the Story',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://emilio-web.vercel.app',
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
