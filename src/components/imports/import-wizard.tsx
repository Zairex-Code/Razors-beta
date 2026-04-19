'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useImportWizardStore } from '@/stores/import-wizard-store'
import { createImport } from '@/app/actions/import-actions'

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

export function ImportWizard({ onClose, onComplete, providers, products }: ImportWizardProps) {
  const { draft, initDraft, updateBasicInfo, addProduct, removeProduct, updateProduct, addInternalCost, addExtraCost, removeCost, updateCost, addDocument, removeDocument, resetDraft, setStep } = useImportWizardStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
              <StepProducts key="step2" products={products} />
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
            <h3 className="text-2xl font-bold tracking-tight">Información Básica de Importación</h3>
            <p className="text-muted-foreground text-sm">Provide the core details to initialize the import tracking.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre del Proveedor</label>
              <select
                value={draft.provider}
                onChange={(e) => updateBasicInfo({ provider: e.target.value })}
                className="w-full glass-input rounded-2xl py-4 px-5 text-sm appearance-none cursor-pointer bg-background/20 focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">Seleccionar proveedor...</option>
                {providers.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Número de Factura Proforma (PI)</label>
              <Input
                type="text"
                value={draft.piNumber}
                onChange={(e) => updateBasicInfo({ piNumber: e.target.value })}
                placeholder="e.g. PI-2024-882"
                className="w-full glass-input rounded-2xl py-4 px-5 text-sm"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Fecha Estimada de Llegada (ETA)</label>
              <Input
                type="date"
                value={draft.eta ?? ''}
                onChange={(e) => updateBasicInfo({ eta: e.target.value || null })}
                className="w-full glass-input rounded-2xl py-4 px-5 text-sm cursor-pointer"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tipo de Cambio Inicial</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] font-bold">PEN/USD</span>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.exchangeRate}
                  onChange={(e) => updateBasicInfo({ exchangeRate: parseFloat(e.target.value) || 3.8 })}
                  placeholder="3.75"
                  className="w-full glass-input rounded-2xl py-4 pl-24 pr-5 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StepProducts({ products }: { products: Array<{ id: string, name: string, sku: string, category: string }> }) {
  const { draft, addProduct, removeProduct, updateProduct, addInternalCost, removeCost, updateCost } = useImportWizardStore()
  const [newProductId, setNewProductId] = useState('')
  const [newQuantity, setNewQuantity] = useState(1)
  const [newUnitPrice, setNewUnitPrice] = useState(0)

  if (!draft) return null

  const handleAddProduct = () => {
    if (!newProductId) return
    const selectedProduct = products.find(p => p.id === newProductId)
    if (!selectedProduct) return

    addProduct({
      productId: selectedProduct.id,
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      category: selectedProduct.category,
      quantity: newQuantity,
      unitPriceUsd: newUnitPrice
    })
    setNewProductId('')
    setNewQuantity(1)
    setNewUnitPrice(0)
  }

  const productsTotal = draft.products.reduce((acc, p) => acc + (p.quantity * p.unitPriceUsd), 0)
  const internalTotal = draft.internalCosts.reduce((acc, c) => {
    const amountInUsd = c.currency === 'USD' ? c.amount : c.amount / (c.exchangeRate ?? draft.exchangeRate)
    return acc + amountInUsd
  }, 0)
  const grandTotal = productsTotal + internalTotal

  const selectedProductData = products.find(p => p.id === newProductId)

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
          <p className="text-muted-foreground text-sm">Selecciona productos del inventario existente.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border-border/30 space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Agregar Producto del Inventario</h4>
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Producto</label>
            <select
              value={newProductId}
              onChange={(e) => {
                setNewProductId(e.target.value)
                setNewUnitPrice(0)
              }}
              className="w-full glass-input rounded-xl py-3 px-4 text-sm appearance-none cursor-pointer bg-background/20"
            >
              <option value="">Seleccionar producto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cantidad</label>
            <Input
              type="number"
              min={1}
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
              className="glass-input rounded-xl py-3 px-4 text-sm font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Precio Unit. (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={newUnitPrice}
                onChange={(e) => setNewUnitPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full glass-input rounded-xl py-3 pl-8 pr-4 text-sm font-bold"
              />
            </div>
          </div>
          <Button
            onClick={handleAddProduct}
            disabled={!newProductId}
            className="bg-primary text-primary-foreground neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={18} />
          </Button>
        </div>
        {selectedProductData && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span className="font-mono text-primary">{selectedProductData.sku}</span>
            <span className="px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/60 uppercase tracking-wider">{selectedProductData.category}</span>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border-border/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-foreground/5 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-bold">
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">SKU / Categoría</th>
              <th className="px-6 py-4 text-center">Cantidad</th>
              <th className="px-6 py-4 text-right">Precio Unit. (USD)</th>
              <th className="px-6 py-4 text-right">Total (USD)</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {draft.products.map((p) => (
              <tr key={p.productId} className="hover:bg-foreground/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold">{p.name}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary">{p.sku}</span>
                    <span className="px-2 py-0.5 rounded-md bg-foreground/5 text-[10px] uppercase tracking-wider text-muted-foreground">{p.category}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <Input
                    type="number"
                    min={1}
                    value={p.quantity}
                    onChange={(e) => updateProduct(p.productId, { quantity: parseInt(e.target.value) || 0 })}
                    className="bg-foreground/5 border border-border/50 rounded-lg py-1 px-2 text-sm font-bold w-20 text-center mx-auto"
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-muted-foreground text-xs">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={p.unitPriceUsd}
                      onChange={(e) => updateProduct(p.productId, { unitPriceUsd: parseFloat(e.target.value) || 0 })}
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
            {draft.products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm">
                  No hay productos agregados. Selecciona productos del inventario para agregar a esta importación.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="glass-panel p-6 rounded-3xl border-border/30 space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Truck size={18} />
          <h4 className="text-sm font-bold uppercase tracking-widest">Costos Internos del Proveedor (e.g., Flete Local)</h4>
        </div>

        <div className="space-y-4">
          {draft.internalCosts.map((cost) => (
            <div key={cost.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descripción</label>
                <Input
                  type="text"
                  value={cost.description}
                  onChange={(e) => updateCost(cost.id, 'internal', { description: e.target.value })}
                  placeholder="e.g. Flete Local al Puerto"
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Monto</label>
                <div className="flex items-center gap-2">
                  <select
                    value={cost.currency}
                    onChange={(e) => updateCost(cost.id, 'internal', { currency: e.target.value as 'USD' | 'PEN' })}
                    className="glass-input rounded-xl py-3 px-2 text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="PEN">PEN</option>
                  </select>
                  <Input
                    type="number"
                    value={cost.amount}
                    onChange={(e) => updateCost(cost.id, 'internal', { amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="flex-1 glass-input rounded-xl py-3 px-4 text-sm font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tipo de Cambio</label>
                <Input
                  type="number"
                  step="0.01"
                  value={cost.exchangeRate ?? draft.exchangeRate}
                  onChange={(e) => updateCost(cost.id, 'internal', { exchangeRate: parseFloat(e.target.value) || undefined })}
                  placeholder="3.75"
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm"
                />
              </div>
              <button
                onClick={() => removeCost(cost.id, 'internal')}
                className="p-3 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all mb-0.5"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

        <Button
          onClick={() => addInternalCost({ category: 'PROVIDER', description: '', amount: 0, currency: 'USD', exchangeRate: null, voucherUrl: null })}
          variant="ghost"
          className="flex items-center gap-2 text-primary font-bold text-sm tracking-tight hover:text-primary/80 transition-all drop-shadow-[0_0_10px_rgba(0,247,255,0.3)] w-fit"
        >
          <Plus size={14} />
          + Agregar otro costo del proveedor
        </Button>
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
              <span className="text-[10px] text-muted-foreground font-bold uppercase">Total Productos + Costos Internos</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StepDocuments() {
  const { draft, addDocument, removeDocument } = useImportWizardStore()

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
            <h3 className="text-xl font-bold tracking-tight mb-2">Documentación de Importación</h3>
            <p className="text-muted-foreground text-sm">Sube cualquier archivo relacionado: PDFs, Imágenes, Excel, Videos.</p>
          </div>

          <div className="space-y-8">
            <div className="group relative">
              <div className="absolute -inset-1 bg-primary/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative border-2 border-dashed border-primary/20 rounded-[2rem] p-20 flex flex-col items-center justify-center gap-6 bg-foreground/[0.02] hover:bg-foreground/[0.04] hover:border-primary/40 transition-all cursor-pointer group">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500 neon-glow">
                  <Upload size={32} />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground mb-2">Arrastra y Suelta</p>
                  <p className="text-sm text-muted-foreground">Cualquier archivo: PDFs, Imágenes, Excel, Videos</p>
                </div>
              </div>
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
            <h3 className="text-xl font-bold tracking-tight mb-2">Costos Extra Logísticos</h3>
            <p className="text-muted-foreground text-sm">Registra todos los gastos adicionales en PEN para calcular el costo landed final.</p>
          </div>

          <div className="flex flex-col gap-8">
            {[
              { label: '1. Shipping', icon: Ship, category: 'SHIPPING' as const },
              { label: '2. Customs', icon: DollarSign, category: 'CUSTOMS' as const },
              { label: '3. Mobility', icon: Truck, category: 'MOBILITY' as const }
            ].map((costCategory) => {
              const categoryCosts = draft.extraCosts.filter(c => c.category === costCategory.category)
              const categoryTotal = categoryCosts.reduce((acc, c) => {
                const amountInPen = c.currency === 'PEN' ? c.amount : c.amount * (c.exchangeRate ?? draft.exchangeRate)
                return acc + amountInPen
              }, 0)

              return (
                <div key={costCategory.category} className="glass-card p-8 rounded-[2rem] border-border/20 hover:border-primary/30 transition-all group">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500">
                          <costCategory.icon size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-foreground">{costCategory.label}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total</p>
                        <p className="text-xl font-black text-primary">S/ {categoryTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {categoryCosts.map((cost) => (
                        <div key={cost.id} className="glass-panel bg-foreground/[0.02] border-none rounded-xl p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Fecha</p>
                                <p className="text-sm font-semibold">{new Date().toLocaleDateString('es-PE')}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Descripción</p>
                                <Input
                                  type="text"
                                  value={cost.description}
                                  onChange={(e) => updateCost(cost.id, 'extra', { description: e.target.value })}
                                  placeholder="Descripción del pago"
                                  className="glass-input text-sm py-2"
                                />
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Monto</p>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={cost.currency}
                                    onChange={(e) => updateCost(cost.id, 'extra', { currency: e.target.value as 'USD' | 'PEN' })}
                                    className="glass-input rounded-lg py-2 px-2 text-sm"
                                  >
                                    <option value="PEN">PEN</option>
                                    <option value="USD">USD</option>
                                  </select>
                                  <Input
                                    type="number"
                                    value={cost.amount}
                                    onChange={(e) => updateCost(cost.id, 'extra', { amount: parseFloat(e.target.value) || 0 })}
                                    className="flex-1 glass-input text-sm py-2 font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeCost(cost.id, 'extra')}
                              className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all"
                            >
                              <Trash2 size={16} />
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
                      + Agregar otro pago
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