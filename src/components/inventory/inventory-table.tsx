'use client'

import { useState, useTransition, useOptimistic, useEffect, Fragment } from 'react'
import { cn } from '@/lib/utils'
import {
  Search,
  Package,
  Plus,
  Pencil,
  Trash2,
  Filter,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  imageUrl?: string | null
  inventory: Array<{
    id: string
    stock: number
    location: {
      id: string
      name: string
      type: 'WAREHOUSE' | 'STORE'
    }
  }>
}

interface Location {
  id: string
  name: string
  type: 'WAREHOUSE' | 'STORE'
}

interface Product {
  id: string
  sku: string
  name: string
  brand?: string | null
  model?: string | null
  category: string
  pricePen: number
  imageUrl?: string | null
}

interface ProductOptions {
  brands: string[]
  categories: string[]
}

interface InventoryTableProps {
  products: InventoryItem[]
  locations: Location[]
  productOptions?: ProductOptions
}

export function InventoryTable({ products, locations, productOptions }: InventoryTableProps) {
  const [search, setSearch] = useState('')
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<InventoryItem | null>(null)
  const [isPending, startTransition] = useTransition()
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [stockFilter, setStockFilter] = useState('Todos')
  const [localProducts, setLocalProducts] = useState(products)

  const [optimisticProducts, addOptimisticProduct] = useOptimistic(
    products,
    (state, newProduct: InventoryItem) => [...state, newProduct]
  )

  useEffect(() => {
    setLocalProducts(products)
  }, [products])

  const filteredProducts = optimisticProducts.filter((product) => {
    const q = search.toLowerCase()
    const matchesSearch =
      product.name.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q) ||
      (product.brand?.toLowerCase().includes(q)) ||
      (product.model?.toLowerCase().includes(q))

    const totalStock = product.inventory.reduce((sum, inv) => sum + inv.stock, 0)

    const matchesCategory = categoryFilter === 'Todas' || product.category === categoryFilter

    const matchesStock =
      stockFilter === 'Todos' ||
      (stockFilter === 'En Stock' && totalStock > 10) ||
      (stockFilter === 'Stock Bajo' && totalStock > 0 && totalStock <= 10) ||
      (stockFilter === 'Agotado' && totalStock === 0)

    return matchesSearch && matchesCategory && matchesStock
  })

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
    startTransition(() => {
      addOptimisticProduct(optimisticProduct)
      setIsAddModalOpen(false)
    })
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

  const handleProductUpdated = (product: Product) => {
    const updated = product as unknown as InventoryItem
    setLocalProducts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p))
    setEditModalOpen(false)
    setProductToEdit(null)
    Swal.fire({
      title: 'Actualizado',
      text: `Producto ${updated.name} actualizado exitosamente.`,
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={20} />
            <Input
              type="text"
              placeholder="Buscar por SKU, nombre, marca o modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input rounded-2xl py-3.5 pl-12 pr-4 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-black/50 border-gray-800 text-gray-400 hover:text-cyan-400 focus:text-cyan-400 hover:border-gray-700 focus:border-primary/50 rounded-xl text-sm font-medium">
                  <Filter size={14} className="mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-800 text-white shadow-xl">
                  <SelectItem value="Todas">Todas las categorías</SelectItem>
                  {productOptions?.categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[160px] bg-black/50 border-gray-800 text-gray-400 hover:text-cyan-400 focus:text-cyan-400 hover:border-gray-700 focus:border-primary/50 rounded-xl text-sm font-medium">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-800 text-white shadow-xl">
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="En Stock">En Stock (&gt;10)</SelectItem>
                  <SelectItem value="Stock Bajo">Stock Bajo (1-10)</SelectItem>
                  <SelectItem value="Agotado">Agotado (0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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

<div className="relative z-10 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-muted-foreground text-[10px] uppercase tracking-[0.25em] font-bold bg-foreground/5">
                  <th className="px-4 py-4 w-20">Foto</th>
                  <th className="px-4 py-4 w-32">SKU</th>
                  <th className="px-4 py-4">Producto</th>
                  <th className="px-4 py-4 w-36">Marca</th>
                  <th className="px-4 py-4 w-36">Modelo</th>
                  <th className="px-4 py-4 w-32 text-center">Categoría</th>
                  <th className="px-4 py-4 w-32 text-center">Stock</th>
                  <th className="px-4 py-4">Ubicación / Sede</th>
                  <th className="px-4 py-4 w-28 text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredProducts.map((product) => {
                  const isExpanded = expandedProductId === product.id
                  const totalStock = getTotalStock(product)

                  return (
                    <Fragment key={product.id}>
                      <tr
                        onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                        className={cn(
                          "cursor-pointer transition-all duration-300 hover:bg-foreground/[0.02]",
                          isExpanded && "bg-primary/5"
                        )}
                      >
                        <td className="px-4 py-5 w-20">
                          <div className="w-16 h-16 rounded-xl border border-border overflow-hidden bg-card flex items-center justify-center">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                                <Package size={20} className="text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-5 w-32">
                          <span className="font-mono text-xs text-primary">{product.sku}</span>
                        </td>
                        <td className="px-4 py-5">
                          <span className="font-bold text-sm tracking-tight line-clamp-2">{product.name}</span>
                        </td>
                        <td className="px-4 py-5 w-36">
                          <span className={cn(
                            "text-xs text-muted-foreground truncate block",
                            !product.brand && "italic text-muted-foreground/50"
                          )}>
                            {product.brand || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-5 w-36">
                          <span className={cn(
                            "text-xs text-muted-foreground truncate block",
                            !product.model && "italic text-muted-foreground/50"
                          )}>
                            {product.model || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-5 w-32 text-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-secondary/30 border border-border/30 text-muted-foreground truncate block">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-5 w-24 text-center">
                          <span className={cn(
                            "text-sm font-bold px-2 py-1 rounded-lg inline-block",
                            totalStock === 0 ? "text-rose-400 bg-rose-500/10" :
                            totalStock <= 10 ? "text-amber-400 bg-amber-500/10" :
                            "text-emerald-400 bg-emerald-500/10"
                          )}>
                            {totalStock}
                          </span>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex flex-wrap gap-2">
                            {product.inventory && product.inventory.length > 0 ? (
                              product.inventory.map((stockItem) => {
                                if (stockItem.stock === 0) return null
                                return (
                                  <span
                                    key={stockItem.location.id}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border",
                                      stockItem.location.type === 'WAREHOUSE'
                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    )}
                                  >
                                    {stockItem.location.name}: {stockItem.stock} UND
                                  </span>
                                )
                              })
                            ) : (
                              <span className="text-xs text-muted-foreground/40 italic">Sin asignar</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-5 w-28 text-right">
                          <span className="text-sm font-bold text-foreground/80 whitespace-nowrap">
                            S/ {product.pricePen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-black/40">
                          <td colSpan={9} className="p-0">
                            <div className="glass-panel bg-black/40 border-primary/20 rounded-2xl p-8 border-l-4 border-l-primary/60 shadow-2xl space-y-6">
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
                                      onClick={(e) => { e.stopPropagation(); handleEdit(product) }}
                                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all text-sm font-bold"
                                    >
                                      <Pencil size={14} />
                                      Editar
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDelete(product) }}
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
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="py-16 text-center">
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
        brands={productOptions?.brands || []}
        categories={productOptions?.categories || []}
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
        onUpdated={handleProductUpdated as (product: Product) => void}
        brands={productOptions?.brands || []}
        categories={productOptions?.categories || []}
      />
    </div>
  )
}