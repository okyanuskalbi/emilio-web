import { NextRequest, NextResponse } from 'next/server'

const ATLAS_API_KEY = process.env.ATLAS_API_KEY || process.env.ATLASCLOUD_API_KEY
const ATLAS_BASE = process.env.ATLAS_BASE_URL || 'https://api.atlascloud.ai/v1'
const ATLAS_MODEL = process.env.ATLAS_IMAGE_MODEL || 'google/nano-banana-2/text-to-image'

const STYLE_SUFFIX =
  '. Luxury jewelry product photography, black background, warm gold lighting, ' +
  'minimal Italian editorial style, premium, high detail, 4K.'

export async function POST(req: NextRequest) {
  if (!ATLAS_API_KEY) {
    return NextResponse.json({ error: 'ATLAS_API_KEY yapılandırılmamış' }, { status: 500 })
  }

  try {
    const { prompt } = await req.json()
    if (!prompt) {
      return NextResponse.json({ error: 'prompt gerekli' }, { status: 400 })
    }

    const res = await fetch(`${ATLAS_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ATLAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ATLAS_MODEL,
        prompt: prompt + STYLE_SUFFIX,
        n: 1,
        size: '1024x1024',
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
    // OpenAI-uyumlu yanıt: { data: [{ url } | { b64_json }] }
    const item = data?.data?.[0]
    const url = item?.url || (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null)

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
