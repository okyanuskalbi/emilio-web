# Mimari

## Dizin Yapısı

```
app/
├── page.tsx                    # Homepage (hero + featured + kategori)
├── layout.tsx                  # Navbar + CartDrawer + Footer
├── collections/[slug]/         # Koleksiyon (filtreli grid)
├── products/[slug]/            # Ürün detay (galeri + varyant + gravür)
├── checkout/                   # Ödeme demo (PayTR/iyzico)
├── account/                    # Supabase Auth giriş/kayıt
├── legal/[slug]/               # KVKK + yasal metinler
├── admin/                      # Yönetim paneli
│   ├── page.tsx                #   Dashboard
│   ├── products/               #   Ürün CRUD
│   ├── import/                 #   Excel toplu yükleme
│   └── media/                  #   Drag-drop foto + AI görsel
└── api/atlas/generate/         # Atlas AI görsel üretim route

components/
├── hero/HeroSection.tsx        # GSAP fullscreen hero
├── layout/{Navbar,Footer}.tsx  # Navigasyon (mobil hamburger dahil)
├── cart/CartDrawer.tsx         # Kayan sepet paneli
└── product/                    # ProductCard, CollectionFilter, ProductDetail

lib/
├── supabase.ts                 # Supabase client + tipler
├── queries.ts                  # Katalog veri erişim katmanı
├── cart-store.ts               # Zustand sepet (localStorage persist)
├── atlas.ts                    # Atlas AI yardımcıları
├── paytr.ts / iyzico.ts        # Ödeme token/form üretimi
└── legal-content.ts            # Yasal metin içerikleri
```

## Veri Katmanı (Supabase)

Proje: `emilio` (`zhonnaajslctnvjhhlgc`), org `tcdujkglkyczwglnloxw`, free tier.

### Çekirdek Tablolar
`categories`, `products`, `product_images`, `product_variants`, `orders`, `order_items`, `cart_items`, `wishlist`, `customizations`

### AurezaTouch'tan Taşınan Tablolar
`customers`, `reviews`, `offers` (kupon), `email_templates`, `scheduled_sends`, `email_events`, `analytics_sessions`, `analytics_events`, `store_config`, `blog_posts`, `media_assets`, `failed_payments`

### RLS
- **Public read:** katalog, onaylı yorumlar, aktif kuponlar, yayınlı blog, store_config
- **Kullanıcı bazlı:** siparişler, sepet, favoriler, müşteri kaydı (`auth.uid()`)
- **⚠️ Demo write:** `products`, `categories`, `offers`, `blog`, `media` — üretimde admin rolü ile kısıtlanmalı

### Storage
`product-images` bucket (public) — sürükle-bırak ve AI görsel çıktıları.

## Ödeme Akışı (Demo)

`/checkout` → adres + sağlayıcı seçimi (PayTR/iyzico) → sözleşme onayı → `processing` → `success`.
Gerçek entegrasyonda: `lib/paytr.ts` (iframe token) / `lib/iyzico.ts` (checkout form) → API route → sağlayıcıya yönlendirme → callback → sipariş kaydı.

## AI Görsel Akışı

Admin `/admin/media` → prompt → `POST /api/atlas/generate` → Atlas OpenAI-uyumlu `/v1/images/generations` (`google/nano-banana-2/text-to-image`) → görsel URL. Renk paleti + lüks stil sunucu tarafında prompt'a eklenir.
