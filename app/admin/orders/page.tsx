'use client'

import { useCallback, useEffect, useState } from 'react'
import { ORDER_STATUSES, orderStatusLabel, type OrderStatus } from '@/lib/commerce'

type AdminOrder = {
  id: string
  order_number: string | null
  status: OrderStatus
  total: number
  currency: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  shipping_address: string | null
  shipping_city: string | null
  tracking_provider: string | null
  tracking_number: string | null
  tracking_url: string | null
  payment_provider: string | null
  created_at: string
  profile: { full_name: string | null; email: string | null; phone: string | null } | null
  items: Array<{ id: string; product_name: string; variant_details: string | null; engraving: string | null; quantity: number; unit_price: number }>
  events: Array<{ id: string; status: string; note: string | null; visible_to_customer: boolean; created_at: string }>
}

type OrderDraft = {
  status: OrderStatus
  tracking_provider: string
  tracking_number: string
  tracking_url: string
  note: string
}

function draftFrom(order: AdminOrder): OrderDraft {
  return {
    status: order.status,
    tracking_provider: order.tracking_provider || '',
    tracking_number: order.tracking_number || '',
    tracking_url: order.tracking_url || '',
    note: '',
  }
}

function date(value: string) {
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [drafts, setDrafts] = useState<Record<string, OrderDraft>>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const requestOrders = useCallback(async () => {
    const response = await fetch('/api/admin/orders')
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(data?.error || 'Siparişler alınamadı.')
    return (data.orders || []) as AdminOrder[]
  }, [])

  const refresh = useCallback(async () => {
    try {
      setOrders(await requestOrders())
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Siparişler alınamadı.')
    }
  }, [requestOrders])

  useEffect(() => {
    let active = true
    void requestOrders()
      .then((nextOrders) => {
        if (!active) return
        setOrders(nextOrders)
        setLoading(false)
      })
      .catch((requestError) => {
        if (!active) return
        setError(requestError instanceof Error ? requestError.message : 'Siparişler alınamadı.')
        setLoading(false)
      })
    return () => { active = false }
  }, [requestOrders])

  const setDraft = (id: string, patch: Partial<OrderDraft>, fallback: AdminOrder) => {
    setDrafts((current) => ({ ...current, [id]: { ...(current[id] || draftFrom(fallback)), ...patch } }))
  }

  const save = async (order: AdminOrder) => {
    const draft = drafts[order.id] || draftFrom(order)
    setSavingId(order.id)
    setError('')
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, ...draft, visible_to_customer: true }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(data?.error || 'Sipariş güncellenemedi.')
        return
      }
      setDrafts((current) => ({ ...current, [order.id]: { ...draft, note: '' } }))
      await refresh()
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Operasyon</p>
        <h1 className="mt-2 text-3xl font-serif font-bold text-cream">Siparişler</h1>
        <p className="mt-2 text-sm text-cream/55">Sipariş durumunu, müşteri kargo notunu ve takip bağlantısını tek yerden güncelleyin.</p>
      </div>
      {error && <p className="mb-5 border-l-2 border-red-400 pl-3 text-sm text-red-300">{error}</p>}
      {loading ? <p className="text-cream/50">Yükleniyor…</p> : orders.length ? (
        <div className="space-y-5">
          {orders.map((order) => {
            const draft = drafts[order.id] || draftFrom(order)
            return (
              <article key={order.id} className="rounded-xl border border-gold/20 bg-cream/[0.025] p-5 md:p-6">
                <div className="flex flex-col justify-between gap-4 border-b border-cream/10 pb-5 md:flex-row md:items-start">
                  <div>
                    <p className="font-mono text-xs tracking-[0.1em] text-gold">{order.order_number || order.id}</p>
                    <h2 className="mt-2 text-xl font-serif font-semibold text-cream">{order.customer_name || order.profile?.full_name || 'İsimsiz müşteri'}</h2>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream/50">
                      <span>{order.customer_email || order.profile?.email}</span>
                      <span>{order.customer_phone || order.profile?.phone}</span>
                      <span>{date(order.created_at)}</span>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-lg font-semibold text-cream">{Number(order.total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.currency || 'TRY'}</p>
                    <p className="mt-1 text-xs text-cream/45">{order.payment_provider || 'Ödeme yöntemi yok'} · {order.shipping_city || 'Şehir belirtilmedi'}</p>
                  </div>
                </div>

                <div className="grid gap-6 pt-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,.9fr)]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-gold">Ürünler</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between gap-4 border-b border-cream/10 pb-2 text-cream/75">
                          <span>{item.product_name}<small className="ml-2 text-cream/40">{[item.variant_details, item.engraving ? `Kazıma: ${item.engraving}` : null].filter(Boolean).join(' · ')}</small></span>
                          <span className="shrink-0">×{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-xs uppercase tracking-[0.14em] text-gold">Teslimat adresi</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-cream/60">{order.shipping_address || 'Adres girilmemiş.'}</p>
                    {order.events.length > 0 && (
                      <div className="mt-5 border-l border-gold/35 pl-4">
                        {order.events.map((event) => (
                          <div key={event.id} className="relative pb-4 last:pb-0">
                            <span className="absolute -left-[1.31rem] top-1 h-2.5 w-2.5 rounded-full border border-gold bg-black" />
                            <p className="text-xs font-medium text-cream">{orderStatusLabel(event.status)} {event.visible_to_customer ? '' : '(müşteriye kapalı)'}</p>
                            {event.note && <p className="mt-1 text-xs leading-5 text-cream/50">{event.note}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-cream/10 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-gold">Takip güncellemesi</p>
                    <div className="mt-4 space-y-3">
                      <select value={draft.status} onChange={(event) => setDraft(order.id, { status: event.target.value as OrderStatus }, order)} className="w-full rounded-md border border-cream/20 bg-black px-3 py-2.5 text-sm text-cream outline-none focus:border-gold">
                        {ORDER_STATUSES.map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}
                      </select>
                      <input value={draft.tracking_provider} onChange={(event) => setDraft(order.id, { tracking_provider: event.target.value }, order)} placeholder="Kargo firması (örn. Yurtiçi Kargo)" className="w-full rounded-md border border-cream/20 bg-black px-3 py-2.5 text-sm text-cream outline-none focus:border-gold" />
                      <input value={draft.tracking_number} onChange={(event) => setDraft(order.id, { tracking_number: event.target.value }, order)} placeholder="Takip numarası" className="w-full rounded-md border border-cream/20 bg-black px-3 py-2.5 text-sm text-cream outline-none focus:border-gold" />
                      <input value={draft.tracking_url} onChange={(event) => setDraft(order.id, { tracking_url: event.target.value }, order)} placeholder="Kargo takip URL'si" className="w-full rounded-md border border-cream/20 bg-black px-3 py-2.5 text-sm text-cream outline-none focus:border-gold" />
                      <textarea value={draft.note} onChange={(event) => setDraft(order.id, { note: event.target.value }, order)} rows={3} placeholder="Müşteriye görünecek durum notu" className="w-full resize-y rounded-md border border-cream/20 bg-black px-3 py-2.5 text-sm text-cream outline-none focus:border-gold" />
                      <button disabled={savingId === order.id} onClick={() => void save(order)} className="w-full bg-gold px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-gold/80 disabled:opacity-50">
                        {savingId === order.id ? 'Kaydediliyor…' : 'Takibi güncelle'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : <p className="rounded-xl border border-dashed border-cream/15 p-8 text-sm text-cream/50">Henüz sipariş yok.</p>}
    </div>
  )
}
