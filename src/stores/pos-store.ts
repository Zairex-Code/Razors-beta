import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { roundCurrency, multiplyCurrency } from '@/utils/math'

export interface CartItem {
  productId: string
  sku: string
  name: string
  brand?: string | null
  model?: string | null
  imageUrl?: string | null
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
  paymentMethod: string
  isDelivery: boolean
  deliveryCost: number
  subtotal: number
  igv: number
  total: number
  addToCart: (item: Omit<CartItem, 'subtotal' | 'hasDiscount'>) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateUnitPrice: (productId: string, newPrice: number) => void
  setCustomer: (customerId: string | null) => void
  setLocation: (locationId: string) => void
  setPaymentMethod: (method: string) => void
  setIsDelivery: (isDelivery: boolean) => void
  setDeliveryCost: (cost: number) => void
  clearCart: () => void
  getTotal: () => number
}

const recalculateTotals = (cart: CartItem[], deliveryCost: number) => {
  const itemsTotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const subtotalRef = itemsTotal / 1.18
  const igvRef = itemsTotal - subtotalRef
  const subtotalFinal = Math.round(subtotalRef * 100) / 100
  const igvFinal = Math.round(igvRef * 100) / 100
  const totalVenta = Math.round((itemsTotal + deliveryCost) * 100) / 100
  return { subtotal: subtotalFinal, igv: igvFinal, total: totalVenta }
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      cart: [],
      customerId: null,
      locationId: '',
      paymentMethod: 'EFECTIVO',
      isDelivery: false,
      deliveryCost: 0,
      subtotal: 0,
      igv: 0,
      total: 0,

      addToCart: (item) => set((state) => {
        const existing = state.cart.find(i => i.productId === item.productId)
        let newCart: CartItem[]
        if (existing) {
          newCart = state.cart.map(i =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity, subtotal: multiplyCurrency(i.quantity + item.quantity, i.unitPrice) }
              : i
          )
        } else {
          const subtotal = multiplyCurrency(item.quantity, item.unitPrice)
          newCart = [...state.cart, { ...item, subtotal, hasDiscount: item.unitPrice < item.basePrice }]
        }
        const totals = recalculateTotals(newCart, state.deliveryCost)
        return { cart: newCart, ...totals }
      }),

      removeFromCart: (productId) => set((state) => {
        const newCart = state.cart.filter(i => i.productId !== productId)
        const totals = recalculateTotals(newCart, state.deliveryCost)
        return { cart: newCart, ...totals }
      }),

      updateQuantity: (productId, quantity) => set((state) => {
        const newCart = state.cart.map(i =>
          i.productId === productId
            ? { ...i, quantity, subtotal: multiplyCurrency(quantity, i.unitPrice) }
            : i
        )
        const totals = recalculateTotals(newCart, state.deliveryCost)
        return { cart: newCart, ...totals }
      }),

      updateUnitPrice: (productId, newPrice) => set((state) => {
        const newCart = state.cart.map(i =>
          i.productId === productId
            ? {
                ...i,
                unitPrice: roundCurrency(newPrice),
                hasDiscount: newPrice < i.basePrice,
                subtotal: multiplyCurrency(i.quantity, newPrice)
              }
            : i
        )
        const totals = recalculateTotals(newCart, state.deliveryCost)
        return { cart: newCart, ...totals }
      }),

      setCustomer: (customerId) => set({ customerId }),
      setLocation: (locationId) => set({ locationId }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setIsDelivery: (isDelivery) => set((state) => {
        const deliveryCost = isDelivery ? state.deliveryCost : 0
        const totals = recalculateTotals(state.cart, deliveryCost)
        return { isDelivery, deliveryCost, ...totals }
      }),
      setDeliveryCost: (cost) => set((state) => {
        const roundedCost = roundCurrency(cost)
        const totals = recalculateTotals(state.cart, roundedCost)
        return { deliveryCost: roundedCost, ...totals }
      }),

      clearCart: () => set({
        cart: [],
        customerId: null,
        paymentMethod: 'EFECTIVO',
        isDelivery: false,
        deliveryCost: 0,
        subtotal: 0,
        igv: 0,
        total: 0
      }),

      getTotal: () => {
        const { cart } = get()
        return roundCurrency(cart.reduce((sum, item) => sum + item.subtotal, 0))
      },
    }),
    {
      name: 'razors-pos-storage',
    }
  )
)