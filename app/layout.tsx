import type { Metadata } from "next"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "EMILIO SAVIO - Luxury Jewelry",
  description: "Luxury jewelry collection. Change the story.",
  icons: "/favicon.ico",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-black text-white">
        <Navbar />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
