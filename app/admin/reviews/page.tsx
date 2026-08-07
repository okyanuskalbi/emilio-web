'use client'

import { useCallback, useEffect, useState } from 'react'

type Review = {
  id: string
  author_name: string
  rating: number
  title: string | null
  body: string
  status: 'pending' | 'approved' | 'rejected'
  verified_purchase: boolean
  admin_note: string | null
  created_at: string
  profile: { full_name: string | null; email: string | null } | null
  product: { name: string; slug: string } | null
}

const statusLabel = { pending: 'Onay bekliyor', approved: 'Yayında', rejected: 'Reddedildi' }

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<'all' | Review['status']>('pending')
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const requestReviews = useCallback(async () => {
    const endpoint = filter === 'all' ? '/api/admin/reviews' : `/api/admin/reviews?status=${filter}`
    const response = await fetch(endpoint)
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(data?.error || 'Yorumlar alınamadı.')
    return (data.reviews || []) as Review[]
  }, [filter])

  const refresh = useCallback(async () => {
    try {
      setReviews(await requestReviews())
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Yorumlar alınamadı.')
    }
  }, [requestReviews])

  useEffect(() => {
    let active = true
    void requestReviews()
      .then((nextReviews) => {
        if (!active) return
        setReviews(nextReviews)
        setLoading(false)
      })
      .catch((requestError) => {
        if (!active) return
        setError(requestError instanceof Error ? requestError.message : 'Yorumlar alınamadı.')
        setLoading(false)
      })
    return () => { active = false }
  }, [requestReviews])

  const updateStatus = async (id: string, status: Review['status']) => {
    setSavingId(id)
    setError('')
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(data?.error || 'Yorum güncellenemedi.')
        return
      }
      await refresh()
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Topluluk kontrolü</p>
          <h1 className="mt-2 text-3xl font-serif font-bold text-cream">Müşteri yorumları</h1>
          <p className="mt-2 text-sm text-cream/55">Satın alma kaydıyla gönderilen yorumları yayınlamadan önce onaylayın.</p>
        </div>
        <label className="text-sm text-cream/60">Durum
          <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="ml-3 rounded-md border border-cream/20 bg-black px-3 py-2 text-cream outline-none focus:border-gold">
            <option value="pending">Onay bekleyenler</option>
            <option value="approved">Yayındakiler</option>
            <option value="rejected">Reddedilenler</option>
            <option value="all">Tümü</option>
          </select>
        </label>
      </div>

      {error && <p className="mb-5 border-l-2 border-red-400 pl-3 text-sm text-red-300">{error}</p>}
      {loading ? <p className="text-cream/50">Yükleniyor…</p> : reviews.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-gold/20 bg-cream/[0.025] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-gold">{review.product?.name || 'Ürün bulunamadı'}</p>
                  <h2 className="mt-2 text-lg font-serif font-semibold text-cream">{review.title || 'Başlıksız yorum'}</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${review.status === 'approved' ? 'border-green-300/30 bg-green-300/10 text-green-200' : review.status === 'rejected' ? 'border-red-300/30 bg-red-300/10 text-red-200' : 'border-amber-300/30 bg-amber-300/10 text-amber-200'}`}>{statusLabel[review.status]}</span>
              </div>
              <p className="mt-3 text-sm tracking-[0.12em] text-gold">{'★'.repeat(review.rating)}<span className="text-cream/20">{'★'.repeat(5 - review.rating)}</span></p>
              <p className="mt-3 text-sm leading-6 text-cream/75">{review.body}</p>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-cream/10 pt-4 text-xs text-cream/50">
                <span>{review.profile?.full_name || review.author_name}</span>
                <span>{review.profile?.email}</span>
                {review.verified_purchase && <span className="text-gold">Doğrulanmış alışveriş</span>}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {review.status !== 'approved' && <button disabled={savingId === review.id} onClick={() => void updateStatus(review.id, 'approved')} className="bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black disabled:opacity-50">Yayınla</button>}
                {review.status !== 'rejected' && <button disabled={savingId === review.id} onClick={() => void updateStatus(review.id, 'rejected')} className="border border-red-400/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-300 transition-colors hover:bg-red-400 hover:text-black disabled:opacity-50">Reddet</button>}
                {review.status !== 'pending' && <button disabled={savingId === review.id} onClick={() => void updateStatus(review.id, 'pending')} className="border border-cream/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cream/70 disabled:opacity-50">Onaya geri al</button>}
              </div>
            </article>
          ))}
        </div>
      ) : <p className="rounded-xl border border-dashed border-cream/15 p-8 text-sm text-cream/50">Bu durumda yorum bulunmuyor.</p>}
    </div>
  )
}
