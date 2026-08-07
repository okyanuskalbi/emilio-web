'use client'

import { useEffect, useMemo, useState } from 'react'

type CartItem = { name: string; quantity: number; variantDetails: string | null; engraving: string | null; price: number }
type Member = {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
  cart: {
    items: CartItem[]
    item_count: number
    subtotal: number
    last_action: string | null
    updated_at: string
  } | null
  orders: { total: number; delivered: number; latestOrderAt: string | null }
}

function date(value: string | null) {
  return value ? new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      const response = await fetch('/api/admin/members')
      const data = await response.json().catch(() => null)
      if (!active) return
      if (!response.ok) setError(data?.error || 'Üyeler alınamadı.')
      else setMembers(data.members || [])
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])

  const visibleMembers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR')
    if (!normalized) return members
    return members.filter((member) => `${member.full_name || ''} ${member.email || ''} ${member.phone || ''}`.toLocaleLowerCase('tr-TR').includes(normalized))
  }, [members, query])

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Müşteri ilişkileri</p>
          <h1 className="mt-2 text-3xl font-serif font-bold text-cream">Üyeler ve sepetleri</h1>
          <p className="mt-2 text-sm text-cream/55">Üyelik bilgileri, sipariş özeti ve hesaba bağlı güncel sepet burada görünür.</p>
        </div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="İsim, e-posta veya telefon ara"
          className="w-full rounded-md border border-cream/20 bg-black px-4 py-3 text-sm text-cream outline-none placeholder:text-cream/35 focus:border-gold md:max-w-sm" />
      </div>
      {error && <p className="mb-5 border-l-2 border-red-400 pl-3 text-sm text-red-300">{error}</p>}
      {loading ? <p className="text-cream/50">Yükleniyor…</p> : visibleMembers.length ? (
        <div className="overflow-x-auto rounded-xl border border-gold/20">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-cream/[0.04] text-xs uppercase tracking-[0.12em] text-cream/55">
              <tr>
                <th className="p-4">Üye</th>
                <th className="p-4">Sipariş</th>
                <th className="p-4">Güncel sepet</th>
                <th className="p-4">Son hareket</th>
              </tr>
            </thead>
            <tbody>
              {visibleMembers.map((member) => (
                <tr key={member.id} className="align-top border-t border-cream/10 text-cream/75">
                  <td className="p-4">
                    <p className="font-medium text-cream">{member.full_name || 'İsimsiz üye'}</p>
                    <p className="mt-1 text-xs text-cream/50">{member.email || 'E-posta yok'}</p>
                    {member.phone && <p className="mt-1 text-xs text-cream/50">{member.phone}</p>}
                    <p className="mt-3 text-[11px] text-cream/35">Üyelik: {date(member.created_at)}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gold">{member.orders.total} sipariş</p>
                    <p className="mt-1 text-xs text-cream/50">{member.orders.delivered} teslim edildi</p>
                    <p className="mt-3 text-[11px] text-cream/35">Son sipariş: {date(member.orders.latestOrderAt)}</p>
                  </td>
                  <td className="p-4">
                    {member.cart?.items?.length ? (
                      <div className="max-w-sm space-y-2">
                        {member.cart.items.slice(0, 4).map((item, index) => (
                          <p key={`${item.name}-${index}`} className="text-xs leading-5 text-cream/70">
                            <span className="font-medium text-cream">{item.name}</span> ×{item.quantity}
                            {item.variantDetails && <span className="text-cream/45"> · {item.variantDetails}</span>}
                            {item.engraving && <span className="text-cream/45"> · Kazıma: {item.engraving}</span>}
                          </p>
                        ))}
                        {member.cart.items.length > 4 && <p className="text-xs text-cream/40">+{member.cart.items.length - 4} ürün daha</p>}
                        <p className="border-t border-cream/10 pt-2 text-xs text-gold">{member.cart.item_count} adet · {Number(member.cart.subtotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY</p>
                      </div>
                    ) : <p className="text-xs text-cream/40">Sepeti boş veya henüz hesabıyla eşleştirilmedi.</p>}
                  </td>
                  <td className="p-4 text-xs text-cream/50">
                    <p>{member.cart?.last_action || 'Hareket yok'}</p>
                    <p className="mt-1 text-[11px] text-cream/35">{date(member.cart?.updated_at || null)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="rounded-xl border border-dashed border-cream/15 p-8 text-sm text-cream/50">Aramanızla eşleşen üye yok.</p>}
    </div>
  )
}
