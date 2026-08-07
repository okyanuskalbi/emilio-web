'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_PUBLIC_CURRENCY, formatCurrencyParts, type PublicCurrencyConfig } from '@/lib/currency'

const CurrencyContext = createContext<PublicCurrencyConfig>(DEFAULT_PUBLIC_CURRENCY)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(DEFAULT_PUBLIC_CURRENCY)

  useEffect(() => {
    fetch('/api/currency/config')
      .then((response) => response.ok ? response.json() : null)
      .then((next) => next?.currency && setConfig(next))
      .catch(() => undefined)
  }, [])

  return <CurrencyContext.Provider value={config}>{children}</CurrencyContext.Provider>
}

export type CurrencyPriceVariant = 'inline' | 'compact' | 'card' | 'detail' | 'summary' | 'total' | 'compare'

const priceStyles: Record<CurrencyPriceVariant, { root: string; amount: string; currency: string }> = {
  inline: {
    root: 'gap-1 text-cream',
    amount: 'font-medium',
    currency: 'text-[0.7em] font-semibold tracking-[0.12em] text-gold/80',
  },
  compact: {
    root: 'gap-1 text-cream',
    amount: 'text-sm font-semibold',
    currency: 'text-[0.62em] font-bold tracking-[0.12em] text-gold/80',
  },
  card: {
    root: 'gap-1.5 text-cream',
    amount: 'font-serif text-lg font-semibold tracking-[-0.025em]',
    currency: 'text-[0.62em] font-bold tracking-[0.14em] text-gold/85',
  },
  detail: {
    root: 'gap-2 text-cream',
    amount: 'font-serif text-3xl font-semibold tracking-[-0.035em] md:text-4xl',
    currency: 'text-[0.58em] font-bold tracking-[0.16em] text-gold/90',
  },
  summary: {
    root: 'gap-1.5 text-cream',
    amount: 'font-serif text-lg font-semibold tracking-[-0.02em]',
    currency: 'text-[0.62em] font-bold tracking-[0.13em] text-gold/80',
  },
  total: {
    root: 'gap-2 text-cream',
    amount: 'font-serif text-2xl font-semibold tracking-[-0.03em]',
    currency: 'text-[0.58em] font-bold tracking-[0.16em] text-gold',
  },
  compare: {
    root: 'gap-1 text-cream/42',
    amount: 'text-sm font-medium line-through decoration-cream/35',
    currency: 'text-[0.62em] font-semibold tracking-[0.1em] text-cream/35',
  },
}

interface CurrencyPriceProps {
  amountTry: number
  className?: string
  variant?: CurrencyPriceVariant
}

export function CurrencyPrice({ amountTry, className = '', variant = 'inline' }: CurrencyPriceProps) {
  const config = useContext(CurrencyContext)
  const parts = formatCurrencyParts(amountTry, config)
  const style = priceStyles[variant]

  return (
    <span className={`inline-flex shrink-0 items-baseline whitespace-nowrap tabular-nums ${style.root} ${className}`}>
      <span className="sr-only">{parts.formatted}</span>
      <span aria-hidden="true" className={style.amount}>{parts.amount}</span>
      <span aria-hidden="true" className={style.currency}>{parts.currency}</span>
    </span>
  )
}

interface ProductPriceProps {
  amountTry: number
  compareAmountTry?: number
  className?: string
  variant?: Extract<CurrencyPriceVariant, 'card' | 'detail' | 'summary' | 'total'>
}

/** A single, consistent price hierarchy for product cards and product detail. */
export function ProductPrice({ amountTry, compareAmountTry, className = '', variant = 'card' }: ProductPriceProps) {
  const hasComparison = typeof compareAmountTry === 'number' && Number.isFinite(compareAmountTry) && compareAmountTry > amountTry

  return (
    <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`}>
      <CurrencyPrice amountTry={amountTry} variant={variant} />
      {hasComparison && <CurrencyPrice amountTry={compareAmountTry} variant="compare" />}
    </div>
  )
}
