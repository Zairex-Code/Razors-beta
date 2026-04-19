'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Search,
  User,
  Plus,
  Download,
  MapPin,
  Phone,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteCustomer } from '@/app/actions/customer-actions'

interface SaleItem {
  id: string
  quantity: number
  unitPrice: number
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
  items: SaleItem[]
  location: {
    id: string
    name: string
  }
}

interface Customer {
  id: string
  docType: string
  docNumber: string
  name: string
  email: string | null
  totalPurchases: number
  sales: Sale[]
}

interface CustomersTableProps {
  customers: Customer[]
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const [search, setSearch] = useState('')
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null)

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.docNumber.includes(search) ||
      customer.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (customerId: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return

    try {
      await deleteCustomer(customerId)
      window.location.reload()
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={20} />
          <Input
            type="text"
            placeholder="Buscar por nombre, documento o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-2xl py-3.5 pl-12 pr-4 text-sm"
          />
        </div>

        <Button className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Plus size={18} />
          Agregar Cliente
        </Button>
      </div>

      <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <div className="relative z-10 overflow-x-auto">
          <div className="min-w-[800px] space-y-4">
            <div className="grid grid-cols-12 px-8 py-4 text-muted-foreground text-[10px] uppercase tracking-[0.25em] font-bold">
              <div className="col-span-2">Tipo / Número</div>
              <div className="col-span-4">Nombre / Razón Social</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2 text-right">Total Compras</div>
              <div className="col-span-1"></div>
            </div>

            {filteredCustomers.map((customer) => {
              const isExpanded = expandedCustomerId === customer.id

              return (
                <div key={customer.id} className="space-y-2">
                  <button
                    onClick={() => setExpandedCustomerId(isExpanded ? null : customer.id)}
                    className={cn(
                      "w-full grid grid-cols-12 items-center px-8 py-5 rounded-2xl transition-all duration-300 text-left relative overflow-hidden group",
                      "glass-panel border-border/30 hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(0,247,255,0.1)]",
                      isExpanded && "border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(0,247,255,0.15)] ring-1 ring-primary/30"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="col-span-2 relative z-10 flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-foreground/5 border border-border/30 text-primary w-fit">
                        {customer.docType}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{customer.docNumber}</span>
                    </div>

                    <div className="col-span-4 relative z-10">
                      <span className="font-bold text-sm tracking-tight">{customer.name}</span>
                    </div>

                    <div className="col-span-3 relative z-10">
                      <span className="text-sm text-foreground/60">{customer.email || '-'}</span>
                    </div>

                    <div className="col-span-2 text-right relative z-10">
                      <span className="text-sm font-bold">
                        S/ {customer.totalPurchases.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="col-span-1 flex justify-end relative z-10">
                      <ChevronDown
                        size={16}
                        className={cn(
                          "text-muted-foreground transition-transform duration-300",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="glass-panel bg-black/40 border-primary/20 rounded-2xl p-8 ml-6 border-l-4 border-l-primary/60 shadow-2xl space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="space-y-4">
                          <h5 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Datos de Contacto</h5>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-foreground/70">
                              <Phone size={14} className="text-primary/60" />
                              <span>+51 987 654 321</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-foreground/70">
                              <MapPin size={14} className="text-primary/60" />
                              <span>Av. Javier Prado Este 123, San Isidro, Lima</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-border/20">
                            <h5 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3">Acciones</h5>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                                Editar Cliente
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(customer.id)}
                                className="rounded-xl text-xs text-rose-500 hover:text-rose-400"
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                          <h5 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Facturas Recientes</h5>
                          <div className="space-y-2">
                            {customer.sales && customer.sales.length > 0 ? (
                              customer.sales.slice(0, 5).map((sale) => (
                                <div
                                  key={sale.id}
                                  className="glass-panel bg-foreground/[0.02] border-none rounded-xl p-4 flex items-center justify-between group/inv hover:bg-foreground/[0.05] transition-all"
                                >
                                  <div className="flex items-center gap-8">
                                    <div className="space-y-1">
                                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Factura #</p>
                                      <p className="text-xs font-mono font-bold text-foreground">{sale.invoiceNumber}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Fecha</p>
                                      <p className="text-xs font-semibold text-foreground/80">
                                        {format(new Date(sale.date), 'dd/MM/yyyy', { locale: es })}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Sede</p>
                                      <p className="text-xs font-semibold text-foreground/80">{sale.location?.name || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Estado</p>
                                      <span
                                        className={cn(
                                          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                          sale.status === 'PAID'
                                            ? "bg-emerald-500/10 text-emerald-500"
                                            : sale.status === 'PENDING'
                                            ? "bg-amber-500/10 text-amber-500"
                                            : "bg-rose-500/10 text-rose-500"
                                        )}
                                      >
                                        {sale.status === 'PAID' ? 'Pagada' : sale.status === 'PENDING' ? 'Pendiente' : 'Anulada'}
                                      </span>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Total</p>
                                      <p className="text-xs font-black text-primary">
                                        S/ {sale.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                      </p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" className="rounded-lg p-2">
                                    <Download size={14} className="text-primary" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground py-4 text-center">
                                No hay facturas registradas para este cliente.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground opacity-40">
                  <User size={48} strokeWidth={1} className="mb-4" />
                  <p className="text-sm">No hay clientes registrados</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}