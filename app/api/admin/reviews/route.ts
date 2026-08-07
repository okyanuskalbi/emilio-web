import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminIdentity } from '@/lib/auth/admin'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

const REVIEW_STATUSES = new Set(['pending', 'approved', 'rejected'])

function note(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 500) : ''
}

export async function GET(request: NextRequest) {
  if (!(await getAdminIdentity())) return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })

  const requestedStatus = request.nextUrl.searchParams.get('status')
  const status = requestedStatus && REVIEW_STATUSES.has(requestedStatus) ? requestedStatus : null
  const supabase = createServiceSupabaseClient()
  let query = supabase
    .from('reviews')
    .select('id, product_id, user_id, order_id, author_name, rating, title, body, status, verified_purchase, admin_note, approved_at, created_at, product:products(name, slug)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (status) query = query.eq('status', status)

  const { data: reviews, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = [...new Set((reviews || []).map((review) => review.user_id).filter(Boolean))]
  const { data: profiles, error: profileError } = userIds.length
    ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [], error: null }
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]))
  return NextResponse.json({
    reviews: (reviews || []).map((review) => ({
      ...review,
      profile: profileById.get(review.user_id) || null,
      product: Array.isArray(review.product) ? review.product[0] || null : review.product || null,
    })),
  })
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdminIdentity()
  if (!admin) return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id : ''
  const status = typeof body?.status === 'string' && REVIEW_STATUSES.has(body.status) ? body.status : null
  if (!id || !status) return NextResponse.json({ error: 'Geçersiz yorum güncellemesi.' }, { status: 400 })

  const supabase = createServiceSupabaseClient()
  const { data: review, error } = await supabase
    .from('reviews')
    .update({
      status,
      admin_note: note(body?.admin_note) || null,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select('id, product:products(slug)')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const product = Array.isArray(review.product) ? review.product[0] : review.product
  revalidatePath('/')
  if (product?.slug) revalidatePath(`/products/${product.slug}`)
  return NextResponse.json({ review })
}
