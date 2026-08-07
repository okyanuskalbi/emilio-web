import Link from 'next/link'
import { InstagramIcon, SocialCard } from '@/components/ui/social-card'
import { site } from '@/lib/site'

export function Footer() {
  return (
    <footer className="bg-black border-t border-gold/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
          <div>
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-cream/60">
              <li><Link href="/collections/bracelets" className="hover:text-gold">Bracelets</Link></li>
              <li><Link href="/collections/necklaces" className="hover:text-gold">Necklaces</Link></li>
              <li><Link href="/collections/rings" className="hover:text-gold">Rings</Link></li>
              <li><Link href="/collections/earrings" className="hover:text-gold">Earrings</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-cream/60">
              <li><Link href="/legal/distance-sales" className="hover:text-gold">Distance Sales Agreement</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-gold">Privacy Policy</Link></li>
              <li><Link href="/legal/returns" className="hover:text-gold">Returns & Cancellation</Link></li>
              <li><Link href="/legal/shipping" className="hover:text-gold">Shipping</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-gold">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-cream/60">
              <li><Link href="/about" className="hover:text-gold">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-gold">Frequently Asked Questions</Link></li>
              <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
              <li><Link href="/account" className="hover:text-gold">Hesabım</Link></li>
              <li><a href="mailto:info@emiliosavio.com" className="hover:text-gold">info@emiliosavio.com</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream/40">
            © {new Date().getFullYear()} Emilio Savio. All rights reserved.
          </p>
          <p className="text-xs text-cream/40">
            Secure payment: PayTR & iyzico · 256-bit SSL
          </p>
        </div>
      </div>
    </footer>
  )
}
