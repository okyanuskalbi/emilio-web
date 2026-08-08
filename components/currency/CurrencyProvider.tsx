'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { DEFAULT_PUBLIC_CURRENCY, formatCurrencyParts, type PublicCurrencyConfig } from '@/lib/currency'
import type { CurrencyCode, CurrencyRates } from '@/lib/store-config'

type ShopperCurrency = Extract<CurrencyCode, 'USD' | 'EUR'>

interface CurrencyContextValue extends PublicCurrencyConfig {
  setCurrency: (currency: ShopperCurrency) => void
}

const CURRENCY_STORAGE_KEY = 'emilio-display-currency-v1'
const currencyListeners = new Set<() => void>()

function isShopperCurrency(value: unknown): value is ShopperCurrency {
  return value === 'USD' || value === 'EUR'
}

function validRates(value: unknown): value is CurrencyRates {
  if (!value || typeof value !== 'object') return false
  const rates = value as Partial<CurrencyRates>
  return Number.isFinite(rates.USD) && Number(rates.USD) > 0 && Number.isFinite(rates.EUR) && Number(rates.EUR) > 0
}

function readStoredCurrency(): ShopperCurrency | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
    return isShopperCurrency(stored) ? stored : null
  } catch {
    return null
  }
}

function getCurrencySnapshot(): ShopperCurrency {
  return readStoredCurrency() || 'USD'
}

function getServerCurrencySnapshot(): ShopperCurrency {
  return 'USD'
}

function subscribeCurrency(listener: () => void) {
  currencyListeners.add(listener)
  return () => currencyListeners.delete(listener)
}

function persistCurrency(currency: ShopperCurrency) {
  try {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
  } catch {
    // The selection still works for the current page when storage is blocked.
  }
  currencyListeners.forEach((listener) => listener())
}

const CurrencyContext = createContext<CurrencyContextValue>({
  ...DEFAULT_PUBLIC_CURRENCY,
  setCurrency: () => undefined,
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const currency = useSyncExternalStore(subscribeCurrency, getCurrencySnapshot, getServerCurrencySnapshot)
  const [rates, setRates] = useState<CurrencyRates>(DEFAULT_PUBLIC_CURRENCY.rates)

  useEffect(() => {
    let cancelled = false

    fetch('/api/currency/config')
      .then((response) => response.ok ? response.json() : null)
      .then((next) => {
        if (cancelled || !next) return
        if (validRates(next.rates)) setRates(next.rates)
        if (!readStoredCurrency() && isShopperCurrency(next.currency)) persistCurrency(next.currency)
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  const setCurrency = useCallback((nextCurrency: ShopperCurrency) => {
    persistCurrency(nextCurrency)
  }, [])

  const value = useMemo<CurrencyContextValue>(() => ({ currency, rates, setCurrency }), [currency, rates, setCurrency])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function CurrencySwitcher({ className = '' }: { className?: string }) {
  const { currency, setCurrency } = useContext(CurrencyContext)

  return (
    <label className={`relative inline-flex h-10 items-center rounded-full border border-cream/15 bg-black/55 text-cream backdrop-blur-sm transition-colors hover:border-gold/55 ${className}`}>
      <span className="sr-only">Display currency</span>
      <select
        value={currency}
        onChange={(event) => {
          if (isShopperCurrency(event.target.value)) setCurrency(event.target.value)
        }}
        aria-label="Display currency"
        className="h-full appearance-none rounded-full bg-transparent py-0 pl-3 pr-7 text-[10px] font-bold uppercase tracking-[0.12em] text-cream outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
      >
        <option className="bg-black text-cream" value="USD">USD</option>
        <option className="bg-black text-cream" value="EUR">EUR</option>
      </select>
      <svg aria-hidden="true" viewBox="0 0 12 12" className="pointer-events-none absolute right-2.5 h-3 w-3 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="m3 4.5 3 3 3-3" />
      </svg>
    </label>
  )
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
