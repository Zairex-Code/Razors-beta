import { create } from 'zustand'

export interface ImportProduct {
  productId: string
  sku: string
  name: string
  category: string
  quantity: number
  unitPriceUsd: number
}

export interface ImportCost {
  id: string
  category: 'PROVIDER' | 'SHIPPING' | 'CUSTOMS' | 'MOBILITY'
  description: string
  amount: number
  currency: 'USD' | 'PEN'
  exchangeRate: number | null
  voucherUrl: string | null
}

export interface ImportDocument {
  id: string
  type: 'PI' | 'CI' | 'VOUCHER' | 'OTHER'
  url: string
  name: string
}

export interface ImportDraft {
  step: 1 | 2 | 3 | 4
  provider: string
  piNumber: string
  eta: string | null
  exchangeRate: number
  products: ImportProduct[]
  internalCosts: ImportCost[]
  extraCosts: ImportCost[]
  documents: ImportDocument[]
}

interface ImportWizardState {
  draft: ImportDraft | null
  initDraft: () => void
  setStep: (step: 1 | 2 | 3 | 4) => void
  updateBasicInfo: (data: Partial<Pick<ImportDraft, 'provider' | 'piNumber' | 'eta' | 'exchangeRate'>>) => void
  addProduct: (product: ImportProduct) => void
  removeProduct: (productId: string) => void
  updateProduct: (productId: string, data: Partial<ImportProduct>) => void
  addInternalCost: (cost: Omit<ImportCost, 'id'>) => void
  addExtraCost: (cost: Omit<ImportCost, 'id'>) => void
  removeCost: (id: string, type: 'internal' | 'extra') => void
  updateCost: (id: string, type: 'internal' | 'extra', data: Partial<ImportCost>) => void
  addDocument: (doc: Omit<ImportDocument, 'id'>) => void
  removeDocument: (id: string) => void
  resetDraft: () => void
}

export const useImportWizardStore = create<ImportWizardState>((set, get) => ({
  draft: null,

  initDraft: () => set({
    draft: {
      step: 1,
      provider: '',
      piNumber: '',
      eta: null,
      exchangeRate: 3.8,
      products: [],
      internalCosts: [],
      extraCosts: [],
      documents: [],
    }
  }),

  setStep: (step) => set((state) => ({
    draft: state.draft ? { ...state.draft, step } : null
  })),

  updateBasicInfo: (data) => set((state) => ({
    draft: state.draft ? { ...state.draft, ...data } : null
  })),

  addProduct: (product) => set((state) => ({
    draft: state.draft
      ? { ...state.draft, products: [...state.draft.products, product] }
      : null
  })),

  removeProduct: (productId) => set((state) => ({
    draft: state.draft
      ? { ...state.draft, products: state.draft.products.filter(p => p.productId !== productId) }
      : null
  })),

  updateProduct: (productId, data) => set((state) => ({
    draft: state.draft
      ? {
          ...state.draft,
          products: state.draft.products.map(p =>
            p.productId === productId ? { ...p, ...data } : p
          )
        }
      : null
  })),

  addInternalCost: (cost) => set((state) => ({
    draft: state.draft
      ? { ...state.draft, internalCosts: [...state.draft.internalCosts, { ...cost, id: crypto.randomUUID() }] }
      : null
  })),

  addExtraCost: (cost) => set((state) => ({
    draft: state.draft
      ? { ...state.draft, extraCosts: [...state.draft.extraCosts, { ...cost, id: crypto.randomUUID() }] }
      : null
  })),

  removeCost: (id, type) => set((state) => {
    if (!state.draft) return state
    const key = type === 'internal' ? 'internalCosts' : 'extraCosts'
    return {
      draft: { ...state.draft, [key]: state.draft[key].filter(c => c.id !== id) }
    }
  }),

  updateCost: (id, type, data) => set((state) => {
    if (!state.draft) return state
    const key = type === 'internal' ? 'internalCosts' : 'extraCosts'
    return {
      draft: {
        ...state.draft,
        [key]: state.draft[key].map(c => c.id === id ? { ...c, ...data } : c)
      }
    }
  }),

  addDocument: (doc) => set((state) => ({
    draft: state.draft
      ? { ...state.draft, documents: [...state.draft.documents, { ...doc, id: crypto.randomUUID() }] }
      : null
  })),

  removeDocument: (id) => set((state) => ({
    draft: state.draft
      ? { ...state.draft, documents: state.draft.documents.filter(d => d.id !== id) }
      : null
  })),

  resetDraft: () => set({ draft: null }),
}))