// Mega menü yapısı — kategoriler + materyal alt grupları + öne çıkan görsel.
export interface MenuCategory {
  name: string
  slug: string
  materials: { label: string; slug: string }[]
  featured: { title: string; image: string; href: string }
}

const img = (t: string) =>
  `https://via.placeholder.com/400x500/0A0A0A/C9A97D?text=${encodeURIComponent(t)}`

export const MEGA_MENU: MenuCategory[] = [
  {
    name: 'Bileklikler',
    slug: 'bracelets',
    materials: [
      { label: 'Altın', slug: 'bracelets' },
      { label: 'Gümüş', slug: 'bracelets' },
      { label: 'Seramik', slug: 'bracelets' },
      { label: 'Pırlanta', slug: 'bracelets' },
    ],
    featured: { title: 'Yeni Sezon', image: img('Bileklik'), href: '/collections/bracelets' },
  },
  {
    name: 'Kolyeler',
    slug: 'necklaces',
    materials: [
      { label: 'Altın Zincir', slug: 'necklaces' },
      { label: 'Gümüş Zincir', slug: 'necklaces' },
      { label: 'Pırlanta Kolye', slug: 'necklaces' },
      { label: 'Madalyon', slug: 'necklaces' },
    ],
    featured: { title: 'Öne Çıkanlar', image: img('Kolye'), href: '/collections/necklaces' },
  },
  {
    name: 'Yüzükler',
    slug: 'rings',
    materials: [
      { label: 'Altın', slug: 'rings' },
      { label: 'Gümüş', slug: 'rings' },
      { label: 'Taşlı', slug: 'rings' },
      { label: 'Signet', slug: 'rings' },
    ],
    featured: { title: 'Signet Serisi', image: img('Yüzük'), href: '/collections/rings' },
  },
  {
    name: 'Küpeler',
    slug: 'earrings',
    materials: [
      { label: 'Halka', slug: 'earrings' },
      { label: 'Çivi', slug: 'earrings' },
      { label: 'Sallantılı', slug: 'earrings' },
      { label: 'İnci', slug: 'earrings' },
    ],
    featured: { title: 'Minimal Küpeler', image: img('Küpe'), href: '/collections/earrings' },
  },
]
