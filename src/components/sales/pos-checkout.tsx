'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  User,
  Package,
  X,
  CheckCircle,
  Pencil,
  Percent,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePOSStore, type CartItem } from '@/stores/pos-store'
import { createSale, generateInvoiceNumber } from '@/app/actions/sale-actions'

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

interface POSCheckoutProps {
  products: Product[]
  customers: Array<{
    id: string
    name: string
    docType: string
    docNumber: string
  }>
  userId: string
  locationId: string
  locationName: string
}

export function POSCheckout({ products, customers, userId, locationId, locationName }: POSCheckoutProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [showCart, setShowCart] = useState(true)
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [saleComplete, setSaleComplete] = useState<{ invoiceNumber: string; total: number } | null>(null)
  const [editingPriceItem, setEditingPriceItem] = useState<CartItem | null>(null)
  const [newPriceInput, setNewPriceInput] = useState('')

  const { cart, addToCart, removeFromCart, updateQuantity, updateUnitPrice, clearCart, setCustomer } = usePOSStore()

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return ['ALL', ...Array.from(cats)]
  }, [products])

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter
    const hasStock = product.inventory.some(inv => inv.locationId === locationId && inv.stock > 0)
    return matchesSearch && matchesCategory && hasStock
  })

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const igv = cartTotal / 1.18
  const subtotal = cartTotal - igv
  const hasDiscountItems = cart.filter(i => i.hasDiscount)

  const handleAddToCart = (product: Product) => {
    const existing = cart.find(i => i.productId === product.id)
    if (existing) {
      updateQuantity(product.id, existing.quantity + 1)
    } else {
      addToCart({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        quantity: 1,
        unitPrice: product.pricePen,
        basePrice: product.pricePen
      })
    }
  }

  const handleSelectCustomer = (customer: typeof customers[0]) => {
    setSelectedCustomer(customer)
    setCustomer(customer.id)
    setShowCustomerSelect(false)
  }

  const handleOpenPriceEdit = (item: CartItem) => {
    setEditingPriceItem(item)
    setNewPriceInput(item.unitPrice.toFixed(2))
  }

  const handleSavePriceEdit = () => {
    if (!editingPriceItem) return
    const price = parseFloat(newPriceInput)
    if (isNaN(price) || price < 0) {
      Swal.fire({
        title: 'Precio inválido',
        text: 'Ingresa un precio válido mayor o igual a 0.',
        icon: 'error',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#00f7ff',
      })
      return
    }
    updateUnitPrice(editingPriceItem.productId, price)
    setEditingPriceItem(null)
    setNewPriceInput('')
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return

    setIsProcessing(true)
    try {
      const invoiceNumber = await generateInvoiceNumber()
      await createSale({
        customerId: selectedCustomer?.id || 'default-customer-id',
        userId,
        locationId,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          basePrice: item.basePrice,
          hasDiscount: item.hasDiscount,
          discountPct: item.basePrice > 0 ? ((item.basePrice - item.unitPrice) / item.basePrice) * 100 : 0,
          subtotal: item.subtotal
        })),
        totalAmount: cartTotal,
        invoiceNumber
      })
      setSaleComplete({ invoiceNumber, total: cartTotal })
      clearCart()
    } catch (error) {
      console.error('Error processing sale:', error)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo procesar la venta.',
        icon: 'error',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#00f7ff',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNewSale = () => {
    setSaleComplete(null)
    setSelectedCustomer(null)
  }

  if (saleComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex items-center justify-center"
      >
        <div className="glass-panel rounded-[2.5rem] p-12 text-center max-w-lg border-primary/30 shadow-[0_0_80px_rgba(0,247,255,0.2)]">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 neon-glow">
            <CheckCircle size={48} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">¡Venta Completada!</h2>
          <p className="text-muted-foreground mb-8">La transacción se registró exitosamente.</p>

          <div className="glass-panel bg-primary/5 border-primary/20 rounded-2xl p-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Factura</span>
                <span className="font-mono font-bold text-primary">{saleComplete.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Total</span>
                <span className="text-2xl font-black text-foreground">
                  S/ {saleComplete.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {hasDiscountItems.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-rose-400 text-sm">Rebajas aplicadas</span>
                  <span className="text-rose-400 font-bold">{hasDiscountItems.length} producto(s)</span>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleNewSale}
            className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold neon-glow hover:scale-[1.02] transition-all"
          >
            <Plus size={18} className="mr-2" />
            Nueva Venta
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="h-full flex gap-6">
      <div className={cn("flex-1 flex flex-col transition-all", showCart && "flex-0 w-[65%]")}>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border/30 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative group flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={20} />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full glass-input rounded-xl py-3 pl-12 pr-4"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="glass-input rounded-xl py-3 px-4 bg-[#0a0a0a] text-white appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'Todas las categorías' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const stock = product.inventory.find(inv => inv.locationId === locationId)?.stock || 0
                const inCart = cart.find(i => i.productId === product.id)

                return (
                  <button
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    disabled={stock === 0}
                    className={cn(
                      "glass-panel p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]",
                      "border-border/30 hover:border-primary/40 hover:bg-primary/5",
                      stock === 0 && "opacity-50 cursor-not-allowed",
                      inCart && "border-primary/50 bg-primary/10"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-mono text-primary/60">{product.sku}</span>
                      {inCart && (
                        <span className="text-[10px] font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                          {inCart.quantity} en cart
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm mb-1 line-clamp-2">{product.name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-primary">
                        S/ {product.pricePen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        stock > 10 ? "text-emerald-400" : stock > 0 ? "text-amber-400" : "text-rose-400"
                      )}>
                        {stock} und
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={cn(
        "glass-panel rounded-3xl flex flex-col transition-all duration-300",
        showCart ? "w-[35%] opacity-100" : "w-0 opacity-0 overflow-hidden"
      )}>
        <div className="p-6 border-b border-border/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-primary" />
            <h3 className="font-bold">Carrito de Venta</h3>
            <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          </div>
          <button onClick={() => setShowCart(false)} className="p-2 hover:bg-foreground/5 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        {!selectedCustomer ? (
          <div className="p-6 space-y-4">
            <button
              onClick={() => setShowCustomerSelect(true)}
              className="w-full glass-panel border-dashed border-2 border-primary/30 rounded-xl p-4 flex items-center gap-4 hover:bg-primary/5 transition-all"
            >
              <User size={20} className="text-primary" />
              <div className="text-left">
                <p className="font-bold text-sm">Sin cliente asignado</p>
                <p className="text-xs text-muted-foreground">Click para seleccionar cliente</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="px-6 py-3 bg-primary/5 border-b border-border/30 flex items-center gap-3">
            <User size={16} className="text-primary" />
            <div>
              <p className="font-bold text-xs">{selectedCustomer.name}</p>
              <p className="text-[10px] text-muted-foreground">{selectedCustomer.docType} {selectedCustomer.docNumber}</p>
            </div>
            <button onClick={() => { setSelectedCustomer(null); setCustomer(null) }} className="ml-auto p-1">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package size={32} strokeWidth={1} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Carrito vacío</p>
              <p className="text-xs">Agrega productos para comenzar</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className={cn(
                "glass-panel rounded-xl p-4 bg-foreground/[0.02]",
                item.hasDiscount && "border-rose-500/30 bg-rose-500/5"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs line-clamp-1">{item.name}</p>
                      {item.hasDiscount && (
                        <span className="flex items-center gap-1 text-[8px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          <Percent size={8} />
                          -{((item.basePrice - item.unitPrice) / item.basePrice * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.sku}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenPriceEdit(item)}
                      className="p-1 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary transition-all"
                      title="Editar precio"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1 hover:bg-rose-500/10 rounded text-muted-foreground hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                      className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center hover:bg-primary/10 transition-all"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-sm w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center hover:bg-primary/10 transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="text-right">
                    {item.hasDiscount ? (
                      <>
                        <p className="text-[10px] text-rose-400 line-through">
                          S/ {item.basePrice.toFixed(2)} c/u
                        </p>
                        <p className="font-black text-rose-400">S/ {item.unitPrice.toFixed(2)} c/u</p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">S/ {item.unitPrice.toFixed(2)} c/u</p>
                    )}
                    <p className={cn(
                      "font-black",
                      item.hasDiscount ? "text-rose-400" : "text-primary"
                    )}>
                      S/ {item.subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-border/30 space-y-4 bg-background/40">
          {hasDiscountItems.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <Percent size={14} className="text-rose-400" />
              <span className="text-[10px] font-bold text-rose-400">
                {hasDiscountItems.length} producto(s) con precio rebajado
              </span>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span>S/ {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>IGV (18%)</span>
              <span>S/ {igv.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-lg font-black">
              <span>Total</span>
              <span className="text-primary neon-glow">S/ {cartTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Procesando...
              </div>
            ) : (
              <>
                <CreditCard size={18} className="mr-2" />
                Cobrar S/ {cartTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </>
            )}
          </Button>

          <p className="text-[10px] text-center text-muted-foreground">
            {locationName} • Venta al contado
          </p>
        </div>
      </div>

      {!showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed right-6 bottom-6 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-[0_0_30px_rgba(0,247,255,0.4)] flex items-center justify-center hover:scale-[1.05] transition-all"
        >
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      )}

      {showCustomerSelect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-panel rounded-[2rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-border/30 flex justify-between items-center">
              <h2 className="text-xl font-bold">Seleccionar Cliente</h2>
              <button onClick={() => setShowCustomerSelect(false)} className="p-2 hover:bg-foreground/5 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 border-b border-border/30">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
                <Input
                  type="text"
                  placeholder="Buscar cliente..."
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {customers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="w-full glass-panel rounded-xl p-4 flex items-center gap-4 hover:bg-primary/5 transition-all text-left"
                >
                  <User size={20} className="text-primary" />
                  <div>
                    <p className="font-bold text-sm">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.docType} {customer.docNumber}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {editingPriceItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="glass-panel rounded-[2rem] w-full max-w-md p-8 border-primary/30"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-1">Editar Precio</h3>
              <p className="text-sm text-muted-foreground">{editingPriceItem.name}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-foreground/5">
                <span className="text-xs text-muted-foreground">Precio catálogo</span>
                <span className="font-bold line-through text-muted-foreground">
                  S/ {editingPriceItem.basePrice.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Nuevo Precio (PEN)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={newPriceInput}
                    onChange={(e) => setNewPriceInput(e.target.value)}
                    className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-sm font-bold"
                    autoFocus
                  />
                </div>
              </div>

              {parseFloat(newPriceInput) < editingPriceItem.basePrice && parseFloat(newPriceInput) > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <Percent size={14} className="text-rose-400" />
                  <span className="text-xs font-bold text-rose-400">
                    Rebaja de {((editingPriceItem.basePrice - parseFloat(newPriceInput)) / editingPriceItem.basePrice * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                onClick={() => setEditingPriceItem(null)}
                variant="ghost"
                className="flex-1 py-3 rounded-xl text-sm font-bold text-foreground/40 hover:text-foreground"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePriceEdit}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold neon-glow"
              >
                Guardar Precio
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}