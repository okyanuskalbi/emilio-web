'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProductReview } from '@/lib/queries'

interface ProductReviewsProps {
  productId: string
  productSlug: string
  productName: string
  reviews: ProductReview[]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
}

function Stars({ rating, muted = false }: { rating: number; muted?: boolean }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} className={`text-sm tracking-[0.16em] ${muted ? 'text-cream/25' : 'text-gold'}`}>
      {'★'.repeat(rating)}{!muted && <span className="text-cream/20">{'★'.repeat(5 - rating)}</span>}
    </span>
  )
}

export function ProductReviews({ productId, productSlug, productName, reviews }: ProductReviewsProps) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.user))
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setSignedIn(Boolean(session?.user))
    })
    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title, body }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setStatus(data?.error || 'Your review could not be submitted.')
        return
      }
      setBody('')
      setTitle('')
      setShowForm(false)
      setStatus('Thank you. Your review will be published after moderation.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-20 border-t border-gold/20 pt-12 md:pt-16" aria-labelledby="reviews-heading">
      <div className="flex flex-col gap-5 border-b border-cream/10 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Client experiences</p>
          <h2 id="reviews-heading" className="mt-2 text-3xl font-serif font-bold text-cream md:text-4xl">Reviews for {productName}</h2>
          <p className="mt-2 text-sm text-cream/55">Only reviews from members with a verified purchase are published.</p>
        </div>
        {signedIn === false ? (
          <Link
            href={`/account?next=${encodeURIComponent(`/products/${productSlug}`)}`}
            className="inline-flex justify-center rounded-full border border-gold px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold hover:text-black"
          >
            Sign in to write a review
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="rounded-full border border-gold px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold hover:text-black"
          >
            {showForm ? 'Close form' : 'Write a review'}
          </button>
        )}
      </div>

      {showForm && signedIn && (
        <form onSubmit={submit} className="mt-7 rounded-2xl border border-gold/25 bg-[#0f0e0c] p-5 shadow-[0_20px_48px_-38px_rgba(0,0,0,0.92)] md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm text-cream/70">Your rating</span>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
                aria-pressed={rating === value}
                className="p-1"
              >
                <span className={`text-lg ${value <= rating ? 'text-gold' : 'text-cream/25'}`}>★</span>
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-4">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="Short title (optional)"
              className="w-full rounded-xl border border-cream/20 bg-black px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-cream/35 focus:border-gold"
            />
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              minLength={10}
              maxLength={1500}
              required
              rows={5}
              placeholder="Share your experience with this piece…"
              className="w-full resize-y rounded-xl border border-cream/20 bg-black px-4 py-3 text-sm leading-6 text-cream outline-none transition-colors placeholder:text-cream/35 focus:border-gold"
            />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button disabled={submitting} className="rounded-full bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-gold/85 disabled:cursor-wait disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit for approval'}
            </button>
            <p className="text-xs text-cream/45">Every review is moderated before it appears.</p>
          </div>
        </form>
      )}

      {status && <p aria-live="polite" className="mt-5 text-sm text-gold">{status}</p>}

      {reviews.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-cream/10 bg-[#0f0e0c] p-5 shadow-[0_18px_46px_-34px_rgba(0,0,0,0.95)]">
              <div className="flex items-start justify-between gap-4">
                <Stars rating={review.rating} />
                {review.verified_purchase && <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-gold">Verified purchase</span>}
              </div>
              {review.title && <h3 className="mt-4 font-serif text-lg font-semibold text-cream">{review.title}</h3>}
              <p className="mt-3 text-sm leading-6 text-cream/70">{review.body}</p>
              <div className="mt-5 border-t border-cream/10 pt-4 text-xs">
                <span className="font-medium text-cream">{review.author_name}</span>
                <span className="ml-2 text-cream/40">{formatDate(review.created_at)}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-cream/15 px-5 py-8 text-sm text-cream/50">
          There are no approved reviews for this piece yet. Be the first to share your experience.
        </p>
      )}
    </section>
  )
}
