'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { useCart } from '@/lib/cart-store'
import { MEGA_MENU } from '@/lib/menu'
import { CurrencySwitcher } from '@/components/currency/CurrencyProvider'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openMega, setOpenMega] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const count = useCart((s) => s.count())
  const toggle = useCart((s) => s.toggle)

  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )
  const visibleCount = mounted ? count : 0

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const next = window.scrollY > 12
      setIsScrolled((current) => current === next ? current : next)
    }
    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const menuButton = menuButtonRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        return
      }
      if (event.key !== 'Tab') return

      const focusable = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      menuButton?.focus()
    }
  }, [menuOpen])

  const solid = isScrolled || openMega !== null

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        solid ? 'bg-black/95 backdrop-blur-md border-b border-gold/20' : 'bg-transparent'
      }`}
      onMouseLeave={() => setOpenMega(null)}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-2 py-4 min-[360px]:px-4 md:px-8">
        {/* Mobile hamburger */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen(true)}
          className="grid h-11 w-11 place-items-center text-cream transition-colors hover:text-gold md:hidden"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <Link href="/" className="whitespace-nowrap font-serif text-[13px] font-bold tracking-[0.03em] text-gold transition-colors hover:text-gold/80 min-[360px]:text-[15px] min-[360px]:tracking-[0.08em] md:mr-auto md:text-2xl md:tracking-wider">
          <span className="flex items-center gap-1.5 md:gap-2">
            <Image src="/logo/emilio-savio.svg" alt="Emilio Savio" width={28} height={28} className="hidden h-6 w-6 min-[360px]:block md:h-7 md:w-7" />
            <span>EMILIO SAVIO</span>
          </span>
        </Link>

        {/* Desktop menu (mega triggers) */}
        <div className="hidden md:flex items-center gap-8 mx-auto">
          {MEGA_MENU.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onMouseEnter={() => setOpenMega(cat.slug)}
              onFocus={() => setOpenMega(cat.slug)}
              aria-expanded={openMega === cat.slug}
              aria-controls={`mega-menu-${cat.slug}`}
              className={`text-sm uppercase tracking-widest transition-colors py-2 ${
                openMega === cat.slug ? 'text-gold' : 'text-cream hover:text-gold'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <CurrencySwitcher />
          <Link href="/account" className="hidden sm:block text-sm uppercase tracking-widest text-cream hover:text-gold transition-colors">
            My Account
          </Link>
          <button
            type="button"
            onClick={() => toggle(true)}
            className="relative grid h-11 w-11 place-items-center text-cream transition-colors hover:text-gold"
            aria-label={visibleCount > 0 ? `Open cart, ${visibleCount} ${visibleCount === 1 ? 'item' : 'items'}` : 'Open cart'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {visibleCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-black w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {visibleCount}
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
            id={`mega-menu-${cat.slug}`}
            onMouseEnter={() => setOpenMega(cat.slug)}
            className={`absolute left-0 right-0 top-full bg-black/98 backdrop-blur-lg border-b border-gold/20 transition-all duration-200 origin-top ${
              openMega === cat.slug
                ? 'opacity-100 visible translate-y-0'
                : 'opacity-0 invisible -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-[1fr_1fr_auto] gap-10">
              {/* Materialler */}
              <div>
                <p className="text-xs text-gold uppercase tracking-widest mb-4">Material</p>
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
                <p className="text-xs text-gold uppercase tracking-widest mb-4">Explore</p>
                <ul className="space-y-3">
                  <li>
                    <Link href={`/collections/${cat.slug}`} onClick={() => setOpenMega(null)} className="text-cream/80 hover:text-gold transition-colors">
                      All {cat.name}
                    </Link>
                  </li>
                  <li><Link href="/faq" onClick={() => setOpenMega(null)} className="text-cream/80 hover:text-gold transition-colors">Size & Care</Link></li>
                  <li><Link href="/about" onClick={() => setOpenMega(null)} className="text-cream/80 hover:text-gold transition-colors">About Us</Link></li>
                </ul>
              </div>

              {/* Öne çıkan görsel */}
              <Link href={cat.featured.href} onClick={() => setOpenMega(null)} className="group relative h-64 w-56 overflow-hidden rounded-lg">
                <Image src={cat.featured.image} alt={cat.featured.title} fill sizes="224px" className="object-cover transition-transform duration-700 group-hover:scale-[1.035]" />
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
        <div
          ref={mobileMenuRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-navigation-title"
          className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-black md:hidden"
        >
          <div className="flex justify-between items-center px-4 py-4 border-b border-gold/20 sticky top-0 bg-black">
            <span id="mobile-navigation-title" className="flex items-center gap-2 text-xl font-serif font-bold text-gold tracking-wider">
              <Image src="/logo/emilio-savio.svg" alt="Emilio Savio" width={28} height={28} className="h-7 w-7" />
              <span>EMILIO SAVIO</span>
            </span>
            <button type="button" autoFocus onClick={() => setMenuOpen(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center text-3xl leading-none text-cream">×</button>
          </div>

          <div className="flex flex-col p-4">
            {MEGA_MENU.map((cat) => (
              <div key={cat.slug} className="border-b border-cream/10">
                <button
                  type="button"
                  onClick={() => setMobileExpanded(mobileExpanded === cat.slug ? null : cat.slug)}
                  aria-expanded={mobileExpanded === cat.slug}
                  className="w-full flex justify-between items-center py-4 text-cream text-lg font-serif"
                >
                  {cat.name}
                  <span className={`text-gold text-xl transition-transform ${mobileExpanded === cat.slug ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${mobileExpanded === cat.slug ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                  <div className="flex flex-col gap-3 pl-4">
                    <Link href={`/collections/${cat.slug}`} onClick={() => setMenuOpen(false)} className="text-gold text-sm uppercase tracking-wider">
                      All {cat.name} →
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
              <Link href="/about" onClick={() => setMenuOpen(false)} className="text-cream/80 uppercase tracking-widest text-sm">About Us</Link>
              <Link href="/faq" onClick={() => setMenuOpen(false)} className="text-cream/80 uppercase tracking-widest text-sm">FAQ</Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="text-cream/80 uppercase tracking-widest text-sm">Contact</Link>
              <Link href="/account" onClick={() => setMenuOpen(false)} className="text-cream/80 uppercase tracking-widest text-sm">My Account</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
