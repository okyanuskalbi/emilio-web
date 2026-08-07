'use client'

import type { CSSProperties, ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  width?: string | number
  height?: string | number
  customSize?: boolean
}

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
}

const colorMap = {
  blue: 'border-blue-300/25 hover:border-blue-300/60 hover:shadow-[0_1rem_2.5rem_-1.4rem_rgba(147,197,253,.26)]',
  purple: 'border-purple-300/25 hover:border-purple-300/60 hover:shadow-[0_1rem_2.5rem_-1.4rem_rgba(216,180,254,.26)]',
  green: 'border-green-300/25 hover:border-green-300/60 hover:shadow-[0_1rem_2.5rem_-1.4rem_rgba(134,239,172,.24)]',
  red: 'border-red-300/25 hover:border-red-300/60 hover:shadow-[0_1rem_2.5rem_-1.4rem_rgba(252,165,165,.24)]',
  orange: 'border-orange-300/25 hover:border-orange-300/60 hover:shadow-[0_1rem_2.5rem_-1.4rem_rgba(253,186,116,.24)]',
  gold: 'border-gold/20 hover:border-gold/60 hover:shadow-[0_1rem_2.5rem_-1.4rem_rgba(201,169,125,.22)]',
}

/**
 * A deliberately lightweight replacement for the old document-wide spotlight.
 * It avoids fixed background paints, masks, blurs and one pointer listener per
 * product card, all of which compete with video scrubbing during scroll.
 */
const GlowCard = ({
  children,
  className = '',
  glowColor = 'gold',
  size = 'md',
  width,
  height,
  customSize = false,
}: GlowCardProps) => {
  const style: CSSProperties = {}
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      style={style}
      className={`
        ${customSize ? '' : `${sizeMap[size]} aspect-[3/4]`}
        ${colorMap[glowColor]}
        relative isolate grid grid-rows-[1fr_auto] gap-4 overflow-hidden rounded-2xl border bg-[#101010] p-4
        shadow-[0_1rem_2rem_-1rem_black] transition-[border-color,box-shadow,transform] duration-300
        motion-reduce:transform-none motion-reduce:transition-none hover:-translate-y-0.5
        ${className}
      `}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  )
}

export { GlowCard }
