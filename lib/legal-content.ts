export interface LegalDoc {
  slug: string
  title: string
  body: string // markdown-like; \n\n splits paragraphs, ## heading
}

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  'distance-sales': {
    slug: 'distance-sales',
    title: 'Distance Sales Agreement',
    body: `## 1. Parties
This agreement is concluded electronically between the SELLER (Emilio Savio) and the BUYER (customer) under the terms and conditions set out below.

## 2. Subject
The subject of this agreement is the sale and delivery of the product ordered electronically by the BUYER from the SELLER's website, and the determination of the parties' rights and obligations in accordance with the Consumer Protection Law No. 6502 and the Distance Contracts Regulation of Türkiye.

## 3. Product Information
The type, quantity, brand/model, sale price and payment method of the product consist of the information at the time the order is completed, and are communicated to the BUYER via the order summary.

## 4. Right of Withdrawal
The BUYER has the right to withdraw from the agreement within 14 (fourteen) days from the date of delivery, without giving any reason and without paying any penalty. Made-to-order items (engraving/monogram) are outside the scope of the right of withdrawal.

## 5. General Provisions
The BUYER acknowledges having read and understood the essential characteristics of the product, its sale price, payment method and preliminary delivery information, and having given the necessary confirmation electronically.`,
  },
  'privacy': {
    slug: 'privacy',
    title: 'Privacy Policy & Data Protection',
    body: `## Data Controller
As Emilio Savio, we process your personal data as the data controller under the Personal Data Protection Law ("KVKK") of Türkiye and applicable data protection rules, for the purposes described below.

## Personal Data Processed
Name, email, phone, delivery/billing address, order history and information required during payment.

## Purposes of Processing
- Receiving, preparing and delivering your orders
- Carrying out payment transactions
- Fulfilling legal obligations
- Managing requests and complaints
- Marketing communication, where you have given consent

## Data Sharing
Your personal data is shared only to the extent necessary for the performance of the service, with courier companies and payment institutions (PayTR, iyzico).

## Your Rights
You have the right to access, correct or request deletion of your data, and to request restriction of processing. For your requests, contact info@emiliosavio.com.`,
  },
  'returns': {
    slug: 'returns',
    title: 'Returns & Cancellation',
    body: `## Withdrawal / Return Period
You may return your item within 14 days of the delivery date.

## Return Conditions
- The item must be unused, in its original packaging and with its certificate.
- Personalized (engraving/monogram) items cannot be returned.
- Return shipping cost, except for defective items, belongs to the BUYER.

## Return Process
1. Send a return request with your order number to info@emiliosavio.com.
2. After approval, ship the item to the address provided.
3. Once the item reaches us and is inspected, a refund is issued within 10 business days.

## Order Cancellation
You have the right to cancel, free of charge, orders that have not yet been shipped.`,
  },
  'shipping': {
    slug: 'shipping',
    title: 'Shipping Information',
    body: `## Shipping Time
Your orders are dispatched within 1-3 business days after payment confirmation.

## Shipping Fee
- Shipping is free on orders of 500 ₺ and above.
- A 49.90 ₺ shipping fee applies to orders below 500 ₺.

## Delivery Area
Delivery is made to all provinces of Türkiye via contracted courier companies.

## Insurance & Packaging
All items ship insured, in a special gift box and with shock-resistant packaging.`,
  },
  'cookies': {
    slug: 'cookies',
    title: 'Cookie Policy',
    body: `## What Is a Cookie?
Cookies are small text files saved to your device when you visit the site.

## Cookies We Use
- **Essential cookies:** Required for cart and session management.
- **Performance cookies:** To understand and improve site usage.
- **Marketing cookies:** For personalized content, where you have given consent.

## Managing Cookies
You can delete or block cookies at any time from your browser settings. Blocking essential cookies may affect some functions of the site.`,
  },
}

export const LEGAL_SLUGS = Object.keys(LEGAL_DOCS)
