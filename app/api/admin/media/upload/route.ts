import { NextRequest, NextResponse } from 'next/server'
import { getAdminIdentity } from '@/lib/auth/admin'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
])
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 30 * 1024 * 1024

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!(await getAdminIdentity())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || !ACCEPTED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'PNG, JPG, WEBP, MP4 veya WebM dosyası gerekli.' }, { status: 400 })
  }

  const isVideo = file.type.startsWith('video/')
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (!file.size || file.size > maxBytes) {
    return NextResponse.json({ error: `Dosya en fazla ${maxBytes / 1024 / 1024} MB olabilir.` }, { status: 400 })
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg')
  const path = `${isVideo ? 'videos' : 'images'}/${crypto.randomUUID()}.${extension}`
  const supabase = createServiceSupabaseClient()
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(path, file, { cacheControl: '31536000', contentType: file.type, upsert: false })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(path)
  const url = publicUrlData.publicUrl
  const { error: assetError } = await supabase.from('media_assets').insert({
    url,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    source: 'upload',
  })
  if (assetError) return NextResponse.json({ error: assetError.message }, { status: 500 })

  return NextResponse.json({ url, name: file.name, type: file.type }, { status: 201 })
}
