'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, ShoppingCart, Receipt, ChevronLeft, ChevronRight, Percent } from 'lucide-react'
import { SalesTable } from '@/components/sales/sales-table'
import { POSCheckout } from '@/components/sales/pos-checkout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Sale {
  id: string
  invoiceNumber: string
  date: Date | string
  status: 'PAID' | 'PENDING' | 'VOID'
  totalAmount: number
  paymentMethod: string
  isDelivery: boolean
  deliveryCost: number
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
  items: Array<{
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
  }>
}

interface Product {
  id: string
  sku: string
  name: string
  category: string
  pricePen: number
  inventory: Array<{
    locationId: string
    stock: number
  }>
}

interface Customer {
  id: string
  name: string
  docType: string
  docNumber: string
}

interface Pagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

interface SalesPageClientProps {
  sales: Sale[]
  pagination: Pagination
  products: Product[]
  customers: Customer[]
  userId: string
  locationId: string
  locationName: string
}

export default function SalesPageClient({
  sales,
  pagination,
  products,
  customers,
  userId,
  locationId,
  locationName
}: SalesPageClientProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'pos'>('history')
  const [isPending, startTransition] = useTransition()
  const [statusFilter, setStatusFilter] = useState<'PAID' | 'PENDING' | 'VOID' | undefined>(undefined)
  const [showDiscounted, setShowDiscounted] = useState(false)
  const router = useRouter()

  const formattedSales = sales.map(sale => ({
    ...sale,
    date: sale.date instanceof Date ? sale.date.toISOString() : sale.date
  }))

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams()
      params.set('page', newPage.toString())
      if (statusFilter) params.set('status', statusFilter)
      if (showDiscounted) params.set('discounted', 'true')
      router.push(`/dashboard/sales?${params.toString()}`)
    })
  }

  const handleStatusFilterChange = (status: 'PAID' | 'PENDING' | 'VOID' | undefined) => {
    setStatusFilter(status)
    setShowDiscounted(false)
    startTransition(() => {
      const params = new URLSearchParams()
      params.set('page', '1')
      if (status) params.set('status', status)
      router.push(`/dashboard/sales?${params.toString()}`)
    })
  }

  const handleDiscountedFilter = () => {
    setShowDiscounted(!showDiscounted)
    setStatusFilter(undefined)
    startTransition(() => {
      const params = new URLSearchParams()
      params.set('page', '1')
      if (!showDiscounted) params.set('discounted', 'true')
      router.push(`/dashboard/sales?${params.toString()}`)
    })
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity size={24} className="text-primary" />
            </div>
            Ventas
          </h1>
          <p className="text-muted-foreground mt-1">Historial de ventas y punto de venta.</p>
        </div>

        <div className="flex items-center gap-2 glass-panel rounded-xl p-1">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-primary text-primary-foreground neon-glow'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            <Receipt size={16} />
            Historial
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'pos'
                ? 'bg-primary text-primary-foreground neon-glow'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            <ShoppingCart size={16} />
            Punto de Venta
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleStatusFilterChange(undefined)}
              variant={statusFilter === undefined && !showDiscounted ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                "rounded-xl text-xs font-bold transition-all",
                statusFilter === undefined && !showDiscounted ? "bg-primary neon-glow" : ""
              )}
            >
              Todas
            </Button>
            <Button
              onClick={() => handleStatusFilterChange('PAID')}
              variant={statusFilter === 'PAID' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                "rounded-xl text-xs font-bold transition-all",
                statusFilter === 'PAID' ? "bg-emerald-500 neon-glow" : "text-emerald-400"
              )}
            >
              Pagadas
            </Button>
            <Button
              onClick={() => handleStatusFilterChange('PENDING')}
              variant={statusFilter === 'PENDING' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                "rounded-xl text-xs font-bold transition-all",
                statusFilter === 'PENDING' ? "bg-amber-500 neon-glow" : "text-amber-400"
              )}
            >
              Pendientes
            </Button>
            <Button
              onClick={() => handleStatusFilterChange('VOID')}
              variant={statusFilter === 'VOID' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                "rounded-xl text-xs font-bold transition-all",
                statusFilter === 'VOID' ? "bg-rose-500 neon-glow" : "text-rose-400"
              )}
            >
              Anuladas
            </Button>
            <Button
              onClick={handleDiscountedFilter}
              variant={showDiscounted ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                "rounded-xl text-xs font-bold transition-all gap-1.5",
                showDiscounted ? "bg-rose-500 neon-glow" : "text-rose-400 hover:text-rose-300"
              )}
            >
              <Percent size={12} />
              Con Rebaja
            </Button>
          </div>

          <SalesTable sales={formattedSales} />

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Mostrando {(pagination.page - 1) * pagination.perPage + 1} - {Math.min(pagination.page * pagination.perPage, pagination.total)} de {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isPending}
                  className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isPending}
                        className={cn(
                          'w-8 h-8 rounded-lg text-sm font-medium transition-all',
                          pagination.page === pageNum
                            ? 'bg-primary text-black neon-glow'
                            : 'hover:bg-foreground/10 text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || isPending}
                  className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-[calc(100vh-12rem)]">
          <POSCheckout
            products={products}
            customers={customers}
            userId={userId}
            locationId={locationId}
            locationName={locationName}
          />
        </div>
      )}
    </div>
  )
}