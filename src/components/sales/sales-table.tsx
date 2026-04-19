'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Search,
  Download,
  Printer,
  Package,
  Percent,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { voidSale } from '@/app/actions/sale-actions'

interface SaleItem {
  id: string
  quantity: number
  unitPrice: number
  basePrice: number
  hasDiscount: boolean
  discountPct: number
  subtotal: number
  product: {
    id: string
    name: string
    sku: string
  }
}

interface Sale {
  id: string
  invoiceNumber: string
  date: Date | string
  status: 'PAID' | 'PENDING' | 'VOID'
  totalAmount: number
  customer: {
    id: string
    name: string
    docType: string
    docNumber: string
  }
  location: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
  }
  items: SaleItem[]
}

interface SalesTableProps {
  sales: Sale[]
}

export function SalesTable({ sales }: SalesTableProps) {
  const [search, setSearch] = useState('')
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null)
  const [voidingId, setVoidingId] = useState<string | null>(null)

  const filteredSales = sales.filter(
    (sale) =>
      sale.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      sale.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  )

  const handleVoidSale = (sale: Sale) => {
    Swal.fire({
      title: '¿Anular Venta?',
      html: `
        <div class="text-left">
          <p class="mb-3">Se anulará la factura <strong>${sale.invoiceNumber}</strong> de <strong>${sale.customer.name}</strong>.</p>
          <p class="text-rose-400 text-sm">Se devolverá el stock de ${sale.items.length} producto(s) a <strong>${sale.location.name}</strong>.</p>
        </div>
      `,
      icon: 'warning',
      background: '#0a0a0a',
      color: '#ffffff',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'glass-panel',
      }
    }).then((result) => {
      if (!result.isConfirmed) return

      setVoidingId(sale.id)
      voidSale(sale.id)
        .catch((error) => {
          console.error('Error voiding sale:', error)
          Swal.fire({
            title: 'Error',
            text: 'No se pudo anular la venta.',
            icon: 'error',
            background: '#0a0a0a',
            color: '#ffffff',
            confirmButtonColor: '#00f7ff',
          })
        })
        .finally(() => {
          setVoidingId(null)
          window.location.reload()
        })
    })
  }

  const handlePdf = () => {
    Swal.fire({
      title: 'Próximamente',
      text: 'La descarga de facturas PDF estará disponible pronto.',
      icon: 'info',
      background: '#0a0a0a',
      color: '#ffffff',
      confirmButtonColor: '#00f7ff',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
    })
  }

  const handleTicket = () => {
    Swal.fire({
      title: 'Próximamente',
      text: 'La impresión de tickets estará disponible pronto.',
      icon: 'info',
      background: '#0a0a0a',
      color: '#ffffff',
      confirmButtonColor: '#00f7ff',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
    })
  }

  const hasDiscountedItems = (sale: Sale) => sale.items.some(i => i.hasDiscount)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={20} />
          <Input
            type="text"
            placeholder="Buscar por cliente o factura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-2xl py-3.5 pl-12 pr-4 text-sm"
          />
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2 min-w-[800px]">
            <thead>
              <tr className="text-muted-foreground text-[10px] uppercase tracking-[0.25em] font-bold">
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Factura / Ticket</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Sede</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => {
                const isExpanded = expandedSaleId === sale.id
                const isVoiding = voidingId === sale.id
                const discounted = hasDiscountedItems(sale)

                return (
                  <tr key={sale.id}>
                    <td
                      colSpan={6}
                      className="p-0"
                    >
                      <div
                        onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                        className={cn(
                          "grid grid-cols-12 items-center rounded-2xl cursor-pointer transition-all duration-300",
                          isExpanded
                            ? "bg-primary/5 border border-primary/40"
                            : "bg-foreground/[0.03] border border-transparent hover:border-primary/20 hover:bg-foreground/[0.06]"
                        )}
                      >
                        <div className="px-6 py-4 col-span-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground/80">
                            {format(new Date(sale.date), 'dd/MM/yyyy', { locale: es })}
                          </span>
                          {discounted && (
                            <Percent size={12} className="text-rose-400" />
                          )}
                        </div>
                        <div className="px-6 py-4 col-span-2">
                          <span className="font-mono text-xs font-bold text-primary">
                            {sale.invoiceNumber}
                          </span>
                        </div>
                        <div className="px-6 py-4 col-span-3">
                          <span className="font-semibold text-sm">{sale.customer.name}</span>
                        </div>
                        <div className="px-6 py-4 col-span-2">
                          <span className="text-sm text-foreground/60">{sale.location.name}</span>
                        </div>
                        <div className="px-6 py-4 col-span-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border",
                                sale.status === 'PAID'
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                  : sale.status === 'PENDING'
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                  : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                              )}
                            >
                              {sale.status === 'PAID' ? 'Pagada' : sale.status === 'PENDING' ? 'Pendiente' : 'Anulada'}
                            </span>
                            {discounted && sale.status === 'PAID' && (
                              <span className="text-[8px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                Rebaja
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="px-6 py-4 col-span-2 text-right">
                          <span className={cn(
                            "text-sm font-black",
                            sale.status === 'VOID' ? "text-foreground/30 line-through" : "text-foreground"
                          )}>
                            S/ {sale.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-8 pb-8 pt-2">
                          <div className="w-full glass-panel rounded-b-2xl border-x border-b border-primary/40 bg-primary/[0.02] p-6 space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Vendido por <span className="font-bold text-foreground">{sale.user.name}</span>
                                </p>
                              </div>
                              {discounted && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                  <Percent size={14} className="text-rose-400" />
                                  <span className="text-xs font-bold text-rose-400">
                                    Esta venta incluye rebajas
                                  </span>
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
                                Resumen del Pedido
                              </h4>
                              <div className="overflow-hidden rounded-xl border border-border/30 bg-foreground/[0.02]">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="bg-foreground/[0.03] text-muted-foreground font-bold uppercase tracking-wider">
                                      <th className="px-4 py-3">Producto</th>
                                      <th className="px-4 py-3 text-center">Cantidad</th>
                                      <th className="px-4 py-3 text-right">Precio Base</th>
                                      <th className="px-4 py-3 text-right">Precio Final</th>
                                      <th className="px-4 py-3 text-right">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border/20">
                                    {sale.items.map((item) => (
                                      <tr key={item.id} className={cn(
                                        "relative",
                                        item.hasDiscount && "bg-rose-500/5"
                                      )}>
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{item.product.name}</span>
                                            {item.hasDiscount && (
                                              <span className="flex items-center gap-0.5 text-[8px] font-bold text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded uppercase">
                                                <Percent size={8} />
                                                -{item.discountPct.toFixed(0)}%
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right">
                                          {item.hasDiscount ? (
                                            <span className="text-rose-400 line-through">
                                              S/ {item.basePrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                            </span>
                                          ) : (
                                            <span>
                                              S/ {item.basePrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          <span className={cn(
                                            "font-bold",
                                            item.hasDiscount ? "text-rose-400" : ""
                                          )}>
                                            S/ {item.unitPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold">
                                          S/ {item.subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </td>
                                      </tr>
                                    ))}
                                    <tr className="bg-foreground/[0.01]">
                                      <td colSpan={4} className="px-4 py-3 text-right font-bold text-muted-foreground uppercase tracking-widest">
                                        Subtotal
                                      </td>
                                      <td className="px-4 py-3 text-right font-medium">
                                        S/ {(sale.totalAmount / 1.18).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                    <tr className="bg-foreground/[0.01]">
                                      <td colSpan={4} className="px-4 py-3 text-right font-bold text-muted-foreground uppercase tracking-widest">
                                        IGV (18%)
                                      </td>
                                      <td className="px-4 py-3 text-right font-medium">
                                        S/ {(sale.totalAmount - sale.totalAmount / 1.18).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                    <tr className="bg-primary/5">
                                      <td colSpan={4} className="px-4 py-3 text-right font-black text-primary uppercase tracking-widest">
                                        Total
                                      </td>
                                      <td className="px-4 py-3 text-right font-black text-primary">
                                        S/ {sale.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/20">
                              <Button
                                onClick={handlePdf}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                              >
                                <Download size={14} />
                                Descargar Factura (PDF)
                              </Button>
                              <Button
                                onClick={handleTicket}
                                variant="outline"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground/5 border border-border/50 text-foreground/60 font-bold text-xs tracking-tight hover:bg-foreground/10 hover:text-foreground transition-all"
                              >
                                <Printer size={14} />
                                Imprimir Ticket
                              </Button>
                              {sale.status !== 'VOID' && (
                                <Button
                                  variant="ghost"
                                  onClick={() => handleVoidSale(sale)}
                                  disabled={isVoiding}
                                  className="ml-auto text-rose-500 hover:text-rose-400 font-bold text-xs tracking-tight transition-colors"
                                >
                                  {isVoiding ? 'Anulando...' : 'Anular Venta / Devolver Stock'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground opacity-40">
                      <Package size={48} strokeWidth={1} className="mb-4" />
                      <p className="text-sm">No hay ventas registradas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}