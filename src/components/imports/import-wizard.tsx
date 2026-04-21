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
  Eye,
  Package,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AddProductModal } from '@/components/ui/add-product-modal'
import { SmartCombobox } from '@/components/ui/smart-combobox'
import { GlassDatePicker } from '@/components/ui/glass-date-picker'
import { useImportWizardStore } from '@/stores/import-wizard-store'
import { createImport } from '@/app/actions/import-actions'
import { searchProducts } from '@/app/actions/product-actions'
import { uploadFileToStorage } from '@/lib/storage'

const STEPS = [
  { step: 1, label: 'Info Básica' },
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
    brand?: string
    model?: string
    category: string
  }>
  productOptions?: {
    brands: string[]
    categories: string[]
  }
}

interface ProductComboboxProps {
  value: string
  onChange: (productId: string, data: { sku: string, name: string, brand?: string, model?: string, category: string, imageUrl?: string }) => void
  products: Array<{ id: string, name: string, sku: string, brand?: string, model?: string, category: string, imageUrl?: string }>
  disabledOptions?: string[]
}

function ProductCombobox({ value, onChange, products, disabledOptions = [] }: ProductComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Array<{ id: string, name: string, sku: string, brand?: string, model?: string, category: string, imageUrl?: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedProduct = products.find(p => p.id === value)

  useEffect(() => {
    if (search.length < 2) {
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
          brand: p.brand ?? undefined,
          model: p.model ?? undefined,
          category: p.category,
          imageUrl: p.imageUrl ?? undefined
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

  const formatProductName = (p: { name: string; brand?: string; model?: string }) => {
    const parts = []
    if (p.brand) parts.push(p.brand)
    parts.push(p.name)
    if (p.model) parts.push(`- ${p.model}`)
    return parts.join(' ')
  }

  const handleSelect = (product: { id: string, name: string, sku: string, brand?: string, model?: string, category: string, imageUrl?: string }) => {
    onChange(product.id, { sku: product.sku, name: product.name, brand: product.brand, model: product.model, category: product.category, imageUrl: product.imageUrl })
    setSearch('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={isOpen ? search : (selectedProduct ? formatProductName(selectedProduct) : '')}
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
              <div className="max-h-48 overflow-y-auto divide-y divide-border/20 bg-gray-950">
                {results.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className="w-full px-3 py-3 text-left hover:bg-foreground/5 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {product.brand && (
                          <span className="px-1.5 py-0.5 rounded-md bg-cyan-950/50 text-cyan-400 border border-cyan-900/50 text-[10px] font-medium">
                            {product.brand}
                          </span>
                        )}
                        {product.model && (
                          <span className="text-[10px] text-gray-300 truncate">{product.model}</span>
                        )}
                        <span className="text-[10px] text-gray-500">{product.category}</span>
                      </div>
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

export function ImportWizard({ onClose, onComplete, providers, products, productOptions }: ImportWizardProps) {
  const { draft, initDraft, updateBasicInfo, addProduct, removeProduct, updateProduct, addInternalCost, addExtraCost, removeCost, updateCost, addDocument, removeDocument, resetDraft, setStep, setDelivered } = useImportWizardStore()
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

    const validProducts = draft.products.filter(p => !p.productId.startsWith('temp-'))

    if (validProducts.length === 0) {
      setError('Debes agregar al menos un producto válido a la importación.')
      return
    }

    if (!draft.provider) {
      setError('Debes seleccionar un proveedor.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const tempImportId = `import-${Date.now()}`
      const documentsFolder = `imports/${tempImportId}`

      const uploadedDocuments = await Promise.all(
        draft.documents.map(async (doc) => {
          if (doc.url.startsWith('blob:') || doc.url.startsWith('data:')) {
            const response = await fetch(doc.url)
            const blob = await response.blob()
            const realUrl = await uploadFileToStorage('documents', documentsFolder, blob, doc.name)
            return { type: doc.type, url: realUrl, name: doc.name }
          }
          return doc
        })
      )

      const allCosts = [...draft.internalCosts, ...draft.extraCosts]
      const uploadedCosts = await Promise.all(
        allCosts.map(async (cost) => {
          if (cost.voucherUrl && (cost.voucherUrl.startsWith('blob:') || cost.voucherUrl.startsWith('data:'))) {
            const response = await fetch(cost.voucherUrl)
            const blob = await response.blob()
            const fileName = cost.fileName || `voucher-${cost.category}-${Date.now()}`
            const realUrl = await uploadFileToStorage('documents', documentsFolder, blob, fileName)
            return { ...cost, voucherUrl: realUrl }
          }
          return cost
        })
      )

      const internalCostsUploaded = uploadedCosts.slice(0, draft.internalCosts.length)
      const extraCostsUploaded = uploadedCosts.slice(draft.internalCosts.length)

      await createImport({
        provider: draft.provider,
        piNumber: draft.piNumber,
        eta: draft.eta ?? undefined,
        exchangeRate: draft.exchangeRate,
        items: validProducts.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          unitPriceUsd: p.unitPriceUsd
        })),
        internalCosts: internalCostsUploaded.map(c => ({
          category: c.category,
          description: c.description,
          amount: c.amount,
          currency: c.currency,
          exchangeRate: c.exchangeRate ?? undefined,
          voucherUrl: c.voucherUrl ?? undefined
        })),
        extraCosts: extraCostsUploaded.map(c => ({
          category: c.category,
          description: c.description,
          amount: c.amount,
          currency: c.currency,
          exchangeRate: c.exchangeRate ?? undefined,
          voucherUrl: c.voucherUrl ?? undefined
        })),
        documents: uploadedDocuments.map(d => ({
          type: d.type,
          url: d.url,
          name: d.name
        })),
        delivered: draft.delivered
      })
      resetDraft()
      await Swal.fire({
        title: 'Importación Registrada',
        text: `La importación ${draft.piNumber} ha sido creada exitosamente.`,
        icon: 'success',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#00f7ff',
        confirmButtonText: 'Ver Importaciones',
        toast: true,
        position: 'top-end',
        showConfirmButton: true,
        timer: undefined,
        customClass: {
          popup: 'glass-panel',
          confirmButton: 'sweetalert-confirm-btn',
        }
      })
      onComplete()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la importación.'
      setError(message)
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProductCreated = (product: { id: string, name: string, sku: string, brand?: string, model?: string, category: string, imageUrl?: string }) => {
    addProduct({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      model: product.model,
      category: product.category,
      imageUrl: product.imageUrl,
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

      <AddProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onCreated={handleProductCreated}
        brands={productOptions?.brands || []}
        categories={productOptions?.categories || []}
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
      <div className="glass-panel p-12 rounded-[2.5rem] border-border relative overflow-visible">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-12 py-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">Información Básica de Importación</h3>
            <p className="text-muted-foreground text-sm">Ingresa los datos principales para iniciar el seguimiento de la importación.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <SmartCombobox
                label="Nombre del Proveedor *"
                value={draft.provider}
                onChange={(val) => updateBasicInfo({ provider: val })}
                options={providers}
                placeholder="Buscar o crear proveedor..."
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Número de Factura Proforma (PI) *</label>
              <input
                type="text"
                required
                value={draft.piNumber}
                onChange={(e) => updateBasicInfo({ piNumber: e.target.value })}
                placeholder="Ej. PI-2024-882"
                className="w-full glass-input rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-3">
              <GlassDatePicker
                label="Fecha Estimada de Llegada (ETA)"
                value={draft.eta}
                onChange={(val) => updateBasicInfo({ eta: val })}
                placeholder="Seleccionar fecha..."
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tipo de Cambio Inicial</label>
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
    </motion.div>
  )
}

function StepProducts({ products, onOpenNewProductModal }: { products: Array<{ id: string, name: string, sku: string, brand?: string, model?: string, category: string }>, onOpenNewProductModal: () => void }) {
  const { draft, addProduct, removeProduct, updateProduct, addInternalCost, removeCost, updateCost } = useImportWizardStore()

  if (!draft) return null

  const handleAddRow = () => {
    addProduct({
      productId: `temp-${Date.now()}`,
      sku: '',
      name: '',
      brand: undefined,
      model: undefined,
      category: '',
      imageUrl: undefined,
      quantity: 1,
      unitPriceUsd: 0
    })
  }

  const handleProductSelect = (currentProductId: string, newProductId: string, data: { sku: string, name: string, brand?: string, model?: string, category: string, imageUrl?: string }) => {
    updateProduct(currentProductId, {
      productId: newProductId,
      sku: data.sku,
      name: data.name,
      brand: data.brand,
      model: data.model,
      category: data.category,
      imageUrl: data.imageUrl
    })
  }

  const formatProductName = (p: { name: string; brand?: string; model?: string }) => {
    const parts = []
    if (p.brand) parts.push(p.brand)
    parts.push(p.name)
    if (p.model) parts.push(`- ${p.model}`)
    return parts.join(' ')
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
          <h3 className="text-xl font-bold tracking-tight">Items de Factura Proforma</h3>
          <p className="text-muted-foreground text-sm">Ingresa los items tal como aparecen en la proforma de tu proveedor.</p>
        </div>
        <button
          onClick={onOpenNewProductModal}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 text-primary border border-primary/30 font-bold text-sm tracking-tight neon-border hover:bg-primary/20 transition-all"
        >
          <Plus size={18} />
          Agregar Producto Nuevo
        </button>
      </div>

      <div className="glass-panel rounded-3xl border-border/30 overflow-visible relative z-20">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-foreground/5 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-bold">
              <th className="px-4 py-4 w-16">Foto</th>
              <th className="px-4 py-4 w-[35%]">Producto</th>
              <th className="px-4 py-4 w-[20%]">Modelo / Categoría</th>
              <th className="px-4 py-4 text-center w-28">Cantidad</th>
              <th className="px-4 py-4 text-right w-28">Precio Unit. (USD)</th>
              <th className="px-4 py-4 text-right w-28">Total (USD)</th>
              <th className="px-4 py-4 text-center w-16">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {draft.products.map((p) => (
              <tr key={p.productId} className="hover:bg-foreground/[0.02] transition-colors">
                <td className="px-4 py-4">
                  <div className="w-12 h-12 rounded-lg bg-card border border-border overflow-hidden flex items-center justify-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={16} className="text-muted-foreground/30" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="relative">
                    <ProductCombobox
                      value={p.productId}
                      onChange={(productId, data) => {
                        if (p.productId.startsWith('temp-')) {
                          updateProduct(p.productId, { productId, sku: data.sku, name: data.name, brand: data.brand, model: data.model, category: data.category, imageUrl: data.imageUrl })
                        } else {
                          handleProductSelect(p.productId, productId, data)
                        }
                      }}
                      products={products}
                    />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    {p.model ? (
                      <>
                        <span className="text-sm font-bold text-cyan-400 truncate">{p.model}</span>
                        <div className="flex items-center gap-2">
                          {p.brand && (
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[10px] text-primary font-medium">{p.brand}</span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-foreground/5 text-[10px] uppercase tracking-wider text-gray-500">{p.category}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Sin modelo</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <input
                    type="number"
                    step="0.01"
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
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-muted-foreground text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={p.unitPriceUsd === 0 ? '' : p.unitPriceUsd}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '' || val === '0') {
                          updateProduct(p.productId, { unitPriceUsd: 0 })
                        } else {
                          updateProduct(p.productId, { unitPriceUsd: parseFloat(val) || 0 })
                        }
                      }}
                      className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 w-24 text-right"
                    />
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm font-black text-foreground">
                    ${(p.quantity * p.unitPriceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
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
        Agregar fila
      </button>

      <div className="glass-panel p-6 rounded-3xl border-border/30 space-y-6 relative z-10">
          <div className="flex items-center gap-2 text-primary">
            <Truck size={18} />
            <h4 className="text-sm font-bold uppercase tracking-widest">Costos Internos del Proveedor (Ej. Flete Local)</h4>
          </div>

          <div className="space-y-4">
            {draft.internalCosts.map((cost, idx) => (
              <div key={cost.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-6 items-end">
                <div className="space-y-2">
                  {idx === 0 && <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descripción del Costo</label>}
                  <input
                    type="text"
                    value={cost.description}
                    onChange={(e) => updateCost(cost.id, 'internal', { description: e.target.value })}
                    placeholder="Ej. Flete local al puerto"
                    className="w-full glass-input rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  {idx === 0 && <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Monto (USD)</label>}
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
          onClick={() => addInternalCost({ category: 'PROVIDER', date: new Date().toISOString().split('T')[0], description: '', amount: 0, currency: 'USD', exchangeRate: null, voucherUrl: null, fileName: null })}
          className="flex items-center gap-2 text-primary font-bold text-sm tracking-tight hover:text-primary/80 transition-all drop-shadow-[0_0_10px_rgba(0,247,255,0.3)] w-fit"
        >
          <Plus size={14} />
          Agregar otro costo del proveedor
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6">
        <div className="glass-panel px-8 py-6 rounded-[2rem] flex items-center gap-6 border-primary/30 bg-primary/5 shadow-[0_0_40px_rgba(0,247,255,0.1)]">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary neon-glow">
            <DollarSign size={28} />
          </div>
            <div>
            <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-black mb-1">Total General Proforma (USD)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-foreground tracking-tighter">
                ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-muted-foreground font-bold uppercase">Total Productos + Costos del Proveedor</span>
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
            <h3 className="text-xl font-bold tracking-tight mb-2">Documentación de la Importación</h3>
            <p className="text-muted-foreground text-sm">Sube archivos relacionados: PDFs, Imágenes, Excel, Videos.</p>
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
                  <p className="text-lg font-bold text-foreground mb-2">Arrastrar y Soltar</p>
                  <p className="text-sm text-muted-foreground">Haz clic para seleccionar archivos: PDFs, Imágenes, Excel, Videos</p>
                </div>
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Archivos Subidos</h4>
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
                  <p className="text-sm text-muted-foreground">No hay archivos subidos.</p>
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
  const { draft, addExtraCost, removeCost, updateCost, setDelivered, setExpandedCostId } = useImportWizardStore()
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  if (!draft) return null

  const isExpanded = (costId: string) => draft.expandedCostId === costId

  const handleToggleExpand = (costId: string) => {
    if (draft.expandedCostId === costId) {
      setExpandedCostId(null)
    } else {
      setExpandedCostId(costId)
    }
  }

  const handleAddCost = (category: 'SHIPPING' | 'CUSTOMS' | 'MOBILITY') => {
    const today = new Date().toISOString().split('T')[0]
    addExtraCost({
      category,
      date: today,
      description: '',
      amount: 0,
      currency: 'PEN',
      exchangeRate: null,
      voucherUrl: null,
      fileName: null
    })
  }

  const handleFileChange = (costId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateCost(costId, 'extra', {
        fileName: file.name,
        voucherUrl: URL.createObjectURL(file)
      })
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'PEN') {
      return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
            <h3 className="text-xl font-bold tracking-tight mb-2">Costos Logísticos Extra</h3>
            <p className="text-muted-foreground text-sm">Registra todos los gastos adicionales en PEN para calcular el costo final de importación.</p>
          </div>

          <div className="flex flex-col gap-8">
            {[
              { label: '1. Flete', icon: Ship, category: 'SHIPPING' as const },
              { label: '2. Aduanas', icon: DollarSign, category: 'CUSTOMS' as const },
              { label: '3. Movilidad', icon: Truck, category: 'MOBILITY' as const }
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

                    <div className="space-y-3">
                      {categoryCosts.map((cost) => (
                        <div key={cost.id} className="bg-gray-950/50 border border-border/20 rounded-xl overflow-hidden">
                          {isExpanded(cost.id) ? (
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Voucher / Comprobante</p>
                                  <input
                                    ref={(el) => { fileInputRefs.current[cost.id] = el }}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange(cost.id, e)}
                                    className="hidden"
                                  />
                                  <button
                                    onClick={() => fileInputRefs.current[cost.id]?.click()}
                                    className="w-full border-2 border-dashed border-border/40 rounded-xl py-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
                                  >
                                    {cost.fileName ? (
                                      <>
                                        <FileText size={24} className="text-primary" />
                                        <span className="text-sm font-medium text-foreground">{cost.fileName}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Upload size={24} />
                                        <span className="text-sm">Subir voucher</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Fecha de Pago</p>
                                    <input
                                      type="date"
                                      value={cost.date}
                                      onChange={(e) => updateCost(cost.id, 'extra', { date: e.target.value })}
                                      className="w-full glass-input rounded-xl py-2.5 px-4 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Monto</p>
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={cost.currency}
                                        onChange={(e) => updateCost(cost.id, 'extra', { currency: e.target.value as 'USD' | 'PEN' })}
                                        className="glass-input rounded-xl py-2.5 px-3 text-sm bg-[#0a0a0a] text-white appearance-none"
                                      >
                                        <option value="PEN">PEN</option>
                                        <option value="USD">USD</option>
                                      </select>
<input
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={cost.amount === 0 ? '' : cost.amount}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          if (val === '' || val === '0') {
                                            updateCost(cost.id, 'extra', { amount: 0 })
                                          } else {
                                            updateCost(cost.id, 'extra', { amount: parseFloat(val) || 0 })
                                          }
                                        }}
                                        className="flex-1 glass-input rounded-xl py-2.5 px-4 text-sm font-bold"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Descripción</p>
                                    <input
                                      type="text"
                                      value={cost.description}
                                      onChange={(e) => updateCost(cost.id, 'extra', { description: e.target.value })}
                                      placeholder="Descripción del pago"
                                      className="w-full glass-input rounded-xl py-2.5 px-4 text-sm"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/20">
                                <button
                                  onClick={() => removeCost(cost.id, 'extra')}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-bold text-sm transition-all"
                                >
                                  <Trash2 size={14} />
                                  Eliminar
                                </button>
                                <button
                                  onClick={() => setExpandedCostId(null)}
                                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 font-bold text-sm transition-all"
                                >
                                  <CheckCircle size={14} />
                                  Guardar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                              onClick={() => handleToggleExpand(cost.id)}
                            >
                              <div className="flex items-center gap-6">
                                <span className="text-xs font-medium text-muted-foreground w-24">
                                  {cost.date ? new Date(cost.date + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : 'Sin fecha'}
                                </span>
                                <span className="text-sm font-medium text-foreground flex-1">
                                  {cost.description || 'Sin descripción'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-primary">
                                  {formatCurrency(cost.amount, cost.currency)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleToggleExpand(cost.id)
                                  }}
                                  className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                >
                                  <Eye size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleAddCost(costCategory.category)}
                      className="flex items-center gap-2 text-primary font-bold text-sm tracking-tight hover:text-primary/80 transition-all group/add"
                    >
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover/add:scale-110 transition-all">
                        <Plus size={14} />
                      </div>
                      Agregar otro pago
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="glass-panel p-6 rounded-2xl border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle size={24} className="text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Marcar como Entregado</h4>
                  <p className="text-muted-foreground text-xs">Al activar, el stock se injectará inmediatamente a inventario</p>
                </div>
              </div>
              <button
                onClick={() => setDelivered(!draft.delivered)}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-all duration-300",
                  draft.delivered ? "bg-emerald-500 neon-glow" : "bg-foreground/20"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300",
                    draft.delivered ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
