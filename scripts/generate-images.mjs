// Atlas ile ürün görselleri üretir → Supabase Storage'a yükler → product_images günceller.
// Çalıştır: node --env-file=.env.local scripts/generate-images.mjs
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const ATLAS_KEY = process.env.ATLAS_API_KEY
const MODEL = process.env.ATLAS_IMAGE_MODEL || 'google/nano-banana-2/text-to-image'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function atlas(prompt, aspect = '1:1') {
  const res = await fetch('https://api.atlascloud.ai/api/v1/model/generateImage', {
    method: 'POST',
    headers: { Authorization: `Bearer ${ATLAS_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL, prompt, aspect_ratio: aspect,
      enable_sync_mode: true, output_format: 'jpeg',
    }),
  })
  const json = await res.json()
  const url = json?.data?.outputs?.[0]
  if (!url) throw new Error('no output: ' + JSON.stringify(json).slice(0, 200))
  return url
}

async function uploadToStorage(imageUrl, path) {
  const img = await fetch(imageUrl)
  const buf = Buffer.from(await img.arrayBuffer())
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, buf, { contentType: 'image/jpeg', upsert: true })
  if (error) throw error
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, material')
    .eq('active', true)
    .order('sort_order')
  if (error) throw error

  console.log(`${products.length} ürün için görsel üretiliyor...\n`)

  for (const p of products) {
    try {
      const prompt =
        `${p.name}, ${p.material} — luxury jewelry product photography, pure black ` +
        `background, warm gold studio lighting, macro detail, editorial, minimal, no text, 4K`
      process.stdout.write(`• ${p.name} ... `)
      const oss = await atlas(prompt)
      const publicUrl = await uploadToStorage(oss, `products/${p.slug}.jpg`)

      // Eski görselleri sil, yenisini ekle
      await supabase.from('product_images').delete().eq('product_id', p.id)
      await supabase.from('product_images').insert({
        product_id: p.id, url: publicUrl, position: 0, alt: p.name,
      })
      console.log('✓')
    } catch (e) {
      console.log('HATA:', e.message)
    }
  }
  console.log('\nBitti.')
}

main().catch((e) => { console.error(e); process.exit(1) })
