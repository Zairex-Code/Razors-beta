'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Plus,
  Ship,
  Truck,
  DollarSign,
  Upload,
  FileText,
  CheckCircle,
  Trash2,
  Search,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useImportWizardStore } from '@/stores/import-wizard-store'
import { createImport } from '@/app/actions/import-actions'
import { createProduct, searchProducts } from '@/app/actions/product-actions'

const STEPS = [
  { step: 1, label: 'Info Basic & Docs' },
  { step: 2, label: 'Productos' },
  { step: 3, label: 'Documentos' },
  { step: 4, label: 'Costos Extra' },
]

interface ImportWizardProps {
  onClose: () => void
  onComplete: () => void
  providers: string[]
  products: Array<{
    id: string
    name: string
    sku: string
    category: string
  }>
}

interface NewProductModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (product: { id: string, name: string, sku: string, category: string }) => void
}

function NewProductModal({ isOpen, onClose, onCreated }: NewProductModalProps) {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [pricePen, setPricePen] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!sku || !name || !category || !pricePen) return
    setIsCreating(true)
    try {
      const product = await createProduct({
        sku,
        name,
        category,
        pricePen: parseFloat(pricePen)
      })
      onCreated({ id: product.id, name: product.name, sku: product.sku, category: product.category })
      setSku('')
      setName('')
      setCategory('')
      setPricePen('')
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel p-8 rounded-[2.5rem] border-border/30 relative w-full max-w-md"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Agregar Producto Nuevo</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-muted-foreground text-sm">Registra un producto que no existe en el inventario.</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. WH-CLP-SNR"
                className="w-full glass-input rounded-xl py-3 px-4 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del producto"
                className="w-full glass-input rounded-xl py-3 px-4 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Categoría</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Tools, Blades, Accessories"
                className="w-full glass-input rounded-xl py-3 px-4 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Precio (PEN)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={pricePen}
                  onChange={(e) => setPricePen(e.target.value)}
                  placeholder="0.00"
                  className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-sm font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={!sku || !name || !category || !pricePen || isCreating}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Crear Producto
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface ProductComboboxProps {
  value: string
  onChange: (productId: string, data: { sku: string, name: string, category: string }) => void
  products: Array<{ id: string, name: string, sku: string, category: string }>
  disabledOptions?: string[]
}

function ProductCombobox({ value, onChange, products, disabledOptions = [] }: ProductComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Array<{ id: string, name: string, sku: string, category: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedProduct = products.find(p => p.id === value)

  useEffect(() => {
    if (search.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const searchResults = await searchProducts(search)
        setResults(searchResults.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category
        })))
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (product: { id: string, name: string, sku: string, category: string }) => {
    onChange(product.id, { sku: product.sku, name: product.name, category: product.category })
    setSearch('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={isOpen ? search : selectedProduct?.name || ''}
        onChange={(e) => {
          setSearch(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Buscar producto..."
        className="w-full glass-input rounded-xl py-2 px-3 text-sm"
      />
      <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 w-full mt-1 glass-panel rounded-xl border-border/30 overflow-hidden"
          >
            {isSearching && (
              <div className="p-3 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Buscando...
              </div>
            )}
            {!isSearching && results.length === 0 && search.length < 2 && (
              <div className="p-3 text-center text-muted-foreground text-sm">
                Escribe al menos 2 caracteres para buscar
              </div>
            )}
            {!isSearching && results.length === 0 && search.length >= 2 && (
              <div className="p-3 text-center text-muted-foreground text-sm">
                No se encontraron productos
              </div>
            )}
            {results.length > 0 && (
              <div className="max-h-48 overflow-y-auto divide-y divide-border/20">
                {results.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className="w-full px-3 py-2.5 text-left hover:bg-foreground/5 transition-colors flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm font-semibold">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground">{product.sku} • {product.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ImportWizard({ onClose, onComplete, providers, products }: ImportWizardProps) {
  const { draft, initDraft, updateBasicInfo, addProduct, removeProduct, updateProduct, addInternalCost, addExtraCost, removeCost, updateCost, addDocument, removeDocument, resetDraft, setStep } = useImportWizardStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false)

  const currentStep = draft?.step ?? 1

  const handleInit = () => {
    initDraft()
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setStep((currentStep + 1) as 1 | 2 | 3 | 4)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setStep((currentStep - 1) as 1 | 2 | 3 | 4)
    }
  }

  const handleSubmit = async () => {
    if (!draft) return

    setIsSubmitting(true)
    setError(null)

    try {
      await createImport({
        provider: draft.provider,
        piNumber: draft.piNumber,
        eta: draft.eta ?? undefined,
        exchangeRate: draft.exchangeRate,
        items: draft.products.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          unitPriceUsd: p.unitPriceUsd
        })),
        internalCosts: draft.internalCosts.map(c => ({
          category: c.category,
          description: c.description,
          amount: c.amount,
          currency: c.currency,
          exchangeRate: c.exchangeRate ?? undefined,
          voucherUrl: c.voucherUrl ?? undefined
        })),
        extraCosts: draft.extraCosts.map(c => ({
          category: c.category,
          description: c.description,
          amount: c.amount,
          currency: c.currency,
          exchangeRate: c.exchangeRate ?? undefined,
          voucherUrl: c.voucherUrl ?? undefined
        }))
      })
      resetDraft()
      onComplete()
    } catch (err) {
      setError('Error al crear la importación. Intenta de nuevo.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProductCreated = (product: { id: string, name: string, sku: string, category: string }) => {
    addProduct({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      quantity: 1,
      unitPriceUsd: 0
    })
  }

  if (!draft) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center"
      >
        <div className="text-center">
          <Button onClick={handleInit} className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold neon-glow">
            Iniciar Nueva Importación
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col"
    >
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -ml-32 -mb-32 pointer-events-none" />

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onCreated={handleProductCreated}
      />

      <div className="relative z-10 p-8 border-b border-border/30 bg-background/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Nuevo Wizard de Importación</h2>
            <p className="text-muted-foreground text-sm">Sigue los pasos para registrar un nuevo envío internacional.</p>
          </div>
          <button
            onClick={() => { resetDraft(); onClose() }}
            className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-w-4xl mx-auto relative px-4">
          <div className="absolute left-0 right-0 h-0.5 bg-foreground/10 top-1/2 -translate-y-1/2 z-0" />
          <div
            className="absolute left-0 h-0.5 bg-primary neon-glow top-1/2 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />
          <div className="flex justify-between items-center relative z-10">
            {STEPS.map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  currentStep > s.step ? "bg-primary border-primary text-primary-foreground neon-glow" :
                  currentStep === s.step ? "bg-background border-primary text-primary neon-border" :
                  "bg-background border-foreground/10 text-foreground/20"
                )}>
                  <span className="text-sm font-bold">{s.step}</span>
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  currentStep === s.step ? "text-primary" : currentStep > s.step ? "text-foreground" : "text-foreground/20"
                )}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepBasicInfo key="step1" providers={providers} />
            )}
            {currentStep === 2 && (
              <StepProducts key="step2" products={products} onOpenNewProductModal={() => setIsNewProductModalOpen(true)} />
            )}
            {currentStep === 3 && (
              <StepDocuments key="step3" />
            )}
            {currentStep === 4 && (
              <StepExtraCosts key="step4" />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 p-8 border-t border-border/30 bg-background/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="ghost"
                className="px-8 py-4 rounded-2xl text-sm font-bold text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all"
              >
                <ChevronLeft size={18} className="mr-1" />
                Atrás
              </Button>
            )}
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                className="px-12 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                Siguiente: Agregar Productos
                <ChevronRight size={18} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-12 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(0,247,255,0.3)]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    Finalizar Importación
                    <CheckCircle size={18} />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StepBasicInfo({ providers }: { providers: string[] }) {
  const { draft, updateBasicInfo } = useImportWizardStore()
  if (!draft) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <div className="glass-panel p-12 rounded-[2.5rem] border-border/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-12 py-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">Basic Import Information</h3>
            <p className="text-muted-foreground text-sm">Provide the core details to initialize the import tracking.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Provider Name</label>
              <select
                value={draft.provider}
                onChange={(e) => updateBasicInfo({ provider: e.target.value })}
                className="w-full glass-input rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 transition-all appearance-none bg-[#0a0a0a] text-white"
              >
                <option value="" disabled selected>Select a provider...</option>
                {providers.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Proforma Invoice (PI) Number</label>
              <input
                type="text"
                value={draft.piNumber}
                onChange={(e) => updateBasicInfo({ piNumber: e.target.value })}
                placeholder="e.g. PI-2024-882"
                className="w-full glass-input rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Estimated Arrival (ETA)</label>
              <input
                type="date"
                value={draft.eta ?? ''}
                onChange={(e) => updateBasicInfo({ eta: e.target.value || null })}
                className="w-full glass-input rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Initial Exchange Rate</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] font-bold">PEN/USD</span>
                <input
                  type="number"
                  step="0.01"
                  value={draft.exchangeRate}
                  onChange={(e) => updateBasicInfo({ exchangeRate: parseFloat(e.target.value) || 3.8 })}
                  placeholder="3.75"
                  className="w-full glass-input rounded-2xl py-4 pl-24 pr-5 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => useImportWizardStore.getState().setStep(2)}
          className="px-12 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          Next: Add Products
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  )
}

function StepProducts({ products, onOpenNewProductModal }: { products: Array<{ id: string, name: string, sku: string, category: string }>, onOpenNewProductModal: () => void }) {
  const { draft, addProduct, removeProduct, updateProduct, addInternalCost, removeCost, updateCost } = useImportWizardStore()

  if (!draft) return null

  const handleAddRow = () => {
    addProduct({
      productId: `temp-${Date.now()}`,
      sku: '',
      name: '',
      category: '',
      quantity: 1,
      unitPriceUsd: 0
    })
  }

  const handleProductSelect = (productId: string, data: { sku: string, name: string, category: string }) => {
    updateProduct(productId, {
      productId: data.name ? productId : '',
      sku: data.sku,
      name: data.name,
      category: data.category
    })
  }

  const productsTotal = draft.products.reduce((acc, p) => acc + (p.quantity * p.unitPriceUsd), 0)
  const internalTotal = draft.internalCosts.reduce((acc, c) => {
    const amountInUsd = c.currency === 'USD' ? c.amount : c.amount / (c.exchangeRate ?? draft.exchangeRate)
    return acc + amountInUsd
  }, 0)
  const grandTotal = productsTotal + internalTotal

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Proforma Invoice Items</h3>
          <p className="text-muted-foreground text-sm">Input the items as they appear in your provider&apos;s proforma.</p>
        </div>
        <button
          onClick={onOpenNewProductModal}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 text-primary border border-primary/30 font-bold text-sm tracking-tight neon-border hover:bg-primary/20 transition-all"
        >
          <Plus size={18} />
          Agregar Producto Nuevo
        </button>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border-border/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-foreground/5 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-bold">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">SKU / Category</th>
              <th className="px-6 py-4 text-center">Quantity</th>
              <th className="px-6 py-4 text-right">Unit Price (USD)</th>
              <th className="px-6 py-4 text-right">Total (USD)</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {draft.products.map((p) => (
              <tr key={p.productId} className="hover:bg-foreground/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <ProductCombobox
                    value={p.productId}
                    onChange={(productId, data) => {
                      if (productId.startsWith('temp-')) {
                        updateProduct(p.productId, { productId, sku: data.sku, name: data.name, category: data.category })
                      } else {
                        handleProductSelect(p.productId, data)
                      }
                    }}
                    products={products}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {p.sku ? (
                      <>
                        <span className="font-mono text-xs text-primary">{p.sku}</span>
                        <span className="px-2 py-0.5 rounded-md bg-foreground/5 text-[10px] uppercase tracking-wider text-muted-foreground">{p.category}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="number"
                    min={1}
                    value={p.quantity || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '') {
                        updateProduct(p.productId, { quantity: 1 })
                      } else {
                        updateProduct(p.productId, { quantity: parseInt(val) || 1 })
                      }
                    }}
                    className="bg-foreground/5 border border-border/50 rounded-lg py-1 px-2 text-sm font-bold w-20 text-center mx-auto focus:ring-1 focus:ring-primary/30"
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-muted-foreground text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={p.unitPriceUsd || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '') {
                          updateProduct(p.productId, { unitPriceUsd: 0 })
                        } else {
                          updateProduct(p.productId, { unitPriceUsd: parseFloat(val) || 0 })
                        }
                      }}
                      className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 w-24 text-right"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-black text-foreground">
                    ${(p.quantity * p.unitPriceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => removeProduct(p.productId)}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleAddRow}
        className="flex items-center gap-2 text-muted-foreground text-sm font-bold hover:text-primary transition-all"
      >
        <Plus size={14} />
        + Agregar fila
      </button>

      <div className="glass-panel p-6 rounded-3xl border-border/30 space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Truck size={18} />
          <h4 className="text-sm font-bold uppercase tracking-widest">Provider Internal Costs (e.g., Local Freight)</h4>
        </div>

        <div className="space-y-4">
          {draft.internalCosts.map((cost, idx) => (
            <div key={cost.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-6 items-end">
              <div className="space-y-2">
                {idx === 0 && <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cost Description</label>}
                <input
                  type="text"
                  value={cost.description}
                  onChange={(e) => updateCost(cost.id, 'internal', { description: e.target.value })}
                  placeholder="e.g. Local Freight to Port"
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                {idx === 0 && <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Amount (USD)</label>}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={cost.amount || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '') {
                        updateCost(cost.id, 'internal', { amount: 0 })
                      } else {
                        updateCost(cost.id, 'internal', { amount: parseFloat(val) || 0 })
                      }
                    }}
                    placeholder="0.00"
                    className="w-full glass-input rounded-xl py-3 pl-8 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              {draft.internalCosts.length > 1 && (
                <button
                  onClick={() => removeCost(cost.id, 'internal')}
                  className="p-3 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all mb-0.5"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => addInternalCost({ category: 'PROVIDER', description: '', amount: 0, currency: 'USD', exchangeRate: null, voucherUrl: null })}
          className="flex items-center gap-2 text-primary font-bold text-sm tracking-tight hover:text-primary/80 transition-all drop-shadow-[0_0_10px_rgba(0,247,255,0.3)] w-fit"
        >
          <Plus size={14} />
          + Add another provider cost
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6">
        <div className="glass-panel px-8 py-6 rounded-[2rem] flex items-center gap-6 border-primary/30 bg-primary/5 shadow-[0_0_40px_rgba(0,247,255,0.1)]">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary neon-glow">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-black mb-1">Grand Total Proforma (USD)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-foreground tracking-tighter">
                ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-muted-foreground font-bold uppercase">Total Products + Provider Costs</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StepDocuments() {
  const { draft, addDocument, removeDocument } = useImportWizardStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!draft) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const fileType = file.type.split('/')[1]?.toUpperCase() || 'OTHER'
      const validTypes = ['PDF', 'JPG', 'JPEG', 'PNG', 'XLSX', 'XLS', 'DOC', 'DOCX']
      const type = validTypes.includes(fileType) ? fileType as 'PI' | 'CI' | 'VOUCHER' | 'OTHER' : 'OTHER'

      addDocument({
        type,
        url: URL.createObjectURL(file),
        name: file.name
      })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="glass-panel p-10 rounded-[2.5rem] border-border/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

        <div className="space-y-10">
          <div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Import Documentation</h3>
            <p className="text-muted-foreground text-sm">Upload any related file: PDFs, Images, Excel, Videos.</p>
          </div>

          <div className="space-y-8">
            <div className="group relative">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="absolute -inset-1 bg-primary/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full border-2 border-dashed border-primary/20 rounded-[2rem] p-20 flex flex-col items-center justify-center gap-6 bg-foreground/[0.02] hover:bg-foreground/[0.04] hover:border-primary/40 transition-all group"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500 neon-glow">
                  <Upload size={32} />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground mb-2">Universal Drag & Drop</p>
                  <p className="text-sm text-muted-foreground">Click to select files: PDFs, Images, Excel, Videos</p>
                </div>
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Uploaded Files</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {draft.documents.map((doc) => (
                  <div key={doc.id} className="glass-panel py-3 px-4 rounded-xl flex items-center justify-between border-border/20 bg-foreground/[0.02]">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-primary" />
                      <span className="text-sm font-medium">{doc.name}</span>
                    </div>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="p-1.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all rounded-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {draft.documents.length === 0 && (
                  <p className="text-sm text-muted-foreground">No files uploaded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StepExtraCosts() {
  const { draft, addExtraCost, removeCost, updateCost } = useImportWizardStore()

  if (!draft) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="glass-panel p-10 rounded-[2.5rem] border-border/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

        <div className="space-y-10">
          <div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Logistical Extra Costs</h3>
            <p className="text-muted-foreground text-sm">Register all additional expenses in PEN to calculate the final landed cost.</p>
          </div>

          <div className="flex flex-col gap-8">
            {[
              { label: '1. Shipping', icon: Ship, category: 'SHIPPING' as const },
              { label: '2. Customs', icon: DollarSign, category: 'CUSTOMS' as const },
              { label: '3. Mobility', icon: Truck, category: 'MOBILITY' as const }
            ].map((costCategory) => {
              const categoryCosts = draft.extraCosts.filter(c => c.category === costCategory.category)

              return (
                <div key={costCategory.category} className="glass-card p-8 rounded-[2rem] border-border/20 hover:border-primary/30 transition-all group">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500">
                        <costCategory.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground">{costCategory.label}</h4>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {categoryCosts.map((cost) => (
                        <div key={cost.id} className="glass-panel bg-foreground/[0.02] border-none rounded-2xl p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Date</p>
                              <p className="text-sm font-semibold">{new Date().toLocaleDateString('es-PE')}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Description</p>
                              <input
                                type="text"
                                value={cost.description}
                                onChange={(e) => updateCost(cost.id, 'extra', { description: e.target.value })}
                                placeholder="Payment description"
                                className="glass-input text-sm py-2 w-full rounded-lg px-3"
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Amount</p>
                              <div className="flex items-center gap-2">
                                <select
                                  value={cost.currency}
                                  onChange={(e) => updateCost(cost.id, 'extra', { currency: e.target.value as 'USD' | 'PEN' })}
                                  className="glass-input rounded-lg py-2 px-2 text-sm bg-[#0a0a0a] text-white appearance-none"
                                >
                                  <option value="PEN">PEN</option>
                                  <option value="USD">USD</option>
                                </select>
                                <input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  value={cost.amount || ''}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    if (val === '') {
                                      updateCost(cost.id, 'extra', { amount: 0 })
                                    } else {
                                      updateCost(cost.id, 'extra', { amount: parseFloat(val) || 0 })
                                    }
                                  }}
                                  className="flex-1 glass-input text-sm py-2 font-bold rounded-lg px-3"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end mt-3">
                            <button
                              onClick={() => removeCost(cost.id, 'extra')}
                              className="text-red-400/60 hover:text-red-400 font-bold text-xs tracking-tight transition-all flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addExtraCost({ category: costCategory.category, description: '', amount: 0, currency: 'PEN', exchangeRate: null, voucherUrl: null })}
                      className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase hover:text-primary/80 transition-all ml-2 group/add"
                    >
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover/add:scale-110 transition-all">
                        <Plus size={14} />
                      </div>
                      + Add another payment
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
