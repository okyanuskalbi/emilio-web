'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HERO_IMAGE_FALLBACK = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhonnaajslctnvjhhlgc.supabase.co'}/storage/v1/object/public/product-images/hero/home-hero.jpg`

interface HeroSectionProps {
  titleLine1?: string
  titleLine2?: string
  subtitle?: string
  image?: string
  video?: string
}

export function HeroSection({
  titleLine1 = 'EMILIO',
  titleLine2 = 'SAVIO',
  subtitle = 'CHANGE THE STORY',
  image,
  video,
}: HeroSectionProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const heroImage = image || HERO_IMAGE_FALLBACK

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!videoReady || !videoRef.current || !containerRef.current || !visualRef.current || media.matches) return

    const videoElement = videoRef.current
    const context = gsap.context(() => {
      const frame = { time: 0 }
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      })

      timeline
        .to(frame, {
          time: videoElement.duration,
          ease: 'none',
          onUpdate: () => { videoElement.currentTime = frame.time },
        }, 0)
        .fromTo(
          visualRef.current,
          { rotateX: 8, rotateY: -3, scale: 1.06 },
          { rotateX: -3, rotateY: 2, scale: 1, ease: 'none' },
          0,
        )
    }, containerRef)

    return () => context.revert()
  }, [videoReady])

  return (
    <section ref={containerRef} className="relative min-h-[220dvh] bg-black">
      <div className="sticky top-0 h-[100dvh] overflow-hidden bg-black [perspective:1600px]">
        <div
          ref={visualRef}
          className="absolute inset-[-5%] transform-gpu [transform-style:preserve-3d]"
        >
          <Image
            src={heroImage}
            alt="Emilio Savio luxury jewelry campaign"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {video && (
            <video
              ref={videoRef}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
              src={video}
              poster={heroImage}
              muted
              playsInline
              preload="metadata"
              aria-label="Emilio Savio campaign film"
              onLoadedMetadata={() => setVideoReady(true)}
            />
          )}
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.58),rgba(10,10,10,.18)_45%,#0A0A0A_100%)]" />

        <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
          <div>
            <Image
              src="/logo/emilio-savio.svg"
              alt="Emilio Savio"
              width={72}
              height={72}
              className="mx-auto mb-7 h-14 w-14 md:h-[72px] md:w-[72px]"
            />
            <h1 className="text-6xl font-serif font-bold tracking-[0.12em] text-cream md:text-8xl">
              {titleLine1}
              <br />
              {titleLine2}
            </h1>
            <p className="mt-5 text-sm font-light tracking-[0.35em] text-cream/80 md:text-xl">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      </div>
    </section>
  )
}
