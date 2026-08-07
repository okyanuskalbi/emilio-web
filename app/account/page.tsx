'use client'

import Link from 'next/link'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { CurrencyPrice } from '@/components/currency/CurrencyProvider'
import { SignIn1, type SignInValues } from '@/components/ui/modern-stunning-sign-in'
import { orderStatusLabel } from '@/lib/commerce'
import { supabase } from '@/lib/supabase'

type AccountProfile = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  created_at: string
}

type AccountOrder = {
  id: string
  order_number: string | null
  status: string
  total: number
  currency: string
  shipping_city: string | null
  tracking_provider: string | null
  tracking_number: string | null
  tracking_url: string | null
  created_at: string
  items: Array<{
    id: string
    product_name: string
    product_slug: string
    image_url: string | null
    material: string | null
    variant_details: string | null
    engraving: string | null
    unit_price: number
    quantity: number
  }>
  events: Array<{ id: string; status: string; note: string | null; created_at: string }>
}

type AccountData = {
  profile: AccountProfile
  orders: AccountOrder[]
}

function statusClasses(status: string) {
  const classes: Record<string, string> = {
    pending: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
    confirmed: 'border-blue-300/30 bg-blue-300/10 text-blue-200',
    shipped: 'border-violet-300/30 bg-violet-300/10 text-violet-200',
    delivered: 'border-green-300/30 bg-green-300/10 text-green-200',
    cancelled: 'border-red-300/30 bg-red-300/10 text-red-200',
  }
  return classes[status] || 'border-cream/20 bg-cream/5 text-cream/70'
}

function date(value: string) {
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
}

function getPostAuthPath() {
  const nextPath = new URLSearchParams(window.location.search).get('next')
  return nextPath?.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/account'
}

function AccountPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [account, setAccount] = useState<AccountData | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [authBusy, setAuthBusy] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const authErrorMessage = searchParams.get('auth_error') === 'google'
    ? 'Google ile giriş tamamlanamadı. Lütfen tekrar deneyin.'
    : ''

  const loadAccount = useCallback(async () => {
    const response = await fetch('/api/account')
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      setMessage(data?.error || 'Hesap bilgileri alınamadı.')
      return
    }
    setAccount(data)
    setFullName(data.profile?.full_name || '')
    setPhone(data.profile?.phone || '')
  }, [])

  useEffect(() => {
    let active = true

    const readSession = async () => {
      const { data } = await supabase.auth.getUser()
      if (!active) return
      setUser(data.user)
      if (data.user) await loadAccount()
      if (active) setLoading(false)
    }

    void readSession()
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) void loadAccount()
      else setAccount(null)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [loadAccount])

  const clearAuthError = () => {
    if (!searchParams.has('auth_error')) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete('auth_error')
    router.replace(params.size ? `/account?${params.toString()}` : '/account')
  }

  const handleAuth = async ({ email, password, fullName: signUpFullName }: SignInValues) => {
    clearAuthError()
    setMessage('')
    setAuthBusy(true)

    try {
      if (mode === 'signup') {
        const normalizedName = signUpFullName?.trim()
        if (!normalizedName) {
          setMessage('Üyelik için ad soyad gerekli.')
          return
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: normalizedName.slice(0, 80) },
            emailRedirectTo: `${window.location.origin}/account`,
          },
        })
        setMessage(error ? error.message : 'Üyeliğiniz oluşturuldu. E-posta doğrulama bağlantısını kontrol edin.')
        return
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.message)
        return
      }
      router.replace(getPostAuthPath())
      router.refresh()
    } finally {
      setAuthBusy(false)
    }
  }

  const handleGoogleSignIn = async () => {
    clearAuthError()
    setMessage('')
    setAuthBusy(true)
    try {
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      callbackUrl.searchParams.set('next', getPostAuthPath())
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl.toString() },
      })

      if (error) setMessage(error.message || 'Google ile giriş başlatılamadı.')
    } finally {
      setAuthBusy(false)
    }
  }

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    setSavingProfile(true)
    setMessage('')
    try {
      const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, phone }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setMessage(data?.error || 'Profil güncellenemedi.')
        return
      }
      setAccount((current) => current ? { ...current, profile: data.profile } : current)
      setMessage('Profiliniz güncellendi.')
    } finally {
      setSavingProfile(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAccount(null)
    router.refresh()
  }

  if (loading) {
    return <div className="min-h-screen bg-black pt-32 text-center text-cream/50">Hesabınız hazırlanıyor…</div>
  }

  if (!user) {
    return (
      <SignIn1
        mode={mode}
        loading={authBusy}
        error={message || authErrorMessage}
        onSubmit={handleAuth}
        onGoogleSignIn={handleGoogleSignIn}
        onModeChange={() => {
          setMode((current) => current === 'login' ? 'signup' : 'login')
          clearAuthError()
          setMessage('')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black pb-20 pt-24 md:pt-32">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex flex-col justify-between gap-5 border-b border-gold/20 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Emilio Savio üyeliği</p>
            <h1 className="mt-2 text-3xl font-serif font-bold text-cream md:text-5xl">Merhaba{account?.profile.full_name ? `, ${account.profile.full_name.split(' ')[0]}` : ''}</h1>
            <p className="mt-3 text-sm text-cream/55">Siparişlerinizi, kargo hareketlerinizi ve üyelik bilgilerinizi buradan yönetin.</p>
          </div>
          <button onClick={signOut} className="border border-gold/50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold hover:text-black">Çıkış yap</button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="min-w-0">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gold">Sipariş takibi</p>
                <h2 className="mt-1 text-2xl font-serif font-semibold text-cream">Siparişlerim</h2>
              </div>
              <span className="text-sm text-cream/45">{account?.orders.length || 0} sipariş</span>
            </div>

            {account?.orders.length ? (
              <div className="space-y-4">
                {account.orders.map((order) => (
                  <article key={order.id} className="rounded-2xl border border-gold/20 bg-[#0f0e0c] p-5 shadow-[0_20px_48px_-38px_rgba(0,0,0,0.92)] sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-cream/45">{order.order_number || 'Sipariş'}</p>
                        <h3 className="mt-1 font-serif text-xl font-semibold text-cream">{date(order.created_at)}</h3>
                        {order.shipping_city && <p className="mt-1 text-xs text-cream/50">Teslimat: {order.shipping_city}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusClasses(order.status)}`}>{orderStatusLabel(order.status)}</span>
                        <CurrencyPrice amountTry={Number(order.total)} variant="summary" />
                      </div>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-cream/10 pt-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          {item.image_url ? <img src={item.image_url} alt="" className="h-11 w-11 rounded-md object-cover" /> : <span className="h-11 w-11 rounded-md bg-cream/10" />}
                          <div className="min-w-0 flex-1">
                            <Link href={`/products/${item.product_slug}`} className="block truncate text-cream transition-colors hover:text-gold">{item.product_name}</Link>
                            <p className="truncate text-xs text-cream/45">{[item.variant_details, item.engraving ? `Kazıma: ${item.engraving}` : null].filter(Boolean).join(' · ') || item.material}</p>
                          </div>
                          <span className="text-xs text-cream/55">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.events.length > 0 && (
                      <ol className="mt-5 border-l border-gold/35 pl-4">
                        {order.events.map((event) => (
                          <li key={event.id} className="relative pb-4 last:pb-0">
                            <span className="absolute -left-[1.31rem] top-1 h-2.5 w-2.5 rounded-full border border-gold bg-black" />
                            <p className="text-xs font-medium text-cream">{orderStatusLabel(event.status)}</p>
                            {event.note && <p className="mt-1 text-xs leading-5 text-cream/55">{event.note}</p>}
                            <p className="mt-1 text-[11px] text-cream/35">{date(event.created_at)}</p>
                          </li>
                        ))}
                      </ol>
                    )}

                    {(order.tracking_url || order.tracking_number) && (
                      order.tracking_url ? (
                        <a href={order.tracking_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex border border-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold transition-colors hover:bg-gold hover:text-black">
                          {order.tracking_provider || 'Kargo'} takibi {order.tracking_number ? `· ${order.tracking_number}` : ''}
                        </a>
                      ) : <p className="mt-5 text-xs text-gold">{order.tracking_provider || 'Kargo'} takip no: {order.tracking_number}</p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-cream/15 p-8 text-sm text-cream/55">
                Henüz hesabınıza bağlı bir sipariş yok. İlk siparişinizi verdiğinizde takip ekranı burada görünür.
                <Link href="/" className="ml-2 text-gold underline">Alışverişe dön</Link>
              </div>
            )}
          </section>

          <aside className="h-fit rounded-2xl border border-gold/20 bg-[#0f0e0c] p-5 shadow-[0_20px_48px_-38px_rgba(0,0,0,0.92)]">
            <p className="text-xs uppercase tracking-[0.16em] text-gold">Üyelik bilgileri</p>
            <p className="mt-2 break-all text-sm text-cream/70">{user.email}</p>
            <form onSubmit={saveProfile} className="mt-5 space-y-3">
              <input required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ad soyad"
                className="w-full rounded-xl border border-cream/20 bg-black px-3 py-2.5 text-sm text-cream outline-none focus:border-gold" />
              <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefon"
                className="w-full rounded-xl border border-cream/20 bg-black px-3 py-2.5 text-sm text-cream outline-none focus:border-gold" />
              <button disabled={savingProfile} className="w-full rounded-full border border-gold px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gold transition-colors hover:bg-gold hover:text-black disabled:opacity-50">
                {savingProfile ? 'Kaydediliyor…' : 'Bilgileri kaydet'}
              </button>
            </form>
            <p className="mt-5 text-xs leading-5 text-cream/45">Yalnızca satın aldığınız ürünlere yorum bırakabilirsiniz. Yorumlar yayınlanmadan önce yönetici onayından geçer.</p>
            {message && <p aria-live="polite" className="mt-4 text-xs text-gold">{message}</p>}
          </aside>
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black pt-32 text-center text-cream/50">Hesabınız hazırlanıyor…</div>}>
      <AccountPageContent />
    </Suspense>
  )
}
