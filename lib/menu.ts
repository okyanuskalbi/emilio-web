// Mega menü yapısı — kategoriler + materyal alt grupları + öne çıkan görsel.
export interface MenuCategory {
  name: string
  slug: string
  materials: { label: string; slug: string }[]
  featured: { title: string; image: string; href: string }
}

// Mega menü öne çıkan görselleri — Atlas ile üretilip Storage'a yüklenen kategori görselleri.
const STORAGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhonnaajslctnvjhhlgc.supabase.co'}/storage/v1/object/public/product-images/categories`
const img = (slug: string) => `${STORAGE}/${slug}.jpg`

export const MEGA_MENU: MenuCategory[] = [
  {
    name: 'Bracelets',
    slug: 'bracelets',
    materials: [
      { label: 'Gold', slug: 'bracelets' },
      { label: 'Silver', slug: 'bracelets' },
      { label: 'Ceramic', slug: 'bracelets' },
      { label: 'Diamond', slug: 'bracelets' },
    ],
    featured: { title: 'New Season', image: img('bracelets'), href: '/collections/bracelets' },
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    materials: [
      { label: 'Gold Chain', slug: 'necklaces' },
      { label: 'Silver Chain', slug: 'necklaces' },
      { label: 'Diamond Necklace', slug: 'necklaces' },
      { label: 'Medallion', slug: 'necklaces' },
    ],
    featured: { title: 'Featured', image: img('necklaces'), href: '/collections/necklaces' },
  },
  {
    name: 'Rings',
    slug: 'rings',
    materials: [
      { label: 'Gold', slug: 'rings' },
      { label: 'Silver', slug: 'rings' },
      { label: 'Gemstone', slug: 'rings' },
      { label: 'Signet', slug: 'rings' },
    ],
    featured: { title: 'Signet Series', image: img('rings'), href: '/collections/rings' },
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    materials: [
      { label: 'Hoop', slug: 'earrings' },
      { label: 'Stud', slug: 'earrings' },
      { label: 'Drop', slug: 'earrings' },
      { label: 'Pearl', slug: 'earrings' },
    ],
    featured: { title: 'Minimal Earrings', image: img('earrings'), href: '/collections/earrings' },
  },
]
