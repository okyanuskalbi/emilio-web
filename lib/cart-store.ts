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
  engraving?: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string, size?: string) => void
  updateQuantity: (productId: string, size: string | undefined, quantity: number) => void
  clear: () => void
  toggle: (open?: boolean) => void
  total: () => number
  count: () => number
}

const sameLine = (a: CartItem, productId: string, size?: string) =>
  a.productId === productId && a.size === size

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item.productId, item.size))
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, item.size)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              isOpen: true,
            }
          }
          return { items: [...state.items, { ...item, quantity }], isOpen: true }
        }),

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, size)),
        })),

      updateQuantity: (productId, size, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => !sameLine(i, productId, size))
            : state.items.map((i) =>
                sameLine(i, productId, size) ? { ...i, quantity } : i
              ),
        })),

      clear: () => set({ items: [] }),
      toggle: (open) => set((state) => ({ isOpen: open ?? !state.isOpen })),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'emilio-cart' }
  )
)
