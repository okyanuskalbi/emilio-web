# Üyelik, sipariş ve yorum modülü kurulumu

Bu modül aşağıdaki akışı kurar:

1. Üye kayıt olur ve `profiles` kaydı oluşur.
2. Giriş yapan üyenin sepeti güvenli sunucu rotasıyla kaydedilir.
3. Checkout, üyeye bağlı ve takip numaralı bir **bekleyen sipariş** oluşturur.
4. Yönetici siparişi onaylar, kargo bilgisi ve müşteriye görünen durum notu ekler.
5. Müşteri hesabından sipariş zaman çizelgesini takip eder.
6. Satın alma doğrulaması olan üye yorum gönderir; yorum yönetici onayından sonra yayınlanır.

## Canlıya alma

1. Supabase Dashboard içindeki SQL Editor’dan [migration dosyasını](./supabase/migrations/20260807222557_customer_membership_orders_reviews.sql) çalıştırın.
2. Üretim ortamına aşağıdaki gizli değişkenleri ekleyin:

   ```bash
   SUPABASE_SERVICE_ROLE_KEY=...
   ADMIN_EMAILS=yonetici@alanadiniz.com
   ```

   `SUPABASE_SERVICE_ROLE_KEY` yalnızca sunucuda kalmalıdır; `NEXT_PUBLIC_` ile başlayan bir değişkene kesinlikle yazılmamalıdır.

3. Supabase Auth ayarlarında sitenizin alan adını ve `https://alanadiniz.com/account` yönlendirme adresini izinli URL'lere ekleyin.
4. Uygulamayı yeniden deploy edin.

## WhatsApp sipariş hattı

Yönetim panelindeki **Ayarlar** ekranından WhatsApp numarasını ülke koduyla girin (ör. `+90 532 000 00 00`). Kaydedildiğinde her ürün detayındaki **WhatsApp ile sipariş ver** düğmesi bu numaraya yönlenir; ürün, seçili varyasyon ve kazıma notu mesaj taslağına otomatik eklenir.

## Ödeme notu

Mevcut checkout, ödeme sağlayıcısı webhook'u bağlanana kadar siparişi `pending` durumunda kaydeder. Yönetici panelinden `confirmed`, `shipped`, `delivered` veya `cancelled` durumuna geçirilebilir. PayTR/iyzico canlı entegrasyonunda başarılı ödeme webhook'u bu durumu otomatik olarak `confirmed` yapmalıdır.

## Güvenlik modeli

- Müşteri yalnızca kendi profilini ve siparişlerini görebilir.
- Onaylanmamış yorumlar herkese kapalıdır.
- Sepet kayıtları müşteri tarafından doğrudan okunamaz; yalnızca doğrulanmış yönetici ekranında görünür.
- Yönetici yetkisi, tarayıcıdan değiştirilebilen metadata yerine sunucudaki `ADMIN_EMAILS` izin listesiyle kontrol edilir.
