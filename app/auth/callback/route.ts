import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabasePublicConfig } from '@/lib/supabase/config'

function safeNextPath(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/account'
}

function authErrorRedirect(request: NextRequest) {
  const redirectUrl = new URL('/account', request.nextUrl.origin)
  redirectUrl.searchParams.set('auth_error', 'google')
  return NextResponse.redirect(redirectUrl)
}

/** Exchanges Supabase's PKCE code and persists the session before redirecting. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return authErrorRedirect(request)

  const redirectUrl = new URL(safeNextPath(request.nextUrl.searchParams.get('next')), request.nextUrl.origin)
  const response = NextResponse.redirect(redirectUrl)
  const { url, publishableKey } = getSupabasePublicConfig()
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return authErrorRedirect(request)

  return response
}
