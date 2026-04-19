import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  sku: string
  name: string
  quantity: number
  unitPrice: number
  basePrice: number
  hasDiscount: boolean
  subtotal: number
}

interface POSState {
  cart: CartItem[]
  customerId: string | null
  locationId: string
  addToCart: (item: Omit<CartItem, 'subtotal' | 'hasDiscount'>) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateUnitPrice: (productId: string, newPrice: number) => void
  setCustomer: (customerId: string | null) => void
  setLocation: (locationId: string) => void
  clearCart: () => void
  getTotal: () => number
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      cart: [],
      customerId: null,
      locationId: '',

      addToCart: (item) => set((state) => {
        const existing = state.cart.find(i => i.productId === item.productId)
        if (existing) {
          const updated = state.cart.map(i =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity, subtotal: (i.quantity + item.quantity) * i.unitPrice }
              : i
          )
          return { cart: updated }
        }
        const subtotal = item.quantity * item.unitPrice
        return { cart: [...state.cart, { ...item, subtotal, hasDiscount: item.unitPrice < item.basePrice }] }
      }),

      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(i => i.productId !== productId)
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(i =>
          i.productId === productId
            ? { ...i, quantity, subtotal: quantity * i.unitPrice }
            : i
        )
      })),

      updateUnitPrice: (productId, newPrice) => set((state) => ({
        cart: state.cart.map(i =>
          i.productId === productId
            ? {
                ...i,
                unitPrice: newPrice,
                hasDiscount: newPrice < i.basePrice,
                subtotal: i.quantity * newPrice
              }
            : i
        )
      })),

      setCustomer: (customerId) => set({ customerId }),
      setLocation: (locationId) => set({ locationId }),

      clearCart: () => set({ cart: [], customerId: null }),

      getTotal: () => {
        const { cart } = get()
        return cart.reduce((sum, item) => sum + item.subtotal, 0)
      },
    }),
    {
      name: 'razors-pos-storage',
    }
  )
)