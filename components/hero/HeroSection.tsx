'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const HERO_IMAGE_FALLBACK = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhonnaajslctnvjhhlgc.supabase.co'}/storage/v1/object/public/product-images/hero/home-hero.jpg`
const VIDEO_FRAME_DURATION = 1 / 24

type HeroMotionMode = 'poster' | 'ambient' | 'scrub'

interface NavigatorPerformanceProfile extends Navigator {
  connection?: { saveData?: boolean }
  deviceMemory?: number
}

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
  const [motionMode, setMotionMode] = useState<HeroMotionMode>('poster')
  const heroImage = image || HERO_IMAGE_FALLBACK

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktopScrub = window.matchMedia('(min-width: 900px) and (pointer: fine)')

    const updateMotionMode = () => {
      const profile = navigator as NavigatorPerformanceProfile
      const conserveResources = Boolean(profile.connection?.saveData) || (
        typeof profile.deviceMemory === 'number' && profile.deviceMemory <= 2
      )

      if (!video || reducedMotion.matches || conserveResources) {
        setMotionMode('poster')
        return
      }

      setMotionMode(desktopScrub.matches ? 'scrub' : 'ambient')
    }

    updateMotionMode()
    reducedMotion.addEventListener('change', updateMotionMode)
    desktopScrub.addEventListener('change', updateMotionMode)

    return () => {
      reducedMotion.removeEventListener('change', updateMotionMode)
      desktopScrub.removeEventListener('change', updateMotionMode)
    }
  }, [video])

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (motionMode === 'ambient') {
      videoElement.currentTime = 0
      void videoElement.play().catch(() => undefined)
      return
    }

    videoElement.pause()
  }, [motionMode, videoReady])

  useEffect(() => {
    if (
      motionMode !== 'scrub' ||
      !videoReady ||
      !videoRef.current ||
      !containerRef.current ||
      !visualRef.current
    ) return

    let cancelled = false
    let dispose: (() => void) | undefined

    const setupScrollFilm = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])

      if (cancelled || !videoRef.current || !containerRef.current || !visualRef.current) return

      gsap.registerPlugin(ScrollTrigger)
      const videoElement = videoRef.current
      if (!Number.isFinite(videoElement.duration) || videoElement.duration <= 0) return

      videoElement.pause()
      let queuedTime: number | null = null
      let frameRequest = 0
      let isSeeking = false
      let lastAppliedTime = -VIDEO_FRAME_DURATION

      const queueSeek = () => {
        if (frameRequest || isSeeking) return
        frameRequest = requestAnimationFrame(applyVideoTime)
      }

      const applyVideoTime = () => {
        frameRequest = 0
        if (queuedTime === null || isSeeking) return
        const nextTime = queuedTime
        queuedTime = null

        if (Math.abs(lastAppliedTime - nextTime) < VIDEO_FRAME_DURATION * 0.75) return
        if (videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          queuedTime = nextTime
          return
        }

        isSeeking = true
        lastAppliedTime = nextTime
        try {
          if ('fastSeek' in videoElement && typeof videoElement.fastSeek === 'function') {
            videoElement.fastSeek(nextTime)
          } else {
            videoElement.currentTime = nextTime
          }
        } catch {
          isSeeking = false
        }
      }

      const flushQueuedSeek = () => {
        isSeeking = false
        if (queuedTime !== null) queueSeek()
      }
      const resumeQueuedSeek = () => {
        if (queuedTime !== null) queueSeek()
      }

      videoElement.addEventListener('seeked', flushQueuedSeek)
      videoElement.addEventListener('canplay', resumeQueuedSeek)

      const context = gsap.context(() => {
        const frame = { time: 0 }
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.25,
            invalidateOnRefresh: true,
          },
        })

        timeline
          .to(frame, {
            time: videoElement.duration,
            ease: 'none',
            onUpdate: () => {
              const sourceFrameTime = Math.round(frame.time / VIDEO_FRAME_DURATION) * VIDEO_FRAME_DURATION
              queuedTime = Math.max(0, Math.min(videoElement.duration - VIDEO_FRAME_DURATION, sourceFrameTime))
              queueSeek()
            },
          }, 0)
          .fromTo(
            visualRef.current,
            { rotateX: 6, rotateY: -2, scale: 1.045 },
            { rotateX: -2, rotateY: 1.5, scale: 1, ease: 'none' },
            0,
          )
      }, containerRef)

      dispose = () => {
        if (frameRequest) cancelAnimationFrame(frameRequest)
        videoElement.removeEventListener('seeked', flushQueuedSeek)
        videoElement.removeEventListener('canplay', resumeQueuedSeek)
        context.revert()
      }
    }

    void setupScrollFilm()

    return () => {
      cancelled = true
      dispose?.()
    }
  }, [motionMode, videoReady])

  const showVideo = motionMode !== 'poster' && videoReady

  return (
    <section ref={containerRef} className="relative min-h-[140dvh] bg-black md:min-h-[205dvh] motion-reduce:min-h-[100dvh]">
      <div className="sticky top-0 h-[100dvh] overflow-hidden bg-black [perspective:1600px]">
        <div
          ref={visualRef}
          className="absolute inset-[-4%] transform-gpu [transform-style:preserve-3d]"
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
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
              src={video}
              poster={heroImage}
              muted
              playsInline
              autoPlay={motionMode === 'ambient'}
              loop={motionMode === 'ambient'}
              preload={motionMode === 'scrub' ? 'auto' : 'metadata'}
              aria-label="Emilio Savio campaign film"
              onCanPlay={() => setVideoReady(true)}
            />
          )}
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.66),rgba(10,10,10,.18)_42%,#0A0A0A_100%)]" />

        <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
          <div className="max-w-4xl">
            <Image
              src="/logo/emilio-savio.svg"
              alt="Emilio Savio"
              width={72}
              height={72}
              className="mx-auto mb-7 h-14 w-14 md:h-[72px] md:w-[72px]"
            />
            <h1 className="text-balance text-6xl font-serif font-semibold leading-[0.82] tracking-[0.08em] text-cream sm:text-7xl md:text-8xl">
              {titleLine1}
              <br />
              {titleLine2}
            </h1>
            <p className="mt-6 text-xs font-medium tracking-[0.34em] text-cream/80 sm:text-sm md:text-lg">
              {subtitle}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="#featured-products"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-cream px-7 text-xs font-bold uppercase tracking-[0.16em] text-black transition-[background-color,transform] duration-200 hover:bg-gold active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Explore the collection
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-12 items-center justify-center px-5 text-xs font-semibold uppercase tracking-[0.16em] text-cream/85 underline decoration-gold/60 underline-offset-8 transition-colors hover:text-gold"
              >
                Our story
              </Link>
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[9px] uppercase tracking-[0.24em] text-cream/55">
          <span>Scroll</span>
          <span className="h-9 w-px bg-gradient-to-b from-gold to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      </div>
    </section>
  )
}
