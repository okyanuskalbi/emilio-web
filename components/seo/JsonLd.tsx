import { site } from '@/lib/site'

// JSON.stringify `<` kaçırmaz; owner-typed veri olsa da savunma amaçlı kaçırıyoruz.
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

function Script({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  )
}

/** FAQPage — /faq ve ürün SSS bölümlerinde. */
export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }
  return <Script data={data} />
}

/** BreadcrumbList — site hiyerarşisini makinelere gösterir. */
export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${site.url}${it.path}`,
    })),
  }
  return <Script data={data} />
}

/** Site geneli: Organization + WebSite. Root layout'a eklenir. */
export function SiteJsonLd() {
  const logo = `${site.url}/logo/emilio-savio.png`
  const sameAs = [site.social.instagram, site.social.tiktok, site.social.facebook]
    .filter((u) => /^https?:\/\//i.test(u))

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}#organization`,
    name: site.name,
    legalName: site.name,
    url: site.url,
    logo: { '@type': 'ImageObject', url: logo, contentUrl: logo },
    image: logo,
    description: site.description,
    email: site.contactEmail,
    slogan: site.tagline,
    areaServed: [{ '@type': 'Country', name: 'Turkey' }],
    contactPoint: [{
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: site.contactEmail,
      availableLanguage: ['Turkish', 'English'],
    }],
    ...(sameAs.length ? { sameAs } : {}),
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}#website`,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: 'tr',
    publisher: { '@id': `${site.url}#organization` },
  }

  return (
    <>
      <Script data={organization} />
      <Script data={website} />
    </>
  )
}

/** Ürün detay sayfası: Product + Offer (+ opsiyonel aggregateRating). */
export function ProductJsonLd({
  name, slug, description, price, material, images, rating,
}: {
  name: string
  slug: string
  description: string
  price: number
  material: string
  images: string[]
  rating?: { value: number; count: number }
}) {
  const url = `${site.url}/products/${slug}`
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name,
    description: description || `${name} — ${material}`,
    material,
    brand: { '@type': 'Brand', name: site.name },
    manufacturer: { '@id': `${site.url}#organization` },
    image: images.length ? images : [`${site.url}/logo/emilio-savio.png`],
    offers: {
      '@type': 'Offer',
      priceCurrency: site.currency,
      price: price.toFixed(2),
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url,
      seller: { '@id': `${site.url}#organization` },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'TRY' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'TR' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'TR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    ...(rating && rating.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.value,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  }

  return <Script data={productSchema} />
}
