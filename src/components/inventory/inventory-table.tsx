'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Search,
  Package,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  pricePen: number
  inventory: Array<{
    id: string
    stock: number
    location: {
      id: string
      name: string
    }
  }>
}

interface InventoryTableProps {
  products: InventoryItem[]
}

export function InventoryTable({ products }: InventoryTableProps) {
  const [search, setSearch] = useState('')
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase())
  )

  const getTotalStock = (product: InventoryItem) => {
    return product.inventory.reduce((sum, inv) => sum + inv.stock, 0)
  }

  const getStockByLocation = (product: InventoryItem, locationName: string) => {
    return product.inventory.find((inv) => inv.location.name === locationName)?.stock || 0
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={20} />
          <Input
            type="text"
            placeholder="Buscar por SKU, nombre o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-2xl py-3.5 pl-12 pr-4 text-sm"
          />
        </div>

        <Button className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Package size={18} />
          Agregar Producto
        </Button>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Header Row */}
          <div className="grid grid-cols-12 px-8 py-4 text-muted-foreground text-[10px] uppercase tracking-[0.25em] font-bold">
            <div className="col-span-2">SKU</div>
            <div className="col-span-4">Producto</div>
            <div className="col-span-2">Categoría</div>
            <div className="col-span-2 text-right">Precio (PEN)</div>
            <div className="col-span-2 text-right">Stock Total</div>
          </div>

          {/* Product Rows */}
          {filteredProducts.map((product) => {
            const isExpanded = expandedProductId === product.id
            const totalStock = getTotalStock(product)

            return (
              <div key={product.id} className="space-y-2">
                <button
                  onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                  className={cn(
                    "w-full grid grid-cols-12 items-center px-8 py-5 rounded-2xl transition-all duration-300 text-left relative overflow-hidden group",
                    "glass-panel border-border/30 hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(0,247,255,0.1)]",
                    isExpanded && "border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(0,247,255,0.15)] ring-1 ring-primary/30"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="col-span-2 relative z-10">
                    <span className="font-mono text-xs text-primary">{product.sku}</span>
                  </div>

                  <div className="col-span-4 relative z-10">
                    <span className="font-bold text-sm tracking-tight">{product.name}</span>
                  </div>

                  <div className="col-span-2 relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-foreground/5 border border-border/30 text-muted-foreground">
                      {product.category}
                    </span>
                  </div>

                  <div className="col-span-2 text-right relative z-10">
                    <span className="text-sm font-bold text-foreground/80">
                      S/ {product.pricePen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="col-span-2 text-right relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-border/30">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          totalStock < 10 ? "bg-rose-500 neon-glow" : "bg-emerald-500"
                        )}
                      />
                      <span className="text-sm font-bold">{totalStock}</span>
                    </div>
                  </div>
                </button>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="glass-panel bg-black/40 border-primary/20 rounded-2xl p-8 ml-6 border-l-4 border-l-primary/60 shadow-2xl space-y-6">
                    <div className="flex flex-col lg:flex-row gap-10">
                      {/* Stock Breakdown */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                          Stock por Ubicación
                        </h5>
                        <div className="flex flex-wrap gap-4">
                          {product.inventory.map((inv) => (
                            <div
                              key={inv.id}
                              className="glass-card bg-foreground/[0.03] border-border/20 px-5 py-3 rounded-xl"
                            >
                              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                                {inv.location.name}
                              </span>
                              <span className="text-lg font-black text-foreground block">
                                {inv.stock} unidades
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-4">
                        <h5 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                          Detalles del Producto
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground text-xs">SKU</span>
                            <p className="font-mono font-bold">{product.sku}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Categoría</span>
                            <p className="font-bold">{product.category}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Precio Venta</span>
                            <p className="font-bold text-primary">
                              S/ {product.pricePen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Stock Total</span>
                            <p className="font-black">{totalStock} unidades</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {filteredProducts.length === 0 && (
            <div className="px-8 py-12 text-center">
              <div className="flex flex-col items-center justify-center text-muted-foreground opacity-40">
                <Package size={48} strokeWidth={1} className="mb-4" />
                <p className="text-sm">No hay productos en el inventario</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}