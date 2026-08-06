import type { Metadata } from "next"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { Footer } from "@/components/layout/Footer"
import { SiteJsonLd } from "@/components/seo/JsonLd"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Lüks Kuyum | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: ['lüks kuyum', 'altın bileklik', 'pırlanta kolye', 'gümüş yüzük', 'Emilio Savio', 'mücevher'],
  applicationName: 'Emilio Projesi',
  authors: [{ name: 'Emre Yüksel', url: site.url }],
  creator: 'Emre Yüksel',
  publisher: 'Emilio Savio',
  generator: 'Emre Yüksel — Emilio Projesi',
  other: {
    'author': 'Emre Yüksel',
    'designer': 'Emre Yüksel — Emilio Projesi',
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
    <html lang="tr" className="dark scroll-smooth">
      <body className="bg-black text-white">
        <SiteJsonLd />
        <Navbar />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
