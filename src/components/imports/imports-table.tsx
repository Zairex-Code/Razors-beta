'use client'

import { useState, useMemo, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Search,
  Ship,
  Truck,
  CheckCircle,
  Clock,
  MoreHorizontal,
  ChevronDown,
  Trash2,
  Eye,
  Download,
  Paperclip,
  Plus,
  Loader2,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { Input } from '@/components/ui/input'
import { updateImportStatus, deleteImport, deleteDocument, clearCostVoucher } from '@/app/actions/import-actions'
import type { ImportStatus } from '@prisma/client'

interface ImportItem {
  id: string
  quantity: number
  unitPriceUsd: number
  product: {
    id: string
    name: string
    sku: string
  }
}

interface ImportCost {
  id: string
  category: string
  description: string
  amount: number
  currency: string
  exchangeRate: number | null
  voucherUrl: string | null
}

interface ImportDocument {
  id: string
  type: string
  url: string
}

interface Import {
  id: string
  provider: string
  piNumber: string
  eta: string | Date | null
  exchangeRate: number
  status: ImportStatus
  createdAt: Date | string
  items: ImportItem[]
  costs: ImportCost[]
  documents: ImportDocument[]
}

interface ImportsTableProps {
  imports: Import[]
  onStatusChange?: (importId: string, newStatus: ImportStatus) => void
  isProcessing?: boolean
}

const STATUS_CONFIG = {
  PLANNING: { label: 'Planificación', icon: Clock, color: 'bg-foreground/5 text-muted-foreground border-border' },
  DISPATCHED: { label: 'Despachado', icon: Truck, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  IN_TRANSIT: { label: 'En Tránsito', icon: Ship, color: 'bg-primary/10 text-primary border-primary/20' },
  DELIVERED: { label: 'Entregado', icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

const STATUS_SELECT_CLASSES = {
  PLANNING: 'bg-gray-800/50 text-gray-300 border-gray-600',
  DISPATCHED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  IN_TRANSIT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  DELIVERED: 'bg-green-500/10 text-green-400 border-green-500/30',
}

const TIMELINE_STEPS = ['PLANNING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED']

type UnifiedDocument = {
  id: string
  url: string
  typeLabel: string
  source: 'document' | 'voucher'
  originalId: string
}

const COST_CATEGORY_LABELS: Record<string, string> = {
  SHIPPING: 'Flete',
  CUSTOMS: 'Aduanas',
  MOBILITY: 'Movilidad',
  PROVIDER: 'Proveedor',
}

function getUnifiedDocuments(imp: Import): UnifiedDocument[] {
  const docs: UnifiedDocument[] = []

  for (const doc of imp.documents) {
    const typeLabel = doc.type === 'PI' ? 'Proforma Invoice' :
                      doc.type === 'CI' ? 'Factura Comercial' :
                      doc.type === 'PL' ? 'Packing List' :
                      doc.type === 'BL' ? 'Bill of Lading' :
                      `Documento: ${doc.type}`
    docs.push({
      id: `doc-${doc.id}`,
      url: doc.url,
      typeLabel,
      source: 'document',
      originalId: doc.id,
    })
  }

  for (const cost of imp.costs) {
    if (cost.voucherUrl) {
      const categoryLabel = COST_CATEGORY_LABELS[cost.category] || cost.category
      docs.push({
        id: `cost-${cost.id}`,
        url: cost.voucherUrl,
        typeLabel: `Voucher: ${categoryLabel}`,
        source: 'voucher',
        originalId: cost.id,
      })
    }
  }

  return docs
}

export function ImportsTable({ imports, onStatusChange, isProcessing = false }: ImportsTableProps) {
  const [search, setSearch] = useState('')
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [uploadingDocs, setUploadingDocs] = useState<string | null>(null)

  const filteredImports = imports.filter(
    (imp) =>
      imp.provider.toLowerCase().includes(search.toLowerCase()) ||
      imp.piNumber.toLowerCase().includes(search.toLowerCase())
  )

  const getStepStatus = (statusLabel: ImportStatus, stepLabel: ImportStatus) => {
    const statuses = TIMELINE_STEPS as ImportStatus[]
    const currentIdx = statuses.indexOf(statusLabel)
    const stepIdx = statuses.indexOf(stepLabel)
    if (stepIdx < currentIdx) return 'completed'
    if (stepIdx === currentIdx) return 'active'
    return 'pending'
  }

  const timelineProgress = useMemo(() => {
    const activeImport = selectedImportId ? filteredImports.find(imp => imp.id === selectedImportId) : filteredImports[0]
    if (activeImport?.status) {
      return (Math.max(0, TIMELINE_STEPS.indexOf(activeImport.status as ImportStatus)) / 3) * 100
    }
    return 0
  }, [filteredImports])

  const handleStatusChange = async (importId: string, newStatus: ImportStatus) => {
    if (!onStatusChange) return
    const result = await Swal.fire({
      title: '¿Cambiar Estado?',
      text: `El estado cambiará a "${STATUS_CONFIG[newStatus].label}".`,
      icon: 'question',
      background: '#0a0a0a',
      color: '#ffffff',
      showCancelButton: true,
      confirmButtonColor: '#00f7ff',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'glass-panel',
      }
    })
    if (!result.isConfirmed) return
    onStatusChange(importId, newStatus)
  }

  const handleDelete = async (importId: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar Importación?',
      text: 'Esta acción eliminará todos los productos y costos asociados. Esta operación no se puede deshacer.',
      icon: 'warning',
      background: '#0a0a0a',
      color: '#ffffff',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'glass-panel',
      }
    })

    if (!result.isConfirmed) return

    startTransition(async () => {
      try {
        await deleteImport(importId)
        Swal.fire({
          title: 'Eliminada',
          text: 'La importación ha sido eliminada correctamente.',
          icon: 'success',
          background: '#0a0a0a',
          color: '#ffffff',
          confirmButtonColor: '#00f7ff',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
        })
      } catch (error) {
        console.error('Error deleting import:', error)
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la importación.',
          icon: 'error',
          background: '#0a0a0a',
          color: '#ffffff',
          confirmButtonColor: '#00f7ff',
        })
      }
    })
  }

  const handleUploadDocument = async (importId: string, file: File) => {
    setUploadingDocs(importId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('importId', importId)
      formData.append('type', file.name.split('.').pop() || 'document')

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      window.location.reload()
    } catch (error) {
      console.error('Error uploading document:', error)
    } finally {
      setUploadingDocs(null)
    }
  }

  const handleDeleteDocument = async (doc: UnifiedDocument) => {
    if (!confirm(`¿Eliminar "${doc.typeLabel}"?`)) return
    startTransition(async () => {
      try {
        if (doc.source === 'document') {
          await deleteDocument(doc.originalId)
        } else {
          await clearCostVoucher(doc.originalId)
        }
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={20} />
          <Input
            type="text"
            placeholder="Buscar por proveedor o número PI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-2xl py-3.5 pl-12 pr-4 text-sm"
          />
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        {filteredImports.length > 0 && (
          <div className="mb-12 relative z-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Pipeline de Importaciones</h3>
                <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1">
                  Viendo Detalles: {selectedImportId ?? 'Selecciona una importación'}
                </p>
              </div>
            </div>

            <div className="relative flex justify-between items-center px-4">
              <div className="absolute left-0 right-0 h-0.5 bg-foreground/10 top-1/2 -translate-y-1/2 z-0" />
              <div
                className="absolute left-0 h-0.5 bg-primary neon-glow top-1/2 -translate-y-1/2 z-0 transition-all duration-700"
                style={{
                  width: `${timelineProgress}%`
                }}
              />

              {[
                { label: 'Planificación', icon: Clock, status: 'PLANNING' as ImportStatus },
                { label: 'Despachado', icon: Truck, status: 'DISPATCHED' as ImportStatus },
                { label: 'En Tránsito', icon: Ship, status: 'IN_TRANSIT' as ImportStatus },
                { label: 'Entregado', icon: CheckCircle, status: 'DELIVERED' as ImportStatus }
              ].map((step, idx) => {
                const selectedImport = selectedImportId ? filteredImports.find(imp => imp.id === selectedImportId) : filteredImports[0]
                const status = selectedImport ? getStepStatus(selectedImport.status as ImportStatus, step.status) : 'pending'
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                      status === 'completed' ? "bg-primary border-primary text-primary-foreground neon-glow" :
                      status === 'active' ? "bg-background border-primary text-primary neon-border" :
                      "bg-background border-foreground/10 text-foreground/20"
                    )}>
                      <step.icon size={20} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      status === 'pending' ? "text-foreground/20" : "text-foreground"
                    )}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2 min-w-[800px]">
              <thead>
                <tr className="text-muted-foreground text-[10px] uppercase tracking-[0.25em] font-bold">
                  <th className="px-6 py-4">ID Importación</th>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4 text-right">Flete (USD)</th>
                  <th className="px-6 py-4 text-right">Aduanas (USD)</th>
                  <th className="px-6 py-4 text-right">Movilidad (USD)</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredImports.map((imp) => {
                  const isSelected = imp.id === selectedImportId
                  const shippingCost = imp.costs.filter(c => c.category === 'SHIPPING').reduce((acc, c) => acc + c.amount, 0)
                  const customsCost = imp.costs.filter(c => c.category === 'CUSTOMS').reduce((acc, c) => acc + c.amount, 0)
                  const mobilityCost = imp.costs.filter(c => c.category === 'MOBILITY').reduce((acc, c) => acc + c.amount, 0)

                  return (
                    <>
                      <tr
                        key={imp.id}
                        onClick={() => setSelectedImportId(isSelected ? null : imp.id)}
                        className={cn(
                          "cursor-pointer transition-all duration-300",
                          isSelected
                            ? "bg-primary/5 border border-primary/40 rounded-2xl"
                            : "bg-foreground/[0.03] border border-transparent hover:border-primary/20 rounded-2xl"
                        )}
                      >
                        <td className="px-6 py-4 rounded-l-2xl">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <ChevronDown size={14} className="text-primary transition-transform duration-300" />
                            )}
                            <span className={cn(
                              "font-mono text-xs font-bold",
                              isSelected ? "text-primary neon-glow" : "text-primary/70"
                            )}>
                              {imp.piNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-sm">{imp.provider}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium">${shippingCost.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium">${customsCost.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium">${mobilityCost.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <select
                            value={imp.status}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleStatusChange(imp.id, e.target.value as ImportStatus)
                            }}
                            disabled={isPending}
                            className={cn(
                              "rounded-lg px-3 py-1.5 text-sm font-medium outline-none min-w-[140px] cursor-pointer transition-colors border",
                              STATUS_SELECT_CLASSES[imp.status as keyof typeof STATUS_SELECT_CLASSES]
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {TIMELINE_STEPS.map((s) => (
                              <option key={s} value={s} style={{ backgroundColor: '#111', color: '#fff' }}>
                                {STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right rounded-r-2xl">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                            className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(imp.id)
                            }}
                            className="p-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all ml-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                      {isSelected && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <div className="w-full px-8 pb-8 pt-2">
                              <div className="glass-panel rounded-b-2xl border-x border-b border-primary/40 bg-primary/[0.02] p-6 space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
                                <div className="p-4 rounded-xl bg-foreground/5 border border-border/50 backdrop-blur-sm">
                                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Tipo de Cambio</p>
                                  <p className="text-sm font-bold text-foreground">PEN/USD {imp.exchangeRate.toFixed(2)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-foreground/5 border border-border/50 backdrop-blur-sm">
                                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Fecha ETA</p>
                                  <p className="text-sm font-bold text-foreground">
                                    {imp.eta ? format(new Date(imp.eta), 'dd/MM/yyyy', { locale: es }) : 'No especificada'}
                                  </p>
                                </div>
                                <div className="p-4 rounded-xl bg-foreground/5 border border-border/50 backdrop-blur-sm">
                                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Total Items</p>
                                  <p className="text-sm font-bold text-foreground">{imp.items.length} productos</p>
                                </div>
                                <div className="p-4 rounded-xl bg-foreground/5 border border-border/50 backdrop-blur-sm">
                                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Creado</p>
                                  <p className="text-sm font-bold text-foreground">
                                    {format(new Date(imp.createdAt), 'dd/MM/yyyy', { locale: es })}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-4 px-1">
                                  Productos de la Importación
                                </h5>
                                <div className="overflow-hidden rounded-2xl border border-border/30 bg-foreground/[0.02]">
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="bg-foreground/5 text-muted-foreground text-[9px] uppercase tracking-widest font-bold">
                                        <th className="px-6 py-3">SKU</th>
                                        <th className="px-6 py-3">Producto</th>
                                        <th className="px-6 py-3 text-center">Cantidad</th>
                                        <th className="px-6 py-3 text-right">Precio Unit. (USD)</th>
                                        <th className="px-6 py-3 text-right">Total (USD)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                      {imp.items.map((item) => (
                                        <tr key={item.id} className="hover:bg-foreground/[0.02] transition-colors">
                                          <td className="px-6 py-3.5 text-muted-foreground font-mono">{item.product.sku}</td>
                                          <td className="px-6 py-3.5 font-bold">{item.product.name}</td>
                                          <td className="px-6 py-3.5 text-center">{item.quantity}</td>
                                          <td className="px-6 py-3.5 text-right">${item.unitPriceUsd.toFixed(2)}</td>
                                          <td className="px-6 py-3.5 text-right font-black text-foreground">
                                            ${(item.quantity * item.unitPriceUsd).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {imp.costs.length > 0 && (
                                <div>
                                  <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-4 px-1">
                                    Desglose de Costos
                                  </h5>
                                  <div className="overflow-hidden rounded-2xl border border-border/30 bg-foreground/[0.02]">
                                    <table className="w-full text-left text-xs">
                                      <thead>
                                        <tr className="bg-foreground/5 text-muted-foreground text-[9px] uppercase tracking-widest font-bold">
                                          <th className="px-6 py-3">Categoría</th>
                                          <th className="px-6 py-3">Descripción</th>
                                          <th className="px-6 py-3 text-right">Monto</th>
                                          <th className="px-6 py-3 text-right">Total PEN</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border/20">
                                        {imp.costs.map((cost) => {
                                          const amountInPen = cost.currency === 'PEN'
                                            ? cost.amount
                                            : cost.amount * (cost.exchangeRate ?? imp.exchangeRate)
                                          return (
                                            <tr key={cost.id} className="hover:bg-foreground/[0.02] transition-colors">
                                              <td className="px-6 py-3.5">
                                                <span className={cn(
                                                  "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                                  cost.category === 'SHIPPING' ? "bg-blue-500/10 text-blue-400" :
                                                  cost.category === 'CUSTOMS' ? "bg-primary/10 text-primary" :
                                                  cost.category === 'MOBILITY' ? "bg-purple-500/10 text-purple-400" :
                                                  "bg-foreground/5 text-muted-foreground"
                                                )}>
                                                  {cost.category}
                                                </span>
                                              </td>
                                              <td className="px-6 py-3.5 text-muted-foreground">{cost.description || '-'}</td>
                                              <td className="px-6 py-3.5 text-right font-bold">
                                                {cost.currency === 'PEN' ? 'S/' : '$'}{cost.amount.toFixed(2)}
                                              </td>
                                              <td className="px-6 py-3.5 text-right font-black text-foreground">
                                                S/ {amountInPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              <div>
                                <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-4 px-1">
                                  Documentos Adjuntos
                                </h5>
                                <div className="space-y-2">
                                  {(() => {
                                    const allDocs = getUnifiedDocuments(imp)
                                    return allDocs.length === 0 ? (
                                      <div className="text-center py-6 text-muted-foreground text-xs">
                                        <Paperclip size={24} className="mx-auto mb-2 opacity-30" />
                                        No hay documentos adjuntos
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {allDocs.map((doc) => (
                                          <div
                                            key={doc.id}
                                            className="flex items-center justify-between px-4 py-3 rounded-xl bg-foreground/[0.02] border border-border/30 hover:border-primary/20 transition-colors"
                                          >
                                            <div className="flex items-center gap-3">
                                              <Paperclip size={14} className="text-primary/50" />
                                              <span className={cn(
                                                "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                                doc.source === 'document' ? "bg-primary/10 text-primary" : "bg-purple-500/10 text-purple-400"
                                              )}>
                                                {doc.typeLabel}
                                              </span>
                                              <span className="text-xs text-foreground/60 truncate max-w-[200px]">{doc.url.split('/').pop()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                              >
                                                <Eye size={14} />
                                              </a>
                                              <a
                                                href={doc.url}
                                                download
                                                className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                              >
                                                <Download size={14} />
                                              </a>
                                              <button
                                                onClick={() => handleDeleteDocument(doc)}
                                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )
                                  })()}
                                  <label className={cn(
                                    "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all text-xs text-muted-foreground hover:text-primary",
                                    uploadingDocs === imp.id && "opacity-50 pointer-events-none"
                                  )}>
                                    {uploadingDocs === imp.id ? (
                                      <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Subiendo...
                                      </>
                                    ) : (
                                      <>
                                        <Plus size={14} />
                                        Adjuntar documento
                                      </>
                                    )}
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleUploadDocument(imp.id, file)
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>

                              <div className="flex justify-end pt-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary neon-glow" />
                                  <span className="text-sm font-black text-primary neon-glow tracking-tight uppercase">
                                    {imp.items.length > 0
                                      ? `Costo promedio por item: S/ ${((imp.items.reduce((acc, i) => acc + (i.quantity * i.unitPriceUsd * imp.exchangeRate), 0) + imp.costs.reduce((acc, c) => acc + (c.currency === 'PEN' ? c.amount : c.amount * (c.exchangeRate ?? imp.exchangeRate)), 0)) / imp.items.reduce((acc, i) => acc + i.quantity, 0)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                                      : 'Sin productos registrados'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          </td>
                        </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
            </table>

            {filteredImports.length === 0 && (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground opacity-40">
                  <Ship size={48} strokeWidth={1} className="mb-4" />
                  <p className="text-sm">No hay importaciones registradas</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}