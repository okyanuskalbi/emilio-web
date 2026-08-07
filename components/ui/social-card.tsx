'use client'

import type { CSSProperties, ReactNode } from 'react'
import styles from './social-card.module.css'

interface SocialLink {
  href: string
  icon: ReactNode
  label: string
  position?: 'box1' | 'box2' | 'box3'
  delay?: string
}

interface SocialCardProps {
  title?: string
  socialLinks: SocialLink[]
  className?: string
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 30 30" aria-hidden="true">
      <path d="M10 3C6.14 3 3 6.14 3 10v10c0 3.86 3.14 7 7 7h10c3.86 0 7-3.14 7-7V10c0-3.86-3.14-7-7-7H10Zm12 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-7 2c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    </svg>
  )
}

export function SocialCard({ title = 'Follow Emilio', socialLinks, className = '' }: SocialCardProps) {
  return (
    <div className={`${styles.card} ${className}`} aria-label={title}>
      <div className={styles.background} />
      <div className={styles.logo}>{title}</div>

      {socialLinks.slice(0, 3).map((link, index) => (
        <a
          key={`${link.href}-${index}`}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.label}
          className={styles.link}
          style={{ '--delay': link.delay || '0s' } as CSSProperties}
        >
          <span className={`${styles.box} ${styles[link.position || `box${index + 1}` as 'box1' | 'box2' | 'box3']}`}>
            <span className={styles.icon}>{link.icon}</span>
          </span>
        </a>
      ))}

      <div className={`${styles.box} ${styles.box4}`} aria-hidden="true" />
    </div>
  )
}

export { InstagramIcon }
