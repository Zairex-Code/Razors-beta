'use client'

import React, { useState, useRef } from 'react'
import { cn, productName } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useReactToPrint } from 'react-to-print'
import {
  Search,
  Download,
  Printer,
  Package,
  Percent,
  Upload,
  FileText,
  Image,
  X,
  Loader2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  voidSale,
  updateSaleStatusAction,
  uploadSaleVoucherAction,
  deleteSaleVoucherAction,
} from '@/app/actions/sale-actions'
import { InvoiceTemplate, TicketTemplate } from './InvoiceTemplate'

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
    brand?: string | null
    model?: string | null
    sku: string
    imageUrl?: string | null
  }
}

interface Sale {
  id: string
  invoiceNumber: string
  date: Date | string
  status: 'PAID' | 'PENDING' | 'VOID'
  totalAmount: number
  paymentMethod: string
  isDelivery: boolean
  deliveryCost: number
  voucherUrl?: string | null
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
  const [statusLoading, setStatusLoading] = useState<string | null>(null)
  const [uploadingVoucherId, setUploadingVoucherId] = useState<string | null>(null)
  const [printingSale, setPrintingSale] = useState<Sale | null>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const ticketRef = useRef<HTMLDivElement>(null)

  const handlePrintInvoice = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: '',
    onBeforePrint: async () => {
      const saleToPrint = expandedSaleId ? sales.find(s => s.id === expandedSaleId) : printingSale
      if (saleToPrint) {
        document.title = `Factura-${saleToPrint.invoiceNumber}`
        setPrintingSale(saleToPrint)
      }
    },
    onAfterPrint: async () => {
      document.title = ''
      setPrintingSale(null)
    },
  })

  const handlePrintTicket = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: '',
    onBeforePrint: async () => {
      const saleToPrint = expandedSaleId ? sales.find(s => s.id === expandedSaleId) : printingSale
      if (saleToPrint) {
        document.title = `Ticket-${saleToPrint.invoiceNumber}`
        setPrintingSale(saleToPrint)
      }
    },
    onAfterPrint: async () => {
      document.title = ''
      setPrintingSale(null)
    },
  })

  const handleDownloadInvoice = (sale: Sale) => {
    setPrintingSale(sale)
    setExpandedSaleId(sale.id)
    setTimeout(() => {
      handlePrintInvoice()
    }, 100)
  }

  const handlePrintTicketFromSale = (sale: Sale) => {
    setPrintingSale(sale)
    setExpandedSaleId(sale.id)
    setTimeout(() => {
      handlePrintTicket()
    }, 100)
  }

  const filteredSales = sales.filter(
    (sale) =>
      sale.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      sale.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  )

  const handleStatusChange = async (saleId: string, newStatus: 'PAID' | 'PENDING') => {
    setStatusLoading(saleId)
    try {
      await updateSaleStatusAction(saleId, newStatus)
      Swal.fire({
        title: 'Estado actualizado',
        text: `La venta ahora está ${newStatus === 'PAID' ? 'Pagada' : 'Pendiente'}`,
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
      console.error('Error updating status:', error)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estado',
        icon: 'error',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setStatusLoading(null)
    }
  }

  const handleVoucherUpload = async (saleId: string, file: File) => {
    setUploadingVoucherId(saleId)
    try {
      const formData = new FormData()
      formData.append('voucher', file)
      await uploadSaleVoucherAction(saleId, formData)
      Swal.fire({
        title: 'Voucher subido',
        text: 'El comprobante se ha guardado correctamente',
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
      console.error('Error uploading voucher:', error)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo subir el comprobante',
        icon: 'error',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setUploadingVoucherId(null)
    }
  }

  const handleVoucherDelete = async (saleId: string) => {
    try {
      await deleteSaleVoucherAction(saleId)
      Swal.fire({
        title: 'Voucher eliminado',
        text: 'El comprobante ha sido eliminado',
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
      console.error('Error deleting voucher:', error)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el comprobante',
        icon: 'error',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#ef4444',
      })
    }
  }

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

  

  const hasDiscountedItems = (sale: Sale) => sale.items.some(i => i.hasDiscount)

  const isImageFile = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')
  }

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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-muted-foreground text-[10px] uppercase tracking-[0.25em] font-bold">
                <th className="text-left p-4">Fecha</th>
                <th className="text-left p-4">Factura / Ticket</th>
                <th className="text-left p-4">Cliente</th>
                <th className="text-center p-4">Sede</th>
                <th className="text-center p-4">Estado</th>
                <th className="text-right p-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => {
                const isExpanded = expandedSaleId === sale.id
                const isVoiding = voidingId === sale.id
                const discounted = hasDiscountedItems(sale)
                const isStatusLoading = statusLoading === sale.id
                const isVoucherUploading = uploadingVoucherId === sale.id

                return (
                  <React.Fragment key={sale.id}>
                    <tr
                      onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                      className={cn(
                        "cursor-pointer transition-all duration-300",
                        isExpanded
                          ? "bg-primary/5"
                          : "bg-foreground/[0.03] hover:bg-foreground/[0.06]"
                      )}
                    >
                      <td className="text-left p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground/80">
                            {format(new Date(sale.date), 'dd/MM/yyyy', { locale: es })}
                          </span>
                          {discounted && (
                            <Percent size={12} className="text-rose-400" />
                          )}
                        </div>
                      </td>
                      <td className="text-left p-4">
                        <span className="font-mono text-xs font-bold text-primary">
                          {sale.invoiceNumber}
                        </span>
                      </td>
                      <td className="text-left p-4">
                        <span className="font-semibold text-sm">{sale.customer.name}</span>
                      </td>
                      <td className="text-center p-4">
                        <span className="text-sm text-foreground/60">{sale.location.name}</span>
                      </td>
                      <td className="text-center p-4">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {sale.status === 'VOID' ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-rose-500/10 border-rose-500/20 text-rose-500">
                              Anulada
                            </span>
                          ) : (
                            <Select
                              value={sale.status}
                              onValueChange={(value) => handleStatusChange(sale.id, value as 'PAID' | 'PENDING')}
                              disabled={isStatusLoading}
                            >
                              <SelectTrigger className={cn(
                                "h-7 px-2.5 text-[10px] font-bold uppercase tracking-wider border rounded-lg transition-all",
                                sale.status === 'PAID'
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-500",
                                isStatusLoading && "opacity-50"
                              )}>
                                {isStatusLoading ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent className="bg-gray-950 border-gray-800 text-white shadow-xl">
                                <SelectItem value="PAID" className="focus:bg-emerald-900/30 focus:text-emerald-100">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Pagada
                                  </span>
                                </SelectItem>
                                <SelectItem value="PENDING" className="focus:bg-amber-900/30 focus:text-amber-100">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    Pendiente
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          {discounted && sale.status === 'PAID' && (
                            <span className="text-[8px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Rebaja
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right p-4">
                        <span className={cn(
                          "text-sm font-black",
                          sale.status === 'VOID' ? "text-foreground/30 line-through" : "text-foreground"
                        )}>
                          S/ {sale.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div className="px-8 pb-8 pt-2">
                            <div className="w-full glass-panel rounded-b-2xl border-x border-b border-primary/40 bg-primary/[0.02] p-6 space-y-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Vendido por <span className="font-bold text-foreground">{sale.user.name}</span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border",
                                      sale.paymentMethod === 'YAPE'
                                        ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                                        : sale.paymentMethod === 'PLIN'
                                        ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                                        : sale.paymentMethod === 'TRANSFERENCIA'
                                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                        : sale.paymentMethod === 'TARJETA'
                                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    )}
                                  >
                                    {sale.paymentMethod}
                                  </span>
                                  {sale.isDelivery && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-orange-500/10 border-orange-500/20 text-orange-400">
                                      Delivery
                                    </span>
                                  )}
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

                              <div className="flex flex-wrap items-start gap-6">
                                <div className="flex-1 min-w-[300px]">
                                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
                                    Resumen del Pedido
                                  </h4>
                                  <div className="overflow-hidden rounded-xl border border-border/30 bg-foreground/[0.02]">
                                    <table className="w-full text-left text-xs">
                                      <thead>
                                        <tr className="bg-foreground/[0.03] text-muted-foreground font-bold uppercase tracking-wider">
                                          <th className="px-4 py-3 w-12">Foto</th>
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
                                              <div className="w-12 h-12 rounded-full border border-primary/30 overflow-hidden bg-card flex items-center justify-center">
                                                {item.product.imageUrl ? (
                                                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                  <Package size={16} className="text-muted-foreground/30" />
                                                )}
                                              </div>
                                            </td>
                                            <td className="px-4 py-3">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium">{productName(item.product)}</span>
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
                                          <td colSpan={6} className="px-4 py-3 text-right font-bold text-muted-foreground uppercase tracking-widest">
                                            Subtotal
                                          </td>
                                          <td className="px-4 py-3 text-right font-medium">
                                            S/ {((sale.totalAmount - sale.deliveryCost) / 1.18).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                          </td>
                                        </tr>
                                        <tr className="bg-foreground/[0.01]">
                                          <td colSpan={6} className="px-4 py-3 text-right font-bold text-muted-foreground uppercase tracking-widest">
                                            IGV (18%)
                                          </td>
                                          <td className="px-4 py-3 text-right font-medium">
                                            S/ {(sale.totalAmount - sale.deliveryCost - (sale.totalAmount - sale.deliveryCost) / 1.18).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                          </td>
                                        </tr>
                                        {sale.isDelivery && (
                                          <tr className="bg-foreground/[0.01]">
                                            <td colSpan={6} className="px-4 py-3 text-right font-bold text-orange-400 uppercase tracking-widest">
                                              Costo de Envío
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-orange-400">
                                              S/ {sale.deliveryCost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                            </td>
                                          </tr>
                                        )}
                                        <tr className="bg-primary/5">
                                          <td colSpan={6} className="px-4 py-3 text-right font-black text-primary uppercase tracking-widest">
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

                                <div className="w-80 space-y-4">
                                  <div className="glass-panel rounded-xl border border-border/30 bg-foreground/[0.02] p-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
                                      Comprobante de Pago
                                    </h4>
                                    {sale.voucherUrl ? (
                                      <div className="space-y-3">
                                        {isImageFile(sale.voucherUrl) ? (
                                          <div className="relative rounded-lg overflow-hidden border border-border/30">
                                            <img
                                              src={sale.voucherUrl}
                                              alt="Voucher"
                                              className="w-full h-40 object-cover"
                                            />
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                            <FileText size={24} className="text-primary shrink-0" />
                                            <span className="text-xs font-medium truncate">
                                              {sale.voucherUrl.split('/').pop()}
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                          <a
                                            href={sale.voucherUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                                          >
                                            <ExternalLink size={12} />
                                            Ver Completo
                                          </a>
                                          <button
                                            onClick={() => handleVoucherDelete(sale.id)}
                                            className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-all"
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <VoucherUploader
                                        saleId={sale.id}
                                        onUpload={(file) => handleVoucherUpload(sale.id, file)}
                                        isUploading={isVoucherUploading}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/20">
                                <Button
                                  onClick={() => handleDownloadInvoice(sale)}
                                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                  <Download size={14} />
                                  Descargar Factura (PDF)
                                </Button>
                                <Button
                                  onClick={() => handlePrintTicketFromSale(sale)}
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
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

      {printingSale && (
        <div className="hidden">
          <InvoiceTemplate ref={invoiceRef} sale={printingSale} />
          <TicketTemplate ref={ticketRef} sale={printingSale} />
        </div>
      )}
    </div>
  )
}

interface VoucherUploaderProps {
  saleId: string
  onUpload: (file: File) => void
  isUploading: boolean
}

function VoucherUploader({ saleId, onUpload, isUploading }: VoucherUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <label
      htmlFor={`voucher-${saleId}`}
      className={cn(
        "border-2 border-dashed border-border/30 rounded-xl p-6 text-center hover:border-primary/30 transition-all cursor-pointer block",
        isUploading && "opacity-50 pointer-events-none"
      )}
    >
      <input
        ref={fileInputRef}
        id={`voucher-${saleId}`}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={24} className="text-primary animate-spin" />
          <p className="text-xs text-muted-foreground">Subiendo comprobante...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
            <Upload size={20} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Adjuntar comprobante de pago</p>
            <span className="text-[10px] text-primary font-medium">PDF, JPG, PNG hasta 10MB</span>
          </div>
        </div>
      )}
    </label>
  )
}