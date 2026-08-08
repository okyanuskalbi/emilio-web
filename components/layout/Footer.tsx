import Link from 'next/link'
import { InstagramIcon, SocialCard } from '@/components/ui/social-card'
import { site } from '@/lib/site'

export function Footer() {
  return (
    <footer className="bg-black border-t border-gold/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-serif font-bold text-gold mb-2">EMILIO SAVIO</h3>
            <p className="text-xs text-cream/50 tracking-widest uppercase">Change the Story</p>
            <div className="mt-6">
              <SocialCard
                socialLinks={[
                  {
                    href: site.social.instagram,
                    icon: <InstagramIcon />,
                    label: 'Follow Emilio Savio on Instagram',
                    position: 'box1',
                  },
                ]}
              />
            </div>
          </div>

          {/* Shop */}
          <div className="order-2 md:order-none">
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-cream/60">
              <li><Link href="/collections/bracelets" className="inline-flex min-h-8 items-center transition-colors hover:text-gold">Bracelets</Link></li>
              <li><Link href="/collections/necklaces" className="inline-flex min-h-8 items-center transition-colors hover:text-gold">Necklaces</Link></li>
              <li><Link href="/collections/rings" className="inline-flex min-h-8 items-center transition-colors hover:text-gold">Rings</Link></li>
              <li><Link href="/collections/earrings" className="inline-flex min-h-8 items-center transition-colors hover:text-gold">Earrings</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="order-4 col-span-2 md:order-none md:col-span-1">
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">Legal</h4>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-1 text-sm text-cream/60 md:block md:space-y-2">
              <li><Link href="/legal/distance-sales" className="inline-flex min-h-9 items-center leading-5 transition-colors hover:text-gold">Distance Sales Agreement</Link></li>
              <li><Link href="/legal/privacy" className="inline-flex min-h-9 items-center leading-5 transition-colors hover:text-gold">Privacy Policy</Link></li>
              <li><Link href="/legal/returns" className="inline-flex min-h-9 items-center leading-5 transition-colors hover:text-gold">Returns & Cancellation</Link></li>
              <li><Link href="/legal/shipping" className="inline-flex min-h-9 items-center leading-5 transition-colors hover:text-gold">Shipping</Link></li>
              <li><Link href="/legal/cookies" className="inline-flex min-h-9 items-center leading-5 transition-colors hover:text-gold">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="order-3 min-w-0 md:order-none">
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-cream/60">
              <li><Link href="/about" className="inline-flex min-h-8 items-center transition-colors hover:text-gold">About Us</Link></li>
              <li><Link href="/faq" className="inline-flex min-h-8 items-center leading-5 transition-colors hover:text-gold">Frequently Asked Questions</Link></li>
              <li><Link href="/contact" className="inline-flex min-h-8 items-center transition-colors hover:text-gold">Contact</Link></li>
              <li><Link href="/account" className="inline-flex min-h-8 items-center transition-colors hover:text-gold">My Account</Link></li>
              <li><a href="mailto:info@emiliosavio.com" className="inline-flex min-h-8 max-w-full items-center whitespace-nowrap text-xs tracking-[-0.02em] transition-colors hover:text-gold min-[360px]:text-sm min-[360px]:tracking-normal">info@emiliosavio.com</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 text-center md:flex-row md:text-left">
          <p className="text-xs leading-5 text-cream/40">
            © {new Date().getFullYear()} Emilio Savio. All rights reserved.
          </p>
          <p className="text-xs leading-5 text-cream/40">
            Secure payment: PayTR & iyzico · 256-bit SSL
          </p>
        </div>
      </div>
    </footer>
  )
}
