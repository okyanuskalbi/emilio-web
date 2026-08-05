'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Hero title animation
    gsap.from(titleRef.current, {
      opacity: 0,
      y: 100,
      duration: 1.2,
      ease: 'power2.out',
    })

    gsap.from(subtitleRef.current, {
      opacity: 0,
      y: 50,
      duration: 1.2,
      delay: 0.3,
      ease: 'power2.out',
    })

    // Gold particle effect simulation with background gradient
    gsap.to(containerRef.current, {
      backgroundPosition: '200% 200%',
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-gold"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />

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
