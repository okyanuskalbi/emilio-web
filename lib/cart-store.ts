'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  slug: string
  price: number
  image: string
  material: string
  size?: string
  variantId?: string
  variantDetails?: string
  engraving?: string
  lineId?: string
  quantity: number
}

export interface CartActivity {
  action: 'add' | 'quantity_change' | 'remove' | 'clear'
  lineId?: string
  happenedAt: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  lastActivity: CartActivity | null
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (lineId: string) => void
  updateQuantity: (lineId: string, quantity: number) => void
  clear: () => void
  toggle: (open?: boolean) => void
  total: () => number
  count: () => number
}

export function getCartItemLineId(item: Pick<CartItem, 'productId' | 'variantId' | 'variantDetails' | 'size' | 'engraving' | 'lineId'>) {
  if (item.lineId) return item.lineId
  return [
    item.productId,
    item.variantId || item.variantDetails || item.size || 'base',
    item.engraving?.trim() || 'plain',
  ].join(':')
}

function cartActivity(action: CartActivity['action'], lineId?: string): CartActivity {
  return { action, lineId, happenedAt: Date.now() }
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      lastActivity: null,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const lineId = getCartItemLineId(item)
          const cartItem = { ...item, lineId, quantity }
          const existing = state.items.find((existingItem) => getCartItemLineId(existingItem) === lineId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                getCartItemLineId(i) === lineId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              isOpen: true,
              lastActivity: cartActivity('add', lineId),
            }
          }
          return {
            items: [...state.items, cartItem],
            isOpen: true,
            lastActivity: cartActivity('add', lineId),
          }
        }),

      removeItem: (lineId) =>
        set((state) => ({
          items: state.items.filter((item) => getCartItemLineId(item) !== lineId),
          lastActivity: cartActivity('remove', lineId),
        })),

      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((item) => getCartItemLineId(item) !== lineId)
            : state.items.map((i) =>
                getCartItemLineId(i) === lineId ? { ...i, quantity } : i
              ),
          lastActivity: cartActivity('quantity_change', lineId),
        })),

      clear: () => set((state) => ({
        items: [],
        lastActivity: state.items.length ? cartActivity('clear') : null,
      })),
      toggle: (open) => set((state) => ({ isOpen: open ?? !state.isOpen })),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'emilio-cart',
      // Open drawer state and activity timestamps should not survive a reload.
      partialize: (state) => ({ items: state.items }),
    }
  )
)
