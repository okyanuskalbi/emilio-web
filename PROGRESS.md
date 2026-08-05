# İlerleme Durumu

> Son güncelleme: 2026-08-05

## ✅ Tamamlanan

| # | İş | Detay |
|---|-----|-------|
| 1 | Proje kurulum | Next.js 15 + TS + Tailwind, GitHub repo |
| 2 | Design system | Siyah/krem/altın, Cormorant + Inter fontlar |
| 3 | Homepage | GSAP hero, featured (DB), kategori grid, marka vaadi |
| 4 | Supabase backend | 9 çekirdek + 12 AurezaTouch tablosu, RLS, seed |
| 5 | Katalog | Koleksiyon (filtre), ürün detay (varyant + gravür) |
| 6 | Sepet | Zustand + localStorage, kayan drawer |
| 7 | Checkout demo | Adres formu, PayTR/iyzico seçimi, sözleşme onayı, başarı ekranı |
| 8 | Hesap | Supabase Auth giriş/kayıt |
| 9 | Admin panel | Dashboard, ürün CRUD, Excel import, drag-drop foto |
| 10 | Atlas AI | `/api/atlas/generate` route + admin arayüzü |
| 11 | Yasal metinler | KVKK, mesafeli satış, iade, teslimat, çerez |
| 12 | Mobil responsive | Hamburger menü, uyarlanabilir grid'ler |
| 13 | Dokümantasyon | README, ARCHITECTURE, SETUP, DEPLOY, PROGRESS |

## 🔶 Kısmen / Demo

- **Ödeme:** Akış demo modunda (gerçek PayTR/iyzico anahtarı bekliyor)
- **Admin güvenlik:** Demo write RLS açık — üretimde auth rolü gerekli
- **Atlas görselleri:** Route hazır, gerçek API yanıtı test edilmeli
- **Ürün görselleri:** Placeholder — Atlas/upload ile değişecek

## ⬜ Bekleyen / Sonraki

- [ ] Gerçek ürün fotoğrafları (Atlas toplu üretim veya upload)
- [ ] Sepet kurtarma e-postası cron (scheduled_sends → Resend/SMTP)
- [ ] Kupon uygulama (checkout'ta offers entegrasyonu)
- [ ] Ürün yorumları frontend (reviews gösterimi + form)
- [ ] Blog sayfaları frontend
- [ ] Sipariş yönetimi (admin sipariş listesi + durum)
- [ ] Analitik tracking script (analytics_events besleme)
- [ ] Vercel production deploy
- [ ] Gerçek logo dosyaları (`public/logo/`)

## Notlar

- Supabase projesi: `emilio` (`zhonnaajslctnvjhhlgc`), free tier, org `tcdujkglkyczwglnloxw`
- Referans siteler scrape edildi: Baraka, Le Gramme, Miansai, David Yurman
- AurezaTouch backend özellikleri taşındı (e-posta, analitik, yorum, kupon, blog, medya)
