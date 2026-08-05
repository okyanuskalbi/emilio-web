// AEO odaklı SSS — her cevap ilk cümlede net yanıt verir (cevap motorları
// için alıntılanabilir). Hem /faq sayfasında hem FAQPage JSON-LD'de kullanılır.

export interface FaqItem {
  q: string
  a: string
}

export interface FaqCategory {
  title: string
  items: FaqItem[]
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: 'Sipariş & Ödeme',
    items: [
      {
        q: 'Emilio Savio hangi ödeme yöntemlerini kabul ediyor?',
        a: 'Kredi ve banka kartıyla, PayTR ve iyzico güvenli ödeme altyapısı üzerinden ödeme yapabilirsiniz. Uygun kartlarda taksit seçenekleri ödeme adımında sunulur.',
      },
      {
        q: 'Taksit imkânı var mı?',
        a: 'Evet. Anlaşmalı bankaların kredi kartlarında taksit seçenekleri ödeme ekranında otomatik görünür. Taksit sayısı karta ve tutara göre değişir.',
      },
      {
        q: 'Siparişimi nasıl takip ederim?',
        a: 'Sipariş onayından sonra kargo takip numarası e-posta ile gönderilir. Hesabım sayfasından da sipariş durumunuzu görebilirsiniz.',
      },
    ],
  },
  {
    title: 'Kargo & Teslimat',
    items: [
      {
        q: 'Kargo ücreti ne kadar?',
        a: '500 ₺ ve üzeri siparişlerde kargo ücretsizdir. 500 ₺ altı siparişlerde 49,90 ₺ sabit kargo ücreti uygulanır.',
      },
      {
        q: 'Siparişim ne kadar sürede elime ulaşır?',
        a: 'Siparişler ödeme onayından sonra 1-3 iş günü içinde kargoya verilir; teslimat genellikle 1-3 iş günü sürer. Ürünler sigortalı ve özel hediye kutusunda gönderilir.',
      },
      {
        q: 'Yurt dışına gönderim yapıyor musunuz?',
        a: 'Şu an Türkiye geneline gönderim yapılmaktadır. Yurt dışı talepleri için info@emiliosavio.com adresinden bize ulaşabilirsiniz.',
      },
    ],
  },
  {
    title: 'İade & Değişim',
    items: [
      {
        q: 'İade koşulları nelerdir?',
        a: 'Ürünü teslim aldığınız tarihten itibaren 14 gün içinde koşulsuz iade edebilirsiniz. Ürün kullanılmamış, orijinal ambalajında ve sertifikasıyla birlikte olmalıdır.',
      },
      {
        q: 'Kişiye özel gravürlü ürünler iade edilebilir mi?',
        a: 'Hayır. Gravür veya monogram ile kişiselleştirilmiş ürünler, size özel üretildiği için cayma hakkı kapsamı dışındadır.',
      },
      {
        q: 'İade kargo ücretini kim öder?',
        a: 'Ayıplı ürün dışındaki iadelerde kargo ücreti alıcıya aittir. Ayıplı/yanlış ürün gönderiminde iade kargo ücreti tarafımıza aittir.',
      },
    ],
  },
  {
    title: 'Ürün & Bakım',
    items: [
      {
        q: 'Ürünler gerçek altın/gümüş mü?',
        a: 'Her ürünün materyali (altın vermeil, sterling gümüş, seramik, pırlanta) ürün sayfasında açıkça belirtilir. Tüm ürünler orijinallik sertifikasıyla gönderilir.',
      },
      {
        q: 'Takılarımı nasıl temizlerim?',
        a: 'Yumuşak bir bezle nazikçe silin; kimyasal, parfüm ve suyla temastan kaçının. Gümüş ürünler için özel gümüş bakım bezi kullanmanızı öneririz. Kullanılmadığında kapalı kutuda saklayın.',
      },
      {
        q: 'Doğru beden/ölçüyü nasıl seçerim?',
        a: 'Ürün sayfasındaki beden seçeneklerini kullanın. Bilekliklerde bilek çevrenizi, yüzüklerde parmak ölçünüzü esas alın. Emin değilseniz info@emiliosavio.com üzerinden yardım isteyebilirsiniz.',
      },
    ],
  },
  {
    title: 'Kişiselleştirme',
    items: [
      {
        q: 'Ürünlere gravür veya monogram yaptırabilir miyim?',
        a: 'Evet. Uygun ürünlerde ürün sayfasındaki "Gravür / Monogram ekle" seçeneğiyle en fazla 20 karakter metin ekleyebilirsiniz. Kişiye özel üretim 1-2 iş günü ek süre gerektirebilir.',
      },
      {
        q: 'Gravürlü ürünün teslim süresi değişir mi?',
        a: 'Kişiselleştirilmiş ürünler, standart teslimata ek olarak 1-2 iş günü daha hazırlık süresi gerektirir.',
      },
    ],
  },
  {
    title: 'Garanti & Orijinallik',
    items: [
      {
        q: 'Ürünlerin garantisi var mı?',
        a: 'Tüm Emilio Savio ürünleri üretim hatalarına karşı garantilidir ve orijinallik sertifikasıyla gönderilir. Garanti kapsamı için bizimle iletişime geçebilirsiniz.',
      },
      {
        q: 'Hediye paketi hizmeti var mı?',
        a: 'Evet. Tüm siparişler ücretsiz özel Emilio Savio hediye kutusunda gönderilir.',
      },
    ],
  },
]

// Düz liste (schema için)
export const FAQ_FLAT: FaqItem[] = FAQ_CATEGORIES.flatMap((c) => c.items)
