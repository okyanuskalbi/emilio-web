import { NextRequest, NextResponse } from 'next/server'
import { getAdminIdentity } from '@/lib/auth/admin'
import { fetchCurrencyRates } from '@/lib/currency-rates'
import type { CurrencyRateSource } from '@/lib/store-config'

const SOURCES: CurrencyRateSource[] = ['frankfurter', 'open_er_api']

export async function GET(request: NextRequest) {
  if (!(await getAdminIdentity())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  const source = request.nextUrl.searchParams.get('source') as CurrencyRateSource | null
  if (!source || !SOURCES.includes(source)) {
    return NextResponse.json({ error: 'Geçerli bir otomatik kur kaynağı seçin.' }, { status: 400 })
  }

  try {
    return NextResponse.json(await fetchCurrencyRates(source as Exclude<CurrencyRateSource, 'manual'>))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Kur alınamadı.' }, { status: 502 })
  }
}
