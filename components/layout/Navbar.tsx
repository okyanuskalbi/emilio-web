'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-store'
import { MEGA_MENU } from '@/lib/menu'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openMega, setOpenMega] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const count = useCart((s) => s.count())
  const toggle = useCart((s) => s.toggle)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const solid = isScrolled || openMega !== null

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        solid ? 'bg-black/95 backdrop-blur-md border-b border-gold/20' : 'bg-transparent'
      }`}
      onMouseLeave={() => setOpenMega(null)}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden text-cream hover:text-gold"
          aria-label="Menü"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <Link href="/" className="text-xl md:text-2xl font-serif font-bold text-gold hover:text-gold/80 transition-colors md:mr-auto tracking-wider">
          EMILIO SAVIO
        </Link>

        {/* Desktop menu (mega triggers) */}
        <div className="hidden md:flex items-center gap-8 mx-auto">
          {MEGA_MENU.map((cat) => (
            <button
              key={cat.slug}
              onMouseEnter={() => setOpenMega(cat.slug)}
              className={`text-sm uppercase tracking-widest transition-colors py-2 ${
                openMega === cat.slug ? 'text-gold' : 'text-cream hover:text-gold'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link href="/account" className="hidden sm:block text-sm uppercase tracking-widest text-cream hover:text-gold transition-colors">
            Hesap
          </Link>
          <button onClick={() => toggle(true)} className="relative text-cream hover:text-gold transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {mounted && count > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-black w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop MEGA panel */}
      <div className="hidden md:block">
        {MEGA_MENU.map((cat) => (
          <div
            key={cat.slug}
            onMouseEnter={() => setOpenMega(cat.slug)}
            className={`absolute left-0 right-0 top-full bg-black/98 backdrop-blur-lg border-b border-gold/20 transition-all duration-200 origin-top ${
              openMega === cat.slug
                ? 'opacity-100 visible translate-y-0'
                : 'opacity-0 invisible -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-[1fr_1fr_auto] gap-10">
              {/* Materyaller */}
              <div>
                <p className="text-xs text-gold uppercase tracking-widest mb-4">Materyal</p>
                <ul className="space-y-3">
                  {cat.materials.map((m) => (
                    <li key={m.label}>
                      <Link
                        href={`/collections/${m.slug}`}
                        onClick={() => setOpenMega(null)}
                        className="text-cream/80 hover:text-gold transition-colors text-lg font-serif"
                      >
                        {m.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hızlı linkler */}
              <div>
                <p className="text-xs text-gold uppercase tracking-widest mb-4">Keşfet</p>
                <ul className="space-y-3">
                  <li>
                    <Link href={`/collections/${cat.slug}`} onClick={() => setOpenMega(null)} className="text-cream/80 hover:text-gold transition-colors">
                      Tüm {cat.name}
                    </Link>
                  </li>
                  <li><Link href="/faq" onClick={() => setOpenMega(null)} className="text-cream/80 hover:text-gold transition-colors">Beden & Bakım</Link></li>
                  <li><Link href="/hakkimizda" onClick={() => setOpenMega(null)} className="text-cream/80 hover:text-gold transition-colors">Hakkımızda</Link></li>
                </ul>
              </div>

              {/* Öne çıkan görsel */}
              <Link href={cat.featured.href} onClick={() => setOpenMega(null)} className="group relative w-56 h-64 rounded-lg overflow-hidden">
                <img src={cat.featured.image} alt={cat.featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <span className="text-cream font-serif text-lg">{cat.featured.title}</span>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-black z-[80] flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center px-4 py-4 border-b border-gold/20 sticky top-0 bg-black">
            <span className="text-xl font-serif font-bold text-gold tracking-wider">EMILIO SAVIO</span>
            <button onClick={() => setMenuOpen(false)} className="text-cream text-3xl leading-none">×</button>
          </div>

          <div className="flex flex-col p-4">
            {MEGA_MENU.map((cat) => (
              <div key={cat.slug} className="border-b border-cream/10">
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === cat.slug ? null : cat.slug)}
                  className="w-full flex justify-between items-center py-4 text-cream text-lg font-serif"
                >
                  {cat.name}
                  <span className={`text-gold text-xl transition-transform ${mobileExpanded === cat.slug ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${mobileExpanded === cat.slug ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                  <div className="flex flex-col gap-3 pl-4">
                    <Link href={`/collections/${cat.slug}`} onClick={() => setMenuOpen(false)} className="text-gold text-sm uppercase tracking-wider">
                      Tüm {cat.name} →
                    </Link>
                    {cat.materials.map((m) => (
                      <Link key={m.label} href={`/collections/${m.slug}`} onClick={() => setMenuOpen(false)} className="text-cream/70 hover:text-gold">
                        {m.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-4 mt-6 pt-4">
              <Link href="/hakkimizda" onClick={() => setMenuOpen(false)} className="text-cream/80 uppercase tracking-widest text-sm">Hakkımızda</Link>
              <Link href="/faq" onClick={() => setMenuOpen(false)} className="text-cream/80 uppercase tracking-widest text-sm">SSS</Link>
              <Link href="/iletisim" onClick={() => setMenuOpen(false)} className="text-cream/80 uppercase tracking-widest text-sm">İletişim</Link>
              <Link href="/account" onClick={() => setMenuOpen(false)} className="text-cream/80 uppercase tracking-widest text-sm">Hesap</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
