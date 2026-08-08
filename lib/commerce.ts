export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]
export type CartActivityAction = 'restore' | 'add' | 'quantity_change' | 'remove' | 'clear' | 'checkout'

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value)
}

export function orderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Order received',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return labels[status] || status
}

export function reviewAuthorName(fullName: string | null | undefined, email: string) {
  const words = (fullName || email.split('@')[0] || 'Customer')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!words.length) return 'Customer'
  return words.length === 1 ? words[0] : `${words[0]} ${words.at(-1)?.slice(0, 1)}.`
}
