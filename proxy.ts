import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabasePublicConfig } from '@/lib/supabase/config'

/** Refreshes Supabase's cookie session before protected Server Components run. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { url, publishableKey } = getSupabasePublicConfig()

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  if (request.nextUrl.pathname.startsWith('/admin') && !data?.claims?.sub) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/account'
    redirectUrl.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`
    const redirectResponse = NextResponse.redirect(redirectUrl)
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account',
    '/checkout',
    '/api/admin/:path*',
    '/api/account',
    '/api/orders',
    '/api/reviews',
    '/api/cart/sync',
    '/api/atlas/generate',
    '/api/currency/rates',
  ],
}
