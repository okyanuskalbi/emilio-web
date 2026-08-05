# EMILIO SAVIO — Lüks Kuyum E-Ticaret

> *Change the Story* — Premium mücevher e-ticaret platformu.

Baraka, Le Gramme, Miansai ve David Yurman referans alınarak tasarlanmış; siyah/krem/altın lüks estetiğe sahip, tam kapsamlı e-ticaret sistemi.

## Özellikler

- 🛍️ **Katalog** — Koleksiyonlar, filtreleme, ürün detay, varyant + gravür/monogram
- 🛒 **Sepet & Ödeme** — Zustand sepet, PayTR + iyzico demo checkout
- 🔐 **Hesap** — Supabase Auth (giriş/kayıt)
- 📊 **Admin Panel** — Excel toplu ürün yükleme, sürükle-bırak foto, ürün CRUD
- ✨ **Atlas AI** — Lüks ürün görseli + video üretimi (nano-banana-2/seedream)
- 📧 **E-posta Otomasyonu** — Sepet kurtarma, sipariş bildirimi (AurezaTouch altyapısı)
- 📈 **Analitik** — Ziyaretçi/oturum/event takibi
- ⭐ **Yorumlar, Kuponlar, Blog** — AurezaTouch'tan taşınan modüller
- ⚖️ **Yasal** — KVKK, mesafeli satış, iade/iptal, teslimat, çerez
- 📱 **Mobil Responsive** — Hamburger menü, uyarlanabilir grid

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Animasyon | GSAP ScrollTrigger, Framer Motion |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Ödeme | PayTR, iyzico |
| AI Görsel | Atlas Cloud AI |
| Deploy | Vercel |

## Hızlı Başlangıç

```bash
npm install
# .env.local dosyasına Supabase + Atlas + ödeme anahtarlarını girin
npm run dev                  # http://localhost:3000
```

Detaylı kurulum için [SETUP.md](./SETUP.md), mimari için [ARCHITECTURE.md](./ARCHITECTURE.md), deploy için [DEPLOY.md](./DEPLOY.md), ilerleme durumu için [PROGRESS.md](./PROGRESS.md).

## Renk Paleti

| Renk | Hex | Kullanım |
|------|-----|----------|
| Siyah | `#0A0A0A` | Ana zemin |
| Krem | `#F5F0E8` | Açık zemin / metin |
| Altın | `#C9A97D` | Vurgu / logo |

---

© Emilio Savio. Tüm hakları saklıdır.
