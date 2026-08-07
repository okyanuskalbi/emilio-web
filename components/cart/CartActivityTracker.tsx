'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-store'

/**
 * Persists a member's current basket after a short debounce. The API determines
 * the user from the verified session; the browser never supplies a user id.
 */
export function CartActivityTracker() {
  const items = useCart((state) => state.items)
  const lastActivity = useCart((state) => state.lastActivity)
  const [memberId, setMemberId] = useState<string | null | undefined>(undefined)
  const lastSentKey = useRef<string | null>(null)

  const cartFingerprint = useMemo(
    () => JSON.stringify(items.map((item) => ({
      id: item.productId,
      variantId: item.variantId || null,
      lineId: item.lineId || null,
      quantity: item.quantity,
      engraving: item.engraving || null,
    }))),
    [items],
  )

  useEffect(() => {
    let active = true

    void supabase.auth.getUser().then(({ data }) => {
      if (active) setMemberId(data.user?.id || null)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setMemberId(session?.user?.id || null)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!memberId) {
      lastSentKey.current = null
      return
    }

    const action = lastActivity?.action || 'restore'
    const key = `${memberId}:${cartFingerprint}:${action}:${lastActivity?.happenedAt || 'initial'}`
    if (lastSentKey.current === key) return

    const timeout = window.setTimeout(() => {
      lastSentKey.current = key
      void fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, action }),
      })
    }, 600)

    return () => window.clearTimeout(timeout)
  }, [cartFingerprint, items, lastActivity?.action, lastActivity?.happenedAt, memberId])

  return null
}
