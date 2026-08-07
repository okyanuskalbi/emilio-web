import type { CurrencyCode, CurrencyRates, StoreConfig } from './store-config'

export interface PublicCurrencyConfig {
  currency: CurrencyCode
  rates: CurrencyRates
}

export const DEFAULT_PUBLIC_CURRENCY: PublicCurrencyConfig = {
  currency: 'TRY',
  rates: { USD: 0.025, EUR: 0.023 },
}

export function convertTryAmount(amountTry: number, config: PublicCurrencyConfig): number {
  if (config.currency === 'TRY') return amountTry
  return amountTry * config.rates[config.currency]
}

function currencyFormatOptions(config: PublicCurrencyConfig): Intl.NumberFormatOptions {
  return {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits: config.currency === 'TRY' ? 0 : 2,
  }
}

export function formatCurrency(amountTry: number, config: PublicCurrencyConfig, locale = 'tr-TR'): string {
  return new Intl.NumberFormat(locale, currencyFormatOptions(config)).format(convertTryAmount(amountTry, config))
}

export interface CurrencyDisplayParts {
  formatted: string
  amount: string
  currency: string
}

/**
 * Keeps the locale-aware calculation intact while allowing the UI to give the
 * numeral and currency marker their own visual hierarchy.
 */
export function formatCurrencyParts(
  amountTry: number,
  config: PublicCurrencyConfig,
  locale = 'tr-TR',
): CurrencyDisplayParts {
  const parts = new Intl.NumberFormat(locale, currencyFormatOptions(config)).formatToParts(convertTryAmount(amountTry, config))
  const formatted = parts.map((part) => part.value).join('')
  const amount = parts
    .filter((part) => ['integer', 'group', 'decimal', 'fraction', 'minusSign', 'plusSign'].includes(part.type))
    .map((part) => part.value)
    .join('')
  const currency = parts
    .filter((part) => part.type === 'currency')
    .map((part) => part.value)
    .join('') || config.currency

  return { formatted, amount, currency }
}

export function publicCurrencyConfig(config: StoreConfig): PublicCurrencyConfig {
  return { currency: config.currency, rates: config.currency_rates }
}
