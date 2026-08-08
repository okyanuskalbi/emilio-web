# Emilio Savio e-ticaret gelişim yol haritası

## Kuzey yıldızı

Emilio Savio; sinematik marka dünyasını hızlı ürün keşfi, güven veren ürün detayları ve sürtünmesiz sipariş deneyimiyle birleştiren, mobil öncelikli bir premium mücevher mağazası olmalı.

Başarı yalnızca tasarım kalitesiyle değil şu metriklerle ölçülür:

- Ürün listeleme → ürün detay tıklama oranı
- Ürün detay → sepete ekleme oranı
- Sepet → tamamlanan sipariş oranı
- Mobil LCP, INP ve CLS değerleri
- Arama kullanan ziyaretçilerin dönüşüm oranı
- Tekrar satın alma ve terk edilmiş sepet geri kazanımı
- İade, iptal ve destek talebi oranı

## Sprint 1 — Hız ve dönüşüm temeli

Durum: tamamlandı.

- Scroll-video deneyimini cihaz gücüne göre uyarlamak
- Mobilde ağır frame seek yerine akıcı ambient video/poster kullanmak
- GSAP paketini yalnızca scroll-scrub gerçekten kullanılacaksa yüklemek
- Hero içine görünür koleksiyon CTA'sı ve scroll yönlendirmesi eklemek
- Güven mesajlarını ürünlerden önce göstermek
- Ürün ve kategori görsellerini Next.js Image ile optimize etmek
- Ürün kartlarında ikinci görsel ve gerçek indirim oranı göstermek
- Ürün detayına mobil sticky satın alma çubuğu eklemek
- Navigasyon, sepet ve klavye erişilebilirliğini güçlendirmek
- Özel 404 ve yükleme iskeletleri eklemek

Kabul ölçütleri:

- Mobilde hero scroll sırasında ürün gridinde takılma olmaması
- Ana CTA'nın ilk ekranda görünmesi
- Satın alma düğmesinin mobil ürün detayında her zaman erişilebilir olması
- Klavye ile menü, sepet ve satın alma akışının tamamlanabilmesi
- Lint hatası olmaması ve üretim derlemesinin geçmesi

## Sprint 2 — Ürün keşfi ve kişiselleştirme

- Global ürün araması; isim, malzeme, kategori ve SKU desteği
- Mobil filtre çekmecesi; malzeme, fiyat, stok ve varyasyon filtreleri
- Favoriler ve üyeye bağlı istek listesi
- Son görüntülenen ürünler
- Ürün karşılaştırma ve benzer tasarım önerileri
- Varyasyon bazlı stok/teslimat mesajı
- Koleksiyonlara editoryal hikâye blokları
- Arama sonucu olmayan durumlar için akıllı öneriler

Kabul ölçütleri:

- Arama sonucuna en fazla iki etkileşimde ulaşılması
- Filtrelerin URL ile paylaşılabilmesi
- Favorilerin üyelik hesabıyla cihazlar arasında senkron olması

## Sprint 3 — Gerçek ödeme ve operasyon güvenliği

- PayTR veya iyzico canlı ödeme akışı
- İmzalı webhook doğrulaması ve idempotent sipariş güncellemesi
- Stok rezervasyonu ve eşzamanlı sipariş koruması
- Misafir checkout veya satın alma sonrası hesap oluşturma daveti
- Admin tarafından yönetilen kargo ücreti ve ücretsiz kargo eşiği
- Teslimat tahmini, adres doğrulama ve kargo takip bağlantısı
- İade/iptal talep akışı ve yönetici aksiyon geçmişi
- Sipariş e-postaları ve başarısız ödeme kurtarma

Kabul ölçütleri:

- Aynı webhook'un tekrar gelmesi halinde çift sipariş/ödeme oluşmaması
- Sunucu tarafında ürün fiyatı, stok ve varyasyonun yeniden doğrulanması
- Ödeme başarısız olduğunda sepetin korunması

## Sprint 4 — Güven, sadakat ve tekrar satış

- Canlı veritabanında üyelik/sipariş/yorum migration'ının uygulanması
- Doğrulanmış satın alma yorumları ve müşteri fotoğrafı/video yükleme
- Terk edilmiş sepet otomasyonu
- Stok yenilendi bildirimi ve fiyat düşüşü bildirimi
- Hediye notu, paketleme ve özel gün hatırlatmaları
- Sadakat seviyesi, tavsiye kodu ve kişiye özel teklif
- WhatsApp konuşma kaynağı ve kampanya etiketi takibi

## Sprint 5 — Ölçüm, SEO ve büyüme

- Consent Mode uyumlu analitik olay modeli
- `view_item`, `add_to_cart`, `begin_checkout`, `purchase` olayları
- Core Web Vitals gerçek kullanıcı ölçümü
- Ürün, yorum, breadcrumb ve organizasyon yapılandırılmış verileri
- Dinamik sosyal paylaşım görselleri
- Kontrollü A/B test altyapısı
- Arama terimleri, sıfır sonuçlar ve kategori performans raporu
- Merchant Center ürün feed'i ve kampanya feed'leri

## Görsel sistem

- Ana dünya: kömür siyahı, sıcak krem, düşük doygunluklu altın
- Tipografi: Bodoni Moda başlık, Manrope arayüz ve gövde
- Fotoğraf: siyah zemin, tek yönlü sıcak ışık, metal ve taş dokusunu koruyan yakın planlar
- Hareket: transform/opacity tabanlı, cihaz gücüne uyarlanan ve reduced-motion uyumlu
- Yeni görsel üretimi yalnızca eksik koleksiyon hikâyesi, kampanya veya sosyal medya formatı için yapılır

## Canlıya çıkış engelleri

- `20260807222557_customer_membership_orders_reviews.sql` migration'ı canlı Supabase projesinde uygulanmalı
- PayTR/iyzico demo kayıt akışı canlı ödeme ve webhook ile değiştirilmeden gerçek satış açılmamalı
- Admin servis anahtarı yalnızca sunucuda kalmalı
- Yeni Data API tabloları için gerekli grant ve RLS politikaları doğrulanmalı
- Üretim alan adı, auth callback adresleri, SMTP ve yasal metinler son kez kontrol edilmeli
