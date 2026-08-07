import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminIdentity } from '@/lib/auth/admin'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { DEFAULT_WHATSAPP_PHONE, normalizeWhatsAppPhone } from '@/lib/store-config'
import type { CurrencyCode, CurrencyRateSource, CurrencyRates, HomeConfig } from '@/lib/store-config'

type StoreConfigPatch = {
  home?: HomeConfig
  currency?: CurrencyCode
  currency_rate_source?: CurrencyRateSource
  currency_rates?: CurrencyRates
  currency_rates_updated_at?: string | null
  whatsapp_phone?: string
}

async function ensureAdmin() {
  return Boolean(await getAdminIdentity())
}

export async function GET() {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  const { data, error } = await createServiceSupabaseClient()
    .from('store_config')
    .select('data, updated_at')
    .eq('id', 1)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const raw = data?.data && typeof data.data === 'object'
    ? data.data as Record<string, unknown>
    : {}
  const hasStoredWhatsappPhone = typeof raw.whatsapp_phone === 'string'

  return NextResponse.json({
    ...data,
    data: {
      ...raw,
      whatsapp_phone: hasStoredWhatsappPhone
        ? normalizeWhatsAppPhone(raw.whatsapp_phone)
        : DEFAULT_WHATSAPP_PHONE,
    },
  })
}

export async function PATCH(request: NextRequest) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  const patch = await request.json().catch(() => null) as StoreConfigPatch | null
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return NextResponse.json({ error: 'Geçersiz ayar verisi.' }, { status: 400 })
  }

  const supabase = createServiceSupabaseClient()
  const { data: current, error: readError } = await supabase
    .from('store_config')
    .select('data')
    .eq('id', 1)
    .single()
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })

  const previous = current?.data && typeof current.data === 'object' ? current.data : {}
  const next: Record<string, unknown> = { ...previous }

  if (patch.home && typeof patch.home === 'object') next.home = patch.home
  if (patch.currency === 'TRY' || patch.currency === 'USD' || patch.currency === 'EUR') next.currency = patch.currency
  if (patch.currency_rate_source === 'manual' || patch.currency_rate_source === 'frankfurter' || patch.currency_rate_source === 'open_er_api') {
    next.currency_rate_source = patch.currency_rate_source
  }
  if (patch.currency_rates && Number.isFinite(patch.currency_rates.USD) && patch.currency_rates.USD > 0 && Number.isFinite(patch.currency_rates.EUR) && patch.currency_rates.EUR > 0) {
    next.currency_rates = patch.currency_rates
  }
  if (patch.currency_rates_updated_at === null || typeof patch.currency_rates_updated_at === 'string') {
    next.currency_rates_updated_at = patch.currency_rates_updated_at
  }
  if (typeof patch.whatsapp_phone === 'string') {
    const whatsappPhone = normalizeWhatsAppPhone(patch.whatsapp_phone)
    if (patch.whatsapp_phone.trim() && !whatsappPhone) {
      return NextResponse.json(
        { error: 'WhatsApp numarasını ülke koduyla, 8–15 rakam olacak şekilde girin.' },
        { status: 400 }
      )
    }
    next.whatsapp_phone = whatsappPhone
  }

  const { data, error } = await supabase
    .from('store_config')
    .update({ data: next, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select('data, updated_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidatePath('/', 'layout')
  return NextResponse.json(data)
}
