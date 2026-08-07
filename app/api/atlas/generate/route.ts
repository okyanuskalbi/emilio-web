import { NextRequest, NextResponse } from 'next/server'
import { getAdminIdentity } from '@/lib/auth/admin'

const ATLAS_API_KEY = process.env.ATLAS_API_KEY || process.env.ATLASCLOUD_API_KEY
const ATLAS_GENERATE = 'https://api.atlascloud.ai/api/v1/model/generateImage'
const ATLAS_MODEL = process.env.ATLAS_IMAGE_MODEL || 'google/nano-banana-2/text-to-image'

export const maxDuration = 120

const STYLE_SUFFIX =
  '. Luxury jewelry product photography, pure black background, warm gold lighting, ' +
  'minimal Italian editorial style, premium, high detail, 4K.'

export async function POST(req: NextRequest) {
  if (!(await getAdminIdentity())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  if (!ATLAS_API_KEY) {
    return NextResponse.json({ error: 'ATLAS_API_KEY yapılandırılmamış' }, { status: 500 })
  }

  try {
    const { prompt, aspect_ratio = '1:1' } = await req.json()
    if (!prompt) {
      return NextResponse.json({ error: 'prompt gerekli' }, { status: 400 })
    }

    // Atlas async model API; enable_sync_mode ile sonucu tek çağrıda alırız.
    const res = await fetch(ATLAS_GENERATE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ATLAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ATLAS_MODEL,
        prompt: prompt + STYLE_SUFFIX,
        aspect_ratio,
        enable_sync_mode: true,
        output_format: 'jpeg',
      }),
    })

    const text = await res.text()
    if (!res.ok) {
      return NextResponse.json(
        { error: `Atlas API ${res.status}`, detail: text.slice(0, 300) },
        { status: 502 }
      )
    }

    const data = JSON.parse(text)
    const url = data?.data?.outputs?.[0] || null

    if (!url) {
      return NextResponse.json({ error: 'Görsel URL alınamadı', raw: data }, { status: 502 })
    }

    return NextResponse.json({ url })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'bilinmeyen hata' },
      { status: 500 }
    )
  }
}
