'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HERO_IMAGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhonnaajslctnvjhhlgc.supabase.co'}/storage/v1/object/public/product-images/hero/home-hero.jpg`

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    gsap.from(titleRef.current, { opacity: 0, y: 100, duration: 1.2, ease: 'power2.out' })
    gsap.from(subtitleRef.current, { opacity: 0, y: 50, duration: 1.2, delay: 0.3, ease: 'power2.out' })

    // Parallax + slow zoom on the hero image while scrolling
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        scale: 1.15,
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-black"
    >
      {/* Hero background image (Atlas generated) */}
      <div
        ref={imageRef}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />

      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black z-0" />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1
          ref={titleRef}
          className="text-7xl md:text-8xl font-serif font-bold text-cream mb-4 tracking-wider"
        >
          EMILIO
          <br />
          SAVIO
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-cream/80 tracking-widest font-light"
        >
          CHANGE THE STORY
        </p>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-gold"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Decorative bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
    </section>
  )
}
