'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { cn } from '@/lib/utils'
import {
  Search,
  Package,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductModal } from '@/components/ui/product-modal'
import { deleteProduct } from '@/app/actions/product-actions'
import { productName } from '@/lib/utils'

interface InventoryItem {
  id: string
  sku: string
  name: string
  brand?: string | null
  model?: string | null
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

interface Location {
  id: string
  name: string
}

interface InventoryTableProps {
  products: InventoryItem[]
  locations: Location[]
}

export function InventoryTable({ products, locations }: InventoryTableProps) {
  const [search, setSearch] = useState('')
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<InventoryItem | null>(null)
  const [isPending, startTransition] = useTransition()

  const [optimisticProducts, addOptimisticProduct] = useOptimistic(
    products,
    (state, newProduct: InventoryItem) => [...state, newProduct]
  )

  const filteredProducts = optimisticProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase()) ||
      (product.brand?.toLowerCase().includes(search.toLowerCase())) ||
      (product.model?.toLowerCase().includes(search.toLowerCase()))
  )

  const getTotalStock = (product: InventoryItem) => {
    return product.inventory.reduce((sum, inv) => sum + inv.stock, 0)
  }

  const getStockByLocation = (product: InventoryItem, locationId: string) => {
    const inv = product.inventory.find(i => i.location.id === locationId)
    return inv?.stock ?? 0
  }

  const handleEdit = (product: InventoryItem) => {
    setProductToEdit(product)
    setEditModalOpen(true)
  }

  const handleDelete = (product: InventoryItem) => {
    Swal.fire({
      title: '¿Eliminar Producto?',
      text: product.name,
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
    }).then((result) => {
      if (!result.isConfirmed) return

      startTransition(async () => {
        try {
          const result = await deleteProduct(product.id)
          Swal.fire({
            title: result.softDeleted ? 'Desactivado' : 'Eliminado',
            text: result.softDeleted
              ? 'El producto tenía historial y fue desactivado.'
              : 'El producto ha sido eliminado.',
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
          console.error('Error deleting product:', error)
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar el producto.',
            icon: 'error',
            background: '#0a0a0a',
            color: '#ffffff',
            confirmButtonColor: '#00f7ff',
          })
        }
      })
    })
  }

  const handleCreated = (newProduct: { id: string, name: string, sku: string, category: string }) => {
    const optimisticProduct: InventoryItem = {
      id: newProduct.id,
      sku: newProduct.sku,
      name: newProduct.name,
      category: newProduct.category,
      pricePen: 0,
      inventory: locations.map(loc => ({ id: '', stock: 0, location: loc }))
    }
    addOptimisticProduct(optimisticProduct)
    setIsAddModalOpen(false)
    Swal.fire({
      title: 'Creado',
      text: `Producto ${newProduct.name} creado exitosamente.`,
      icon: 'success',
      background: '#0a0a0a',
      color: '#ffffff',
      confirmButtonColor: '#00f7ff',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
    })
  }

  const handleUpdated = (updatedProduct: InventoryItem) => {
    setEditModalOpen(false)
    setProductToEdit(null)
    Swal.fire({
      title: 'Actualizado',
      text: `Producto ${updatedProduct.name} actualizado exitosamente.`,
      icon: 'success',
      background: '#0a0a0a',
      color: '#ffffff',
      confirmButtonColor: '#00f7ff',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
    })
  }

  return (
    <div className="space-y-6">
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

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={18} />
          Agregar Producto
        </Button>
      </div>

      <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="grid grid-cols-12 px-8 py-4 text-muted-foreground text-[10px] uppercase tracking-[0.25em] font-bold">
            <div className="col-span-2">SKU</div>
            <div className="col-span-4">Producto</div>
            <div className="col-span-2">Categoría</div>
            <div className="col-span-2 text-right">Precio (PEN)</div>
            <div className="col-span-2 text-right">Stock Total</div>
          </div>

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
                    <span className="font-bold text-sm tracking-tight">{productName(product)}</span>
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

                {isExpanded && (
                  <div className="w-full glass-panel bg-black/40 border-primary/20 rounded-2xl p-8 border-l-4 border-l-primary/60 shadow-2xl space-y-6">
                    <div className="flex flex-col lg:flex-row gap-10">
                      <div className="space-y-4 flex-1">
                        <h5 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                          Stock por Ubicación
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {locations.map((loc) => {
                            const stock = getStockByLocation(product, loc.id)
                            const isCritical = stock > 0 && stock < 10
                            const isZero = stock === 0
                            return (
                              <div
                                key={loc.id}
                                className={cn(
                                  "glass-card border px-5 py-3 rounded-xl",
                                  isZero ? "bg-foreground/[0.02] border-border/20 opacity-60" : "bg-foreground/[0.03] border-border/20",
                                  isCritical && "border-rose-500/50 bg-rose-500/5"
                                )}
                              >
                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                                  {loc.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-lg font-black block",
                                    isZero ? "text-foreground/40" : "text-foreground"
                                  )}>
                                    {stock}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">unidades</span>
                                  {isCritical && (
                                    <span className="ml-auto text-[8px] font-bold text-rose-400 uppercase tracking-wider">Crítico</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="space-y-4 flex-1">
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

                        <div className="flex gap-3 pt-4 border-t border-border/30">
                          <button
                            onClick={() => handleEdit(product)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all text-sm font-bold"
                          >
                            <Pencil size={14} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            disabled={isPending}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all text-sm font-bold disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
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

      <ProductModal
        isOpen={isAddModalOpen}
        mode="create"
        onClose={() => setIsAddModalOpen(false)}
        onCreated={handleCreated}
        onUpdated={() => {}}
      />

      <ProductModal
        isOpen={editModalOpen}
        mode="edit"
        product={productToEdit || undefined}
        onClose={() => {
          setEditModalOpen(false)
          setProductToEdit(null)
        }}
        onCreated={() => {}}
        onUpdated={handleUpdated}
      />
    </div>
  )
}