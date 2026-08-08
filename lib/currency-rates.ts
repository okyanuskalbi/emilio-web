import 'server-only'

import type { CurrencyRateSource, CurrencyRates } from './store-config'

export interface CurrencyRateResult {
  rates: CurrencyRates
  source: Exclude<CurrencyRateSource, 'manual'>
  updatedAt: string
}

function validateRates(rates: CurrencyRates) {
  if (!Number.isFinite(rates.USD) || !Number.isFinite(rates.EUR) || rates.USD <= 0 || rates.EUR <= 0) {
    throw new Error('The currency provider returned invalid USD/EUR rates.')
  }
  return rates
}

export async function fetchCurrencyRates(
  source: Exclude<CurrencyRateSource, 'manual'>,
): Promise<CurrencyRateResult> {
  let rates: CurrencyRates

  if (source === 'frankfurter') {
    const response = await fetch('https://api.frankfurter.dev/v1/latest?base=TRY&symbols=USD,EUR', {
      next: { revalidate: 900 },
    })
    if (!response.ok) throw new Error(`Frankfurter HTTP ${response.status}`)
    const data = await response.json()
    rates = validateRates({ USD: Number(data.rates?.USD), EUR: Number(data.rates?.EUR) })
  } else {
    const response = await fetch('https://open.er-api.com/v6/latest/TRY', {
      next: { revalidate: 900 },
    })
    if (!response.ok) throw new Error(`Open ER API HTTP ${response.status}`)
    const data = await response.json()
    rates = validateRates({ USD: Number(data.rates?.USD), EUR: Number(data.rates?.EUR) })
  }

  return { rates, source, updatedAt: new Date().toISOString() }
}
