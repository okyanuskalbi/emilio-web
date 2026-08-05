'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-store'

const NAV_LINKS = [
  { href: '/collections/bracelets', label: 'Bileklikler' },
  { href: '/collections/necklaces', label: 'Kolyeler' },
  { href: '/collections/rings', label: 'Yüzükler' },
  { href: '/collections/earrings', label: 'Küpeler' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const count = useCart((s) => s.count())
  const toggle = useCart((s) => s.toggle)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/95 backdrop-blur-md border-b border-gold/20' : 'bg-transparent'
      }`}
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
        <Link href="/" className="text-2xl font-serif font-bold text-gold hover:text-gold/80 transition-colors md:mr-auto">
          EMILIO SAVIO
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8 mx-auto">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm uppercase tracking-widest text-cream hover:text-gold transition-colors">
              {l.label}
            </Link>
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

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-black z-[80] flex flex-col">
          <div className="flex justify-between items-center px-4 py-4 border-b border-gold/20">
            <span className="text-xl font-serif font-bold text-gold">EMILIO SAVIO</span>
            <button onClick={() => setMenuOpen(false)} className="text-cream text-3xl leading-none">×</button>
          </div>
          <div className="flex flex-col p-6 gap-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-lg uppercase tracking-widest text-cream hover:text-gold"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/account" onClick={() => setMenuOpen(false)} className="text-lg uppercase tracking-widest text-cream hover:text-gold">
              Hesap
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
