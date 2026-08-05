# Kurulum

## 1. Bağımlılıklar

```bash
npm install
```

## 2. Ortam Değişkenleri (`.env.local`)

```env
# Supabase (emilio projesi)
NEXT_PUBLIC_SUPABASE_URL=https://zhonnaajslctnvjhhlgc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=          # admin server işlemleri için (opsiyonel)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Atlas Cloud AI
ATLAS_API_KEY=apikey-...
ATLAS_BASE_URL=https://api.atlascloud.ai/v1
ATLAS_IMAGE_MODEL=google/nano-banana-2/text-to-image

# PayTR (sandbox)
NEXT_PUBLIC_PAYTR_MERCHANT_ID=
NEXT_PUBLIC_PAYTR_MERCHANT_KEY=

# iyzico (sandbox)
NEXT_PUBLIC_IYZICO_API_KEY=
NEXT_PUBLIC_IYZICO_SECRET_KEY=
```

> ⚠️ `.env.local` **asla** commit edilmez (`.gitignore`'da).

## 3. Veritabanı

Supabase şeması MCP/migration ile kuruldu. Yeniden kurulum gerekirse `supabase/migrations/` altındaki SQL sırayla çalıştırılır:
1. `initial_schema` — çekirdek tablolar
2. `rls_policies` — güvenlik politikaları
3. `seed_data` — 5 kategori + 10 örnek ürün
4. `aureza_features` — yorumlar, kupon, e-posta, analitik, blog...
5. `aureza_rls_seed` — RLS + e-posta şablonları + kuponlar

## 4. Çalıştırma

```bash
npm run dev      # geliştirme (http://localhost:3000)
npm run build    # üretim derlemesi
npm start        # üretim sunucusu
```

## 5. İlk Kullanım

- **Admin panel:** `/admin` — ürün ekle, Excel yükle, foto yükle
- **Excel şablonu:** `/admin/import` → "Şablon İndir"
- **AI görsel:** `/admin/media` → prompt gir → Üret
