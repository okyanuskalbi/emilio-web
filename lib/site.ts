// Merkezi site yapılandırması — SEO/GEO, JSON-LD ve metadata bunu kullanır.
export const site = {
  name: 'Emilio Savio',
  tagline: 'Change the Story',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://emilio-web.vercel.app',
  description:
    'Emilio Savio — İtalyan esintili lüks kuyum. Altın, gümüş, seramik ve pırlanta bileklik, kolye, yüzük ve küpe koleksiyonları. Kişiye özel gravür ve monogram.',
  contactEmail: 'info@emiliosavio.com',
  locale: 'tr_TR',
  currency: 'TRY',
  social: {
    instagram: 'https://instagram.com/emiliosavio',
    tiktok: '',
    facebook: '',
  },
} as const
