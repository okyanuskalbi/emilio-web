// AEO-focused FAQ — each answer gives a clear response in the first sentence
// (quotable by answer engines). Used both on /faq and in FAQPage JSON-LD.

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
    title: 'Orders & Payment',
    items: [
      {
        q: 'What payment methods does Emilio Savio accept?',
        a: 'You can pay by credit or debit card through the secure PayTR and iyzico payment infrastructure. Installment options are offered at checkout for eligible cards.',
      },
      {
        q: 'Do you offer installments?',
        a: 'Yes. Installment options for eligible bank credit cards appear automatically at the payment step. The number of installments varies by card and amount.',
      },
      {
        q: 'How do I track my order?',
        a: 'A tracking number is emailed to you after your order is confirmed. You can also view your order status from the Account page.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      {
        q: 'How much is shipping?',
        a: 'Shipping is free on orders of 500 ₺ and above. A flat 49.90 ₺ shipping fee applies to orders below 500 ₺.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Orders are dispatched within 1-3 business days of payment confirmation, and delivery typically takes 1-3 business days. Items ship insured, in a special gift box.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'We currently ship across Türkiye. For international requests, please contact us at info@emiliosavio.com.',
      },
    ],
  },
  {
    title: 'Returns & Exchanges',
    items: [
      {
        q: 'What is your return policy?',
        a: 'You may return your item within 14 days of delivery, no questions asked. The item must be unused, in its original packaging and with its certificate.',
      },
      {
        q: 'Can personalized engraved items be returned?',
        a: 'No. Items personalized with engraving or a monogram are made to order and are therefore outside the scope of the right of withdrawal.',
      },
      {
        q: 'Who pays for return shipping?',
        a: 'For returns other than defective items, return shipping is the responsibility of the buyer. For defective or incorrect items, we cover the return shipping.',
      },
    ],
  },
  {
    title: 'Product & Care',
    items: [
      {
        q: 'Are the products real gold/silver?',
        a: "Each product's material (gold vermeil, sterling silver, ceramic, diamond) is clearly stated on its product page. All items ship with an authenticity certificate.",
      },
      {
        q: 'How do I clean my jewelry?',
        a: 'Wipe gently with a soft cloth and avoid contact with chemicals, perfume and water. For silver pieces we recommend a dedicated silver-care cloth. Store in a closed box when not worn.',
      },
      {
        q: 'How do I choose the right size?',
        a: 'Use the size options on the product page. For bracelets measure your wrist circumference; for rings your finger size. If unsure, ask us at info@emiliosavio.com.',
      },
    ],
  },
  {
    title: 'Personalization',
    items: [
      {
        q: 'Can I add engraving or a monogram to items?',
        a: 'Yes. On eligible items you can add up to 20 characters of text using the "Add engraving / monogram" option on the product page. Personalized production may require 1-2 extra business days.',
      },
      {
        q: 'Does engraving change the delivery time?',
        a: 'Personalized items require an additional 1-2 business days of preparation on top of standard delivery.',
      },
    ],
  },
  {
    title: 'Warranty & Authenticity',
    items: [
      {
        q: 'Do the products have a warranty?',
        a: 'All Emilio Savio products are warranted against manufacturing defects and ship with an authenticity certificate. Contact us for warranty coverage details.',
      },
      {
        q: 'Do you offer gift wrapping?',
        a: 'Yes. Every order ships in a complimentary signature Emilio Savio gift box.',
      },
    ],
  },
]

// Flat list (for schema)
export const FAQ_FLAT: FaqItem[] = FAQ_CATEGORIES.flatMap((c) => c.items)
