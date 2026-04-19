'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { updateImportStatus, deleteImport } from '@/app/actions/import-actions'
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
}

const STATUS_CONFIG = {
  PLANNING: { label: 'Planificación', icon: Clock, color: 'bg-foreground/5 text-muted-foreground border-border' },
  DISPATCHED: { label: 'Despachado', icon: Truck, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  IN_TRANSIT: { label: 'En Tránsito', icon: Ship, color: 'bg-primary/10 text-primary border-primary/20' },
  DELIVERED: { label: 'Entregado', icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

const TIMELINE_STEPS = ['PLANNING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED']

export function ImportsTable({ imports }: ImportsTableProps) {
  const [search, setSearch] = useState('')
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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

  const handleStatusChange = async (importId: string, newStatus: ImportStatus) => {
    if (!confirm(`¿Cambiar estado a "${STATUS_CONFIG[newStatus].label}"?`)) return

    setUpdatingId(importId)
    try {
      await updateImportStatus(importId, newStatus)
    } catch (error) {
      console.error('Error updating import status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (importId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta importación? Se eliminarán todos lositems y costos asociados.')) return

    try {
      await deleteImport(importId)
    } catch (error) {
      console.error('Error deleting import:', error)
    }
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
                  width: `${(Math.max(0, TIMELINE_STEPS.indexOf(filteredImports[0]?.status as ImportStatus)) / 3) * 100}%`
                }}
              />

              {[
                { label: 'Planning', icon: Clock, status: 'PLANNING' as ImportStatus },
                { label: 'Dispatched', icon: Truck, status: 'DISPATCHED' as ImportStatus },
                { label: 'In Transit', icon: Ship, status: 'IN_TRANSIT' as ImportStatus },
                { label: 'Delivered', icon: CheckCircle, status: 'DELIVERED' as ImportStatus }
              ].map((step, idx) => {
                const status = filteredImports[0] ? getStepStatus(filteredImports[0].status as ImportStatus, step.status) : 'pending'
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
                    <tr key={imp.id}>
                      <td colSpan={7} className="p-0">
                        <div
                          onClick={() => setSelectedImportId(isSelected ? null : imp.id)}
                          className={cn(
                            "group transition-all duration-300 cursor-pointer",
                            isSelected ? "scale-[1.01] relative z-20" : "hover:scale-[1.005]"
                          )}
                        >
                          <div className={cn(
                            "grid grid-cols-12 items-center rounded-2xl transition-all duration-300",
                            isSelected ? "bg-primary/5 border border-primary/40 shadow-[inset_0_0_20px_rgba(0,247,255,0.05)]" : "bg-foreground/[0.03] border border-transparent hover:border-primary/20"
                          )}>
                            <div className="px-6 py-4 col-span-2">
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
                            </div>
                            <div className="px-6 py-4 col-span-2">
                              <span className="font-semibold text-sm">{imp.provider}</span>
                            </div>
                            <div className="px-6 py-4 col-span-1 text-right">
                              <span className="text-sm font-medium">${shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="px-6 py-4 col-span-1 text-right">
                              <span className="text-sm font-medium">${customsCost.toFixed(2)}</span>
                            </div>
                            <div className="px-6 py-4 col-span-1 text-right">
                              <span className="text-sm font-medium">${mobilityCost.toFixed(2)}</span>
                            </div>
                            <div className="px-6 py-4 col-span-2 text-center">
                              <select
                                value={imp.status}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleStatusChange(imp.id, e.target.value as ImportStatus)
                                }}
                                disabled={updatingId === imp.id}
                                className={cn(
                                  "text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer",
                                  STATUS_CONFIG[imp.status as keyof typeof STATUS_CONFIG]?.color ?? STATUS_CONFIG.PLANNING.color
                                )}
                              >
                                {TIMELINE_STEPS.map((s) => (
                                  <option key={s} value={s}>
                                    {STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="px-6 py-4 col-span-3 text-right">
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
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="px-8 pb-8 pt-2">
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
                        )}
                      </td>
                    </tr>
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