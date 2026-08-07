import { NextRequest, NextResponse } from 'next/server'
import { getAdminIdentity } from '@/lib/auth/admin'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

const MUTABLE_FIELDS = new Set(['featured', 'active'])

async function ensureAdmin() {
  return Boolean(await getAdminIdentity())
}

export async function GET() {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  const { data, error } = await createServiceSupabaseClient()
    .from('products')
    .select('id, name, price, material, featured, active')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data || [] })
}

export async function PATCH(request: NextRequest) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id : ''
  const changes = body?.changes && typeof body.changes === 'object' ? body.changes : null
  const entries = changes
    ? Object.entries(changes).filter(([key, value]) => MUTABLE_FIELDS.has(key) && typeof value === 'boolean')
    : []

  if (!id || entries.length !== 1) {
    return NextResponse.json({ error: 'Geçersiz ürün güncellemesi.' }, { status: 400 })
  }

  const { data, error } = await createServiceSupabaseClient()
    .from('products')
    .update(Object.fromEntries(entries))
    .eq('id', id)
    .select('id, featured, active')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data })
}

export async function DELETE(request: NextRequest) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Ürün kimliği gerekli.' }, { status: 400 })

  const { error } = await createServiceSupabaseClient().from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
