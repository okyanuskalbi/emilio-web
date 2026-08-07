import { NextRequest, NextResponse } from 'next/server'
import { getAdminIdentity } from '@/lib/auth/admin'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

async function ensureAdmin() {
  return Boolean(await getAdminIdentity())
}

export async function GET() {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  const { data, error } = await createServiceSupabaseClient()
    .from('products')
    .select('id, name, material, price, featured, product_images(url, position)')
    .eq('featured', true)
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data || [] })
}

export async function PUT(request: NextRequest) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const rawIds: unknown[] = Array.isArray(body?.ids) ? body.ids : []
  const ids = rawIds.filter((id): id is string => typeof id === 'string')
  if (!ids.length || new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: 'Geçerli ve benzersiz ürün sırası gerekli.' }, { status: 400 })
  }

  const supabase = createServiceSupabaseClient()
  const updates = await Promise.all(
    ids.map((id, index) => supabase.from('products').update({ sort_order: index + 1 }).eq('id', id))
  )
  const error = updates.find((result) => result.error)?.error
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ updated: ids.length })
}
