'use client'

import Image from 'next/image'
import * as React from 'react'

export type SignInValues = {
  email: string
  password: string
  fullName?: string
}

type SignInMode = 'login' | 'signup'

interface SignIn1Props {
  mode: SignInMode
  loading?: boolean
  error?: string
  onSubmit: (values: SignInValues) => Promise<void> | void
  onModeChange: () => void
  onGoogleSignIn?: () => Promise<void> | void
}

const fieldClassName =
  'w-full rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3.5 text-sm text-cream outline-none transition-[border-color,background-color,box-shadow] placeholder:text-cream/35 focus:border-gold/80 focus:bg-white/[0.1] focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-60'

/**
 * Emilio Savio's reusable sign-in / sign-up surface.
 * Authentication stays in the consuming page so the card is purely presentational
 * while still handling accessible client-side validation and form state.
 */
export function SignIn1({
  mode,
  loading = false,
  error,
  onSubmit,
  onModeChange,
  onGoogleSignIn,
}: SignIn1Props) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [validationError, setValidationError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [googlePending, setGooglePending] = React.useState(false)

  const busy = loading || submitting || googlePending
  const visibleError = validationError || error
  const isSignUp = mode === 'signup'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (isSignUp && !fullName.trim()) {
      setValidationError('Enter your full name to create an account.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setValidationError('Enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setValidationError('Your password must be at least 6 characters.')
      return
    }

    setValidationError('')
    setSubmitting(true)
    try {
      await onSubmit({
        email: normalizedEmail,
        password,
        fullName: isSignUp ? fullName.trim() : undefined,
      })
    } catch {
      setValidationError('We could not complete your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!onGoogleSignIn) return

    setValidationError('')
    setGooglePending(true)
    try {
      await onGoogleSignIn()
    } catch {
      setValidationError('Google sign-in could not be started. Please try again.')
    } finally {
      setGooglePending(false)
    }
  }

  return (
    <main className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#0A0A0A] px-4 pb-8 pt-24 sm:px-6 md:pt-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(201,169,125,0.16),transparent_32%),radial-gradient(circle_at_10%_90%,rgba(245,240,232,0.06),transparent_26%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10" />

      <section aria-labelledby="membership-title" className="w-full max-w-md">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.075] p-5 shadow-[0_32px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-black/30 shadow-[0_12px_32px_rgba(0,0,0,0.26)]">
              <Image src="/logo/emilio-savio.svg" alt="Emilio Savio" width={36} height={36} className="h-9 w-9 object-contain" priority />
            </div>
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Emilio Savio</p>
            <h1 id="membership-title" className="mt-2 font-serif text-3xl font-semibold tracking-tight text-cream sm:text-4xl">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-6 text-cream/60">
              Track orders, review your purchased pieces, and keep your bag synced across devices.
            </p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="mt-7 space-y-4">
            {isSignUp && (
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-cream/75">Full name</span>
                <input
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                  className={fieldClassName}
                  disabled={busy}
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-cream/75">Email</span>
              <input
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={fieldClassName}
                disabled={busy}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-cream/75">Password</span>
              <input
                required
                type="password"
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isSignUp ? 'At least 6 characters' : 'Your password'}
                className={fieldClassName}
                disabled={busy}
              />
            </label>

            {visibleError && <p aria-live="polite" className="rounded-lg border border-red-300/20 bg-red-300/10 px-3 py-2.5 text-sm leading-5 text-red-100">{visibleError}</p>}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center rounded-full bg-gold px-5 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-[#dfc395] focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          {onGoogleSignIn && (
            <>
              <div className="my-6 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-[0.16em] text-cream/35">or</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-black/25 px-5 py-3.5 text-sm font-medium text-cream transition-colors hover:border-gold/50 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-gold/70 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-bold text-[#4285F4]">G</span>
                Continue with Google
              </button>
            </>
          )}

          <div className="mt-6 text-center text-sm text-cream/55">
            {isSignUp ? 'Already have an account?' : 'New to Emilio Savio?'}{' '}
            <button type="button" onClick={onModeChange} disabled={busy} className="font-medium text-gold underline decoration-gold/40 underline-offset-4 transition-colors hover:text-cream disabled:cursor-not-allowed disabled:opacity-60">
              {isSignUp ? 'Sign in' : 'Create an account'}
            </button>
          </div>
        </div>

        <p className="mx-auto mt-5 max-w-sm text-center text-xs leading-5 text-cream/40">
          Your account is a secure space for order tracking and verified product reviews.
        </p>
      </section>
    </main>
  )
}
