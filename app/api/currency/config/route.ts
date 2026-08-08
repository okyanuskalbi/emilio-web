import { NextResponse } from 'next/server'
import { getStoreConfig } from '@/lib/store-config'
import { publicCurrencyConfig } from '@/lib/currency'
import { fetchCurrencyRates } from '@/lib/currency-rates'

export const revalidate = 60

export async function GET() {
  const config = await getStoreConfig()
  const publicConfig = publicCurrencyConfig(config)

  if (config.currency_rate_source !== 'manual') {
    try {
      const latest = await fetchCurrencyRates(config.currency_rate_source)
      publicConfig.rates = latest.rates
    } catch {
      // Stored rates remain a safe fallback if the selected provider is unavailable.
    }
  }

  return NextResponse.json(publicConfig, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
