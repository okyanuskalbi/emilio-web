'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

export interface Testimonial {
  id: string
  text: string
  name: string
  role: string
  rating?: number
}

interface TestimonialsColumnProps {
  className?: string
  testimonials: Testimonial[]
  duration?: number
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1))
    .join('')
    .toUpperCase() || 'E'
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="w-full rounded-2xl border border-gold/20 bg-[#111] p-5 shadow-[0_1.1rem_2.6rem_-2rem_rgba(0,0,0,.9)]">
      {testimonial.rating ? (
        <p aria-label={`${testimonial.rating} üzerinden 5 yıldız`} className="mb-3 text-xs tracking-[0.18em] text-gold">
          {'★'.repeat(testimonial.rating)}<span className="text-cream/20">{'★'.repeat(5 - testimonial.rating)}</span>
        </p>
      ) : null}
      <p className="text-sm leading-6 text-cream/80">“{testimonial.text}”</p>
      <div className="mt-5 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-gold/10 text-[11px] font-bold tracking-wide text-gold">
          {initials(testimonial.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-cream">{testimonial.name}</p>
          <p className="truncate text-xs text-cream/50">{testimonial.role}</p>
        </div>
      </div>
    </article>
  )
}

/**
 * A real-data version of the requested testimonial column. It pauses outside
 * the viewport and respects reduced-motion preferences so it does not compete
 * with the main page scroll or hero video.
 */
export function TestimonialsColumn({ className = '', testimonials, duration = 18 }: TestimonialsColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null)
  const visible = useInView(columnRef, { amount: 0.08 })
  const reduceMotion = useReducedMotion()

  if (!testimonials.length) return null

  return (
    <div ref={columnRef} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={false}
        animate={visible && !reduceMotion ? { y: '-50%' } : { y: 0 }}
        transition={visible && !reduceMotion ? {
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        } : { duration: 0.2 }}
        className="flex flex-col will-change-transform"
      >
        <div className="flex flex-col gap-4 pb-4">
          {testimonials.map((testimonial) => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}
        </div>
        <div aria-hidden="true" className="flex flex-col gap-4 pb-4">
          {testimonials.map((testimonial) => <TestimonialCard key={`${testimonial.id}-duplicate`} testimonial={testimonial} />)}
        </div>
      </motion.div>
    </div>
  )
}
