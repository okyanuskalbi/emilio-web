import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getCustomerIdentity } from '@/lib/auth/user'
import { ensureCustomerProfile } from '@/lib/customer-profile'
import { reviewAuthorName } from '@/lib/commerce'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function safeText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, maxLength) : ''
}

export async function POST(request: NextRequest) {
  const identity = await getCustomerIdentity()
  if (!identity) return NextResponse.json({ error: 'Sign in to write a review.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const productId = safeText(body?.productId, 36)
  const rating = typeof body?.rating === 'number' ? body.rating : Number(body?.rating)
  const title = safeText(body?.title, 120)
  const reviewBody = safeText(body?.body, 1_500)

  if (!UUID_PATTERN.test(productId) || !Number.isInteger(rating) || rating < 1 || rating > 5 || reviewBody.length < 10) {
    return NextResponse.json({ error: 'Add a rating and at least 10 characters to complete your review.' }, { status: 400 })
  }

  try {
    await ensureCustomerProfile(identity)
    const supabase = createServiceSupabaseClient()
    const [{ data: product, error: productError }, { data: profile, error: profileError }] = await Promise.all([
      supabase.from('products').select('id, slug, active').eq('id', productId).single(),
      supabase.from('profiles').select('full_name').eq('id', identity.id).single(),
    ])

    const baseError = productError || profileError
    if (baseError) return NextResponse.json({ error: baseError.message }, { status: 500 })
    if (!product?.active) return NextResponse.json({ error: 'This product is no longer accepting reviews.' }, { status: 409 })

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', identity.id)
      .in('status', ['confirmed', 'shipped', 'delivered'])
      .order('created_at', { ascending: false })

    if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 })
    const orderIds = (orders || []).map((order) => order.id)
    if (!orderIds.length) {
      return NextResponse.json({ error: 'Purchase this product before submitting a review.' }, { status: 403 })
    }

    const [{ data: purchasedLine, error: lineError }, { data: existingReview, error: reviewLookupError }] = await Promise.all([
      supabase
        .from('order_items')
        .select('order_id')
        .in('order_id', orderIds)
        .eq('product_id', productId)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', identity.id)
        .limit(1)
        .maybeSingle(),
    ])

    const lookupError = lineError || reviewLookupError
    if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 })
    if (!purchasedLine) {
      return NextResponse.json({ error: 'You can only review products you have purchased.' }, { status: 403 })
    }
    if (existingReview) {
      return NextResponse.json({ error: 'You have already submitted a review for this product.' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: identity.id,
        order_id: purchasedLine.order_id,
        author_name: reviewAuthorName(profile?.full_name, identity.email),
        rating,
        title: title || null,
        body: reviewBody,
        status: 'pending',
        verified_purchase: true,
      })
      .select('id, status, created_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    revalidatePath(`/products/${product.slug}`)
    return NextResponse.json({ review: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Your review could not be submitted.' },
      { status: 500 },
    )
  }
}
