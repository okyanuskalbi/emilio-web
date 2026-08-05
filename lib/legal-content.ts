export interface LegalDoc {
  slug: string
  title: string
  body: string // markdown-benzeri; \n\n paragraf ayırır, ## başlık
}

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  'mesafeli-satis': {
    slug: 'mesafeli-satis',
    title: 'Mesafeli Satış Sözleşmesi',
    body: `## 1. Taraflar
İşbu sözleşme, SATICI (Emilio Savio) ile ALICI (müşteri) arasında, aşağıda belirtilen hüküm ve şartlar çerçevesinde elektronik ortamda kurulmuştur.

## 2. Konu
İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesinden elektronik ortamda siparişini verdiği ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.

## 3. Ürün Bilgileri
Ürünün türü, miktarı, marka/modeli, satış bedeli ve ödeme şekli, siparişin tamamlandığı andaki bilgilerden oluşur ve sipariş özeti ile ALICI'ya bildirilir.

## 4. Cayma Hakkı
ALICI, ürünü teslim aldığı tarihten itibaren 14 (on dört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Kişiye özel üretilen (gravür/monogram) ürünler cayma hakkı kapsamı dışındadır.

## 5. Genel Hükümler
ALICI, ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini kabul eder.`,
  },
  'gizlilik': {
    slug: 'gizlilik',
    title: 'Gizlilik Politikası & KVKK Aydınlatma Metni',
    body: `## Veri Sorumlusu
Emilio Savio olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlarla işlemekteyiz.

## İşlenen Kişisel Veriler
Ad-soyad, e-posta, telefon, teslimat/fatura adresi, sipariş geçmişi ve ödeme sürecinde gerekli bilgiler.

## İşleme Amaçları
- Siparişlerinizin alınması, hazırlanması ve teslimi
- Ödeme işlemlerinin gerçekleştirilmesi
- Yasal yükümlülüklerin yerine getirilmesi
- Talep ve şikayetlerin yönetimi
- İzin vermeniz halinde pazarlama iletişimi

## Verilerin Aktarılması
Kişisel verileriniz, yalnızca hizmetin ifası için gerekli olduğu ölçüde kargo firmaları ve ödeme kuruluşları (PayTR, iyzico) ile paylaşılır.

## Haklarınız
KVKK m.11 uyarınca; verilerinize erişme, düzeltilmesini/silinmesini isteme, işlemenin sınırlanmasını talep etme haklarına sahipsiniz. Talepleriniz için info@emiliosavio.com adresine başvurabilirsiniz.`,
  },
  'iade-iptal': {
    slug: 'iade-iptal',
    title: 'İade & İptal Koşulları',
    body: `## Cayma / İade Süresi
Teslim aldığınız tarihten itibaren 14 gün içinde ürünü iade edebilirsiniz.

## İade Koşulları
- Ürün kullanılmamış, orijinal ambalajında ve sertifikasıyla birlikte olmalıdır.
- Kişiye özel üretim (gravür/monogram) ürünler iade edilemez.
- İade kargo bedeli, ayıplı ürün hariç, ALICI'ya aittir.

## İade Süreci
1. info@emiliosavio.com adresine sipariş numaranız ile iade talebi gönderin.
2. Onay sonrası ürünü belirtilen adrese kargolayın.
3. Ürün tarafımıza ulaşıp incelendikten sonra 10 iş günü içinde ücret iadesi yapılır.

## Sipariş İptali
Kargoya verilmemiş siparişler için ücretsiz iptal hakkınız bulunmaktadır.`,
  },
  'teslimat': {
    slug: 'teslimat',
    title: 'Teslimat Bilgileri',
    body: `## Kargo Süresi
Siparişleriniz, ödeme onayından sonra 1-3 iş günü içinde kargoya teslim edilir.

## Kargo Ücreti
- 500 ₺ ve üzeri siparişlerde kargo ücretsizdir.
- 500 ₺ altı siparişlerde 49,90 ₺ kargo ücreti uygulanır.

## Teslimat Bölgesi
Türkiye'nin tüm illerine anlaşmalı kargo firmaları ile gönderim yapılmaktadır.

## Sigorta & Paketleme
Tüm ürünler sigortalı olarak, özel hediye kutusunda ve darbeye dayanıklı ambalajla gönderilir.`,
  },
  'cerez': {
    slug: 'cerez',
    title: 'Çerez (Cookie) Politikası',
    body: `## Çerez Nedir?
Çerezler, siteyi ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır.

## Kullandığımız Çerezler
- **Zorunlu çerezler:** Sepet ve oturum yönetimi için gereklidir.
- **Performans çerezleri:** Site kullanımını anlamak ve iyileştirmek için.
- **Pazarlama çerezleri:** İzin vermeniz halinde kişiselleştirilmiş içerik için.

## Çerez Yönetimi
Tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman silebilir veya engelleyebilirsiniz. Zorunlu çerezlerin engellenmesi sitenin bazı işlevlerini etkileyebilir.`,
  },
}

export const LEGAL_SLUGS = Object.keys(LEGAL_DOCS)
