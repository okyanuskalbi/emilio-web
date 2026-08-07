import { NextResponse } from 'next/server'
import { getStoreConfig } from '@/lib/store-config'
import { publicCurrencyConfig } from '@/lib/currency'

export const revalidate = 60

export async function GET() {
  const config = await getStoreConfig()
  return NextResponse.json(publicCurrencyConfig(config), {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
