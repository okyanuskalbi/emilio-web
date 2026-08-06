// Kategori + hero görselleri üretir → Storage → categories.image_url günceller, hero URL'i yazdırır.
// node --env-file=.env.local scripts/generate-category-hero.mjs
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
const ATLAS_KEY = process.env.ATLAS_API_KEY
const MODEL = process.env.ATLAS_IMAGE_MODEL || 'google/nano-banana-2/text-to-image'

async function atlas(prompt, aspect = '1:1') {
  const res = await fetch('https://api.atlascloud.ai/api/v1/model/generateImage', {
    method: 'POST',
    headers: { Authorization: `Bearer ${ATLAS_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt, aspect_ratio: aspect, enable_sync_mode: true, output_format: 'jpeg' }),
  })
  const j = await res.json()
  const url = j?.data?.outputs?.[0]
  if (!url) throw new Error('no output: ' + JSON.stringify(j).slice(0, 150))
  return url
}

async function upload(imageUrl, path) {
  const img = await fetch(imageUrl)
  const buf = Buffer.from(await img.arrayBuffer())
  const { error } = await supabase.storage.from('product-images').upload(path, buf, { contentType: 'image/jpeg', upsert: true })
  if (error) throw error
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

const CAT_PROMPTS = {
  bracelets: 'elegant model wrist wearing a luxury gold bracelet, close-up',
  necklaces: 'luxury diamond necklace on a model neckline, editorial',
  rings: 'luxury gold signet ring on a hand, macro detail',
  earrings: 'minimal gold earrings on a model ear, close-up',
  custom: 'jeweler engraving a personalized luxury bracelet, artisan detail',
}
const STYLE = ' — luxury jewelry editorial photography, pure black background, warm gold lighting, premium, no text, high detail'

async function main() {
  const { data: cats } = await supabase.from('categories').select('id, name, slug')
  console.log('# Kategori görselleri')
  for (const c of cats) {
    try {
      const p = (CAT_PROMPTS[c.slug] || `${c.name} luxury jewelry`) + STYLE
      const oss = await atlas(p, '3:4')
      const url = await upload(oss, `categories/${c.slug}.jpg`)
      await supabase.from('categories').update({ image_url: url }).eq('id', c.id)
      console.log(`${c.slug}: ${url}`)
    } catch (e) { console.log(`${c.slug}: HATA ${e.message}`) }
  }

  console.log('\n# Hero görseli')
  try {
    const oss = await atlas(
      'cinematic luxury jewelry campaign, elegant woman wearing gold and diamond jewelry, dramatic dark studio, warm gold rim lighting, editorial fashion, sophisticated, no text' + STYLE,
      '16:9'
    )
    const url = await upload(oss, 'hero/home-hero.jpg')
    console.log(`HERO: ${url}`)
  } catch (e) { console.log(`HERO: HATA ${e.message}`) }
  console.log('\nBitti.')
}
main().catch((e) => { console.error(e); process.exit(1) })
