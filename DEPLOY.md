# Vercel Deploy

## Adımlar

1. **Vercel'e giriş** — https://vercel.com → GitHub ile giriş
2. **Import Project** — `okyanuskalbi/emilio-web` reposunu seçin
3. **Framework** — Next.js (otomatik algılanır)
4. **Environment Variables** — `.env.local`'daki tüm değişkenleri Vercel panosuna ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ATLAS_API_KEY`, `ATLAS_BASE_URL`, `ATLAS_IMAGE_MODEL`
   - `NEXT_PUBLIC_APP_URL` → `https://<domain>.vercel.app`
   - PayTR / iyzico anahtarları
5. **Deploy** — otomatik build + yayın

## Deploy Sonrası

- `NEXT_PUBLIC_APP_URL` değerini gerçek domain ile güncelleyin (ödeme callback'leri için).
- Supabase → Authentication → URL Configuration → Site URL'e Vercel domain'ini ekleyin.
- Supabase → Storage → `product-images` bucket'ın public olduğunu doğrulayın.

## Domain

Özel domain (ör. `emiliosavio.com`) Vercel → Settings → Domains üzerinden bağlanır. DNS'te A/CNAME kaydı Vercel'e yönlendirilir.

## Üretim Öncesi Kontrol Listesi

- [ ] Demo write RLS politikaları admin rolü ile değiştirildi
- [ ] PayTR/iyzico production anahtarları girildi, `test_mode` kapatıldı
- [ ] Atlas API kotası/faturalandırma doğrulandı
- [ ] KVKK/yasal metinler firma bilgileriyle güncellendi
- [ ] `NEXT_PUBLIC_APP_URL` gerçek domain
