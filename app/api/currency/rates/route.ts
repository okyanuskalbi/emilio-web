import { NextRequest, NextResponse } from 'next/server'
import { getAdminIdentity } from '@/lib/auth/admin'
import type { CurrencyRateSource, CurrencyRates } from '@/lib/store-config'

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
    let rates: CurrencyRates = { USD: 0, EUR: 0 }
    if (source === 'frankfurter') {
      const response = await fetch('https://api.frankfurter.app/latest?from=TRY&to=USD,EUR', { next: { revalidate: 900 } })
      const data = await response.json()
      rates = { USD: Number(data.rates?.USD), EUR: Number(data.rates?.EUR) }
    } else if (source === 'open_er_api') {
      const response = await fetch('https://open.er-api.com/v6/latest/TRY', { next: { revalidate: 900 } })
      const data = await response.json()
      rates = { USD: Number(data.rates?.USD), EUR: Number(data.rates?.EUR) }
    }

    if (!Number.isFinite(rates.USD) || !Number.isFinite(rates.EUR) || rates.USD <= 0 || rates.EUR <= 0) {
      return NextResponse.json({ error: 'Kur sağlayıcısından geçerli USD/EUR değeri alınamadı.' }, { status: 502 })
    }

    return NextResponse.json({ rates, updatedAt: new Date().toISOString(), source })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Kur alınamadı.' }, { status: 502 })
  }
}
