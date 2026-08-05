'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

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
        {/* Logo */}
        <Link href="/" className="text-2xl font-serif font-bold text-gold hover:text-gold/80 transition-colors">
          E
        </Link>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/collections/bracelets" className="text-sm uppercase tracking-widest text-cream hover:text-gold transition-colors">
            Bracelets
          </Link>
          <Link href="/collections/necklaces" className="text-sm uppercase tracking-widest text-cream hover:text-gold transition-colors">
            Necklaces
          </Link>
          <Link href="/collections/rings" className="text-sm uppercase tracking-widest text-cream hover:text-gold transition-colors">
            Rings
          </Link>
          <Link href="/collections/earrings" className="text-sm uppercase tracking-widest text-cream hover:text-gold transition-colors">
            Earrings
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link href="/account" className="text-sm uppercase tracking-widest text-cream hover:text-gold transition-colors">
            Account
          </Link>
          <Link href="/cart" className="relative text-cream hover:text-gold transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-gold text-black w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
              0
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
