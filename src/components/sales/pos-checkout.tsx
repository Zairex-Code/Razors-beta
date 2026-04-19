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
  ArrowDown,
  ArrowUp,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePOSStore, type CartItem } from '@/stores/pos-store'
import { createSale, generateInvoiceNumber } from '@/app/actions/sale-actions'
import { createCustomer } from '@/app/actions/customer-actions'

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
  phone?: string | null
}

interface POSCheckoutProps {
  products: Product[]
  customers: Customer[]
  userId: string
  locationId: string
  locationName: string
}

export function POSCheckout({ products, customers, userId, locationId, locationName }: POSCheckoutProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [saleComplete, setSaleComplete] = useState<{ invoiceNumber: string; total: number } | null>(null)
  const [editingPriceItem, setEditingPriceItem] = useState<CartItem | null>(null)
  const [newPriceInput, setNewPriceInput] = useState('')

  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [showCreateCustomer, setShowCreateCustomer] = useState(false)
  const [newCustomerDocType, setNewCustomerDocType] = useState('DNI')
  const [newCustomerDocNumber, setNewCustomerDocNumber] = useState('')
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)

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

  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return customers
    const q = customerSearchQuery.toLowerCase()
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.docNumber.includes(q) ||
      (c.phone && c.phone.includes(customerSearchQuery))
    )
  }, [customers, customerSearchQuery])

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

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomer(customer.id)
    setShowCustomerSelect(false)
    setCustomerSearchQuery('')
    setShowCreateCustomer(false)
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

  const handleCreateCustomer = async () => {
    if (!newCustomerDocNumber.trim() || !newCustomerName.trim()) {
      Swal.fire({
        title: 'Campos requeridos',
        text: 'El número de documento y nombre son obligatorios.',
        icon: 'warning',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#00f7ff',
      })
      return
    }
    if (newCustomerDocType === 'RUC' && newCustomerDocNumber.length !== 11) {
      Swal.fire({ title: 'RUC inválido', text: 'El RUC debe tener 11 dígitos.', icon: 'error', background: '#0a0a0a', color: '#ffffff', confirmButtonColor: '#00f7ff' })
      return
    }
    if (newCustomerDocType === 'DNI' && newCustomerDocNumber.length !== 8) {
      Swal.fire({ title: 'DNI inválido', text: 'El DNI debe tener 8 dígitos.', icon: 'error', background: '#0a0a0a', color: '#ffffff', confirmButtonColor: '#00f7ff' })
      return
    }

    setIsCreatingCustomer(true)
    try {
      const newC = await createCustomer({
        docType: newCustomerDocType,
        docNumber: newCustomerDocNumber.trim(),
        name: newCustomerName.trim(),
        email: newCustomerEmail.trim() || undefined,
        phone: newCustomerPhone.trim() || undefined
      })
      handleSelectCustomer(newC)
      setNewCustomerDocType('DNI')
      setNewCustomerDocNumber('')
      setNewCustomerName('')
      setNewCustomerEmail('')
      setNewCustomerPhone('')
      Swal.fire({
        title: 'Cliente creado',
        text: `${newC.name} ha sido agregado exitosamente.`,
        icon: 'success',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#00f7ff',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      })
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'No se pudo crear el cliente.',
        icon: 'error',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#00f7ff',
      })
    } finally {
      setIsCreatingCustomer(false)
    }
  }

  const handleNewSale = () => {
    setSaleComplete(null)
    setSelectedCustomer(null)
  }

  const openCustomerModal = () => {
    setShowCustomerSelect(true)
    setShowCreateCustomer(false)
    setCustomerSearchQuery('')
  }

  const closeCustomerModal = () => {
    setShowCustomerSelect(false)
    setShowCreateCustomer(false)
    setCustomerSearchQuery('')
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
    <div className="h-full grid grid-cols-4 gap-0">
      <div className="col-span-3 flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="relative group flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <Input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-transparent"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-700 rounded-xl py-3 px-4 text-sm text-white appearance-none cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/50 bg-transparent"
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
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map(product => {
              const stock = product.inventory.find(inv => inv.locationId === locationId)?.stock || 0
              const inCart = cart.find(i => i.productId === product.id)

              return (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  disabled={stock === 0}
                  className={cn(
                    "relative flex flex-col justify-between p-5 rounded-2xl text-left transition-all duration-200",
                    "border backdrop-blur-xl",
                    stock === 0
                      ? "border-gray-800/50 opacity-40 cursor-not-allowed"
                      : inCart
                      ? "border-primary/60 bg-primary/5"
                      : "border-gray-800/60 hover:border-primary/40 hover:bg-primary/5 hover:scale-[1.01]",
                  )}
                  style={{ minHeight: '180px' }}
                >
                  {inCart && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                      {inCart.quantity} en cart
                    </span>
                  )}

                  <div className="space-y-1 flex-1">
                    <p className="text-[9px] font-mono text-primary/50 uppercase tracking-wider">{product.sku}</p>
                    <h4 className="font-bold text-sm leading-tight line-clamp-2 text-gray-100">{product.name}</h4>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">{product.category}</p>
                  </div>

                  <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-800/50">
                    <span className="text-xl font-black text-primary neon-glow">
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

      <div className="col-span-1 h-full flex flex-col bg-black/80 backdrop-blur-xl border-l border-gray-800">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-primary" />
            <h3 className="font-bold text-gray-100">Carrito</h3>
            <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          </div>
        </div>

        {!selectedCustomer ? (
          <div className="p-4 shrink-0">
            <button
              onClick={openCustomerModal}
              className="w-full border-2 border-dashed border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <User size={20} className="text-primary" />
              <div className="text-left">
                <p className="font-bold text-sm text-gray-200">Sin cliente</p>
                <p className="text-xs text-gray-500">Toca para seleccionar</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="px-4 py-3 bg-primary/5 border-b border-gray-800 flex items-center gap-3 shrink-0">
            <User size={16} className="text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-gray-100 truncate">{selectedCustomer.name}</p>
              <p className="text-[10px] text-gray-500">{selectedCustomer.docType} {selectedCustomer.docNumber}</p>
            </div>
            <button onClick={() => { setSelectedCustomer(null); setCustomer(null) }} className="p-1 text-gray-500 hover:text-gray-200">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Package size={40} strokeWidth={1} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Carrito vacío</p>
              <p className="text-xs mt-1">Agrega productos para comenzar</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className={cn(
                "rounded-xl p-4 border backdrop-blur-xl",
                item.hasDiscount
                  ? "bg-rose-500/5 border-rose-500/20"
                  : "bg-gray-900/40 border-gray-800"
              )}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-xs text-gray-100 line-clamp-1">{item.name}</p>
                      {item.hasDiscount && (
                        <span className="flex items-center gap-0.5 text-[8px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase shrink-0">
                          <Percent size={8} />
                          -{((item.basePrice - item.unitPrice) / item.basePrice * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-600 font-mono mt-0.5">{item.sku}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenPriceEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-gray-500 hover:text-primary transition-all"
                      title="Editar precio"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                      className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-all"
                    >
                      <Minus size={11} className="text-gray-400" />
                    </button>
                    <span className="font-bold text-sm text-gray-100 w-7 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-all"
                    >
                      <Plus size={11} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="text-right">
                    {item.hasDiscount ? (
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-rose-400 line-through">
                          S/ {item.basePrice.toFixed(2)}
                        </p>
                        <p className="font-black text-rose-400 text-sm">S/ {item.subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                      </div>
                    ) : (
                      <p className="font-black text-primary text-sm">
                        S/ {item.subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-800 space-y-4 bg-black/60 shrink-0">
          {hasDiscountItems.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <Percent size={13} className="text-rose-400 shrink-0" />
              <span className="text-[10px] font-bold text-rose-400">
                {hasDiscountItems.length} producto(s) con precio rebajado
              </span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span>
              <span>S/ {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>IGV (18%)</span>
              <span>S/ {igv.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-gray-100 pt-2 border-t border-gray-800">
              <span>Total</span>
              <span className="text-primary neon-glow">S/ {cartTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Procesando...
              </div>
            ) : (
              <>
                <CreditCard size={16} className="mr-2" />
                Cobrar S/ {cartTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </>
            )}
          </Button>

          <p className="text-[10px] text-center text-gray-600">
            {locationName} • Venta al contado
          </p>
        </div>
      </div>

      {showCustomerSelect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/90 backdrop-blur-xl rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-gray-800"
          >
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-100">
                {showCreateCustomer ? 'Agregar Nuevo Cliente' : 'Seleccionar Cliente'}
              </h2>
              <button onClick={closeCustomerModal} className="p-2 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-200 transition-all">
                <X size={20} />
              </button>
            </div>

            {!showCreateCustomer ? (
              <>
                <div className="p-4 border-b border-gray-800">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                      type="text"
                      placeholder="Buscar por nombre o número de documento..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="w-full border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary bg-transparent"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full rounded-xl p-4 flex items-center gap-4 border border-gray-800 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                    >
                      <User size={20} className="text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-100 truncate">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.docType} {customer.docNumber}{customer.phone ? ` • ${customer.phone}` : ''}</p>
                      </div>
                    </button>
                  ))}

                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <button
                      onClick={() => {
                        setShowCreateCustomer(true)
                        if (customerSearchQuery.trim()) {
                          setNewCustomerName(customerSearchQuery)
                        }
                      }}
                      className="w-full rounded-xl p-4 flex items-center gap-4 bg-primary/5 border border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                        <Plus size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-primary">Agregar nuevo cliente</p>
                        <p className="text-xs text-gray-500">
                          {customerSearchQuery.trim()
                            ? `Crear "${customerSearchQuery}" o buscar otro`
                            : 'Registrar un cliente nuevo en el sistema'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Tipo</label>
                    <select
                      value={newCustomerDocType}
                      onChange={(e) => setNewCustomerDocType(e.target.value)}
                      className="w-full border border-gray-700 rounded-xl py-2.5 px-4 text-sm bg-transparent focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="DNI">DNI</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Número</label>
                    <Input
                      type="text"
                      value={newCustomerDocNumber}
                      onChange={(e) => setNewCustomerDocNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder={newCustomerDocType === 'RUC' ? '20601234567' : '12345678'}
                      maxLength={newCustomerDocType === 'RUC' ? 11 : 8}
                      className="border border-gray-700 rounded-xl py-2.5 px-4 text-sm focus:border-primary bg-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Nombre / Razón Social</label>
                  <Input
                    type="text"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Nombre completo o razón social"
                    className="border border-gray-700 rounded-xl py-2.5 px-4 text-sm focus:border-primary bg-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email (opcional)</label>
                    <Input
                      type="email"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                      placeholder="email@ejemplo.com"
                      className="border border-gray-700 rounded-xl py-2.5 px-4 text-sm focus:border-primary bg-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Teléfono (opcional)</label>
                    <Input
                      type="tel"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="+51 987 654 321"
                      className="border border-gray-700 rounded-xl py-2.5 px-4 text-sm focus:border-primary bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowCreateCustomer(false)}
                    variant="ghost"
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-200"
                  >
                    Volver
                  </Button>
                  <Button
                    onClick={handleCreateCustomer}
                    disabled={isCreatingCustomer}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold neon-glow disabled:opacity-50"
                  >
                    {isCreatingCustomer ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Creando...
                      </div>
                    ) : (
                      'Guardar Cliente'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {editingPriceItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-black/90 backdrop-blur-xl rounded-3xl w-full max-w-md p-8 border border-gray-800"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-100 mb-1">Editar Precio</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{editingPriceItem.name}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-500">Precio catálogo</span>
                <span className="font-bold line-through text-gray-500">
                  S/ {editingPriceItem.basePrice.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                  Nuevo Precio (PEN)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={newPriceInput}
                    onChange={(e) => setNewPriceInput(e.target.value)}
                    className="w-full border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:border-primary bg-transparent"
                    autoFocus
                  />
                </div>
              </div>

              {(() => {
                const newPrice = parseFloat(newPriceInput)
                if (isNaN(newPrice) || newPrice <= 0) return null
                const diferencia = editingPriceItem.basePrice - newPrice
                if (diferencia === 0) return null
                if (diferencia > 0) {
                  return (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <ArrowDown size={14} className="text-rose-400 shrink-0" />
                      <span className="text-xs font-bold text-rose-400">
                        S/ {diferencia.toFixed(2)} de rebaja
                      </span>
                    </div>
                  )
                }
                return (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <ArrowUp size={14} className="text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-emerald-400">
                      S/ {Math.abs(diferencia).toFixed(2)} de recargo
                    </span>
                  </div>
                )
              })()}
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                onClick={() => setEditingPriceItem(null)}
                variant="ghost"
                className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-200"
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