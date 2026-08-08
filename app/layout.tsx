import type { Metadata } from "next"
import { Bodoni_Moda, Manrope } from 'next/font/google'
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { CartActivityTracker } from "@/components/cart/CartActivityTracker"
import { Footer } from "@/components/layout/Footer"
import { SiteJsonLd } from "@/components/seo/JsonLd"
import { site } from "@/lib/site"
import { CurrencyProvider } from "@/components/currency/CurrencyProvider"

const displayFont = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Luxury Jewelry | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: ['luxury jewelry', 'gold bracelet', 'diamond necklace', 'silver ring', 'Emilio Savio', 'fine jewelry'],
  applicationName: 'Emilio Savio',
  authors: [{ name: 'Emre Yüksel', url: site.url }],
  creator: 'Emre Yüksel',
  publisher: 'Emilio Savio',
  generator: 'Emre Yüksel — Emilio Savio',
  other: {
    'author': 'Emre Yüksel',
    'designer': 'Emre Yüksel — Emilio Savio',
    'copyright': 'Emilio Savio © Emre Yüksel',
  },
  icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/icon.svg' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    locale: site.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  alternates: { canonical: site.url },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} dark scroll-smooth`}>
      <body className="bg-black text-white antialiased">
        <a href="#main-content" className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-cream px-5 py-3 text-sm font-semibold text-black transition-transform focus:translate-y-0">
          Skip to content
        </a>
        <CurrencyProvider>
          <SiteJsonLd />
          <Navbar />
          <CartDrawer />
          <CartActivityTracker />
          <main id="main-content" tabIndex={-1} className="focus:outline-none">{children}</main>
          <Footer />
        </CurrencyProvider>
      </body>
    </html>
  )
}
