'use client'

import { useState } from 'react'
import { ArrowRight, Package, Search, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createTransfer } from '@/app/actions/location-actions'

type Location = {
  id: string
  name: string
}

type InventoryItem = {
  id: string
  productId: string
  locationId: string
  stock: number
  product: {
    id: string
    name: string
    sku: string
  }
  location: {
    id: string
    name: string
  }
}

export default function TransfersPageClient({
  locations,
  inventory
}: {
  locations: Location[]
  inventory: InventoryItem[]
}) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [fromLocation, setFromLocation] = useState<string>('')
  const [toLocation, setToLocation] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [isTransferring, setIsTransferring] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const productsInInventory = inventory.reduce((acc, inv) => {
    if (!acc[inv.productId]) {
      acc[inv.productId] = {
        ...inv.product,
        locations: []
      }
    }
    acc[inv.productId].locations.push({
      locationId: inv.locationId,
      locationName: inv.location.name,
      stock: inv.stock
    })
    return acc
  }, {} as Record<string, { id: string; name: string; sku: string; locations: { locationId: string; locationName: string; stock: number }[] }>)

  const filteredProducts = Object.values(productsInInventory).filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedProductData = selectedProduct ? productsInInventory[selectedProduct] : null
  const availableStock = selectedProductData?.locations.find(l => l.locationId === fromLocation)?.stock || 0

  const handleTransfer = async () => {
    if (!selectedProduct || !fromLocation || !toLocation || quantity < 1) return

    setIsTransferring(true)
    setError(null)
    setSuccess(false)

    try {
      await createTransfer({
        productId: selectedProduct,
        fromLocationId: fromLocation,
        toLocationId: toLocation,
        quantity
      })
      setSuccess(true)
      setQuantity(1)
      setFromLocation('')
      setToLocation('')
      setSelectedProduct(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed')
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
          <ArrowLeftRight className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Transferencias <span className="text-primary">entre Sedes</span>
          </h1>
          <p className="text-gray-500 mt-1">Mueve stock entre Almacén Central y Tienda Principal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4">Seleccionar Producto</h3>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o SKU..."
              className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product.id)
                  setFromLocation('')
                  setToLocation('')
                  setSuccess(false)
                }}
                className={cn(
                  'w-full text-left p-4 rounded-xl border transition-all',
                  selectedProduct === product.id
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-foreground/5 border-border hover:border-primary/30'
                )}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                  </div>
                </div>
                {selectedProduct === product.id && (
                  <div className="mt-3 pt-3 border-t border-primary/20">
                    <p className="text-xs text-gray-400 mb-2">Stock por ubicación:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.locations.map((loc) => (
                        <span
                          key={loc.locationId}
                          className="text-xs px-2 py-1 rounded bg-foreground/10 text-gray-300"
                        >
                          {loc.locationName}: {loc.stock}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-500 py-8">No se encontraron productos</p>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4">Realizar Transferencia</h3>

          {!selectedProduct ? (
            <p className="text-gray-500 text-center py-12">Selecciona un producto para continuar</p>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-foreground/5 border border-border">
                <p className="text-xs text-gray-400 mb-1">Producto seleccionado</p>
                <p className="font-bold text-white">{selectedProductData?.name}</p>
                <p className="text-xs text-gray-500 font-mono">{selectedProductData?.sku}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                    Origen (de)
                  </label>
                  <select
                    value={fromLocation}
                    onChange={(e) => {
                      setFromLocation(e.target.value)
                      setSuccess(false)
                    }}
                    className="w-full glass-input rounded-xl py-3 px-4 text-sm bg-[#0a0a0a] text-white appearance-none"
                  >
                    <option value="">Seleccionar sede de origen...</option>
                    {selectedProductData?.locations.map((loc) => (
                      <option key={loc.locationId} value={loc.locationId}>
                        {loc.locationName} ({loc.stock} unidades)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-primary rotate-90" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                    Destino (a)
                  </label>
                  <select
                    value={toLocation}
                    onChange={(e) => {
                      setToLocation(e.target.value)
                      setSuccess(false)
                    }}
                    className="w-full glass-input rounded-xl py-3 px-4 text-sm bg-[#0a0a0a] text-white appearance-none"
                  >
                    <option value="">Seleccionar sede de destino...</option>
                    {locations
                      .filter((loc) => loc.id !== fromLocation)
                      .map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                    Cantidad a transferir
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={availableStock}
                    value={quantity === 0 ? '' : quantity}
                    onChange={(e) => {
                      const val = e.target.value
                      setQuantity(val === '' ? 0 : parseInt(val) || 0)
                    }}
                    onBlur={(e) => {
                      if (quantity < 1) {
                        setQuantity(1)
                      }
                    }}
                    className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-primary focus:outline-none transition-all"
                  />
                  {fromLocation && (
                    <p className="text-xs text-gray-500 ml-1">
                      Stock disponible: {availableStock}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                  ¡Transferencia realizada con éxito!
                </div>
              )}

              <button
                onClick={handleTransfer}
                disabled={
                  !fromLocation ||
                  !toLocation ||
                  quantity < 1 ||
                  quantity > availableStock ||
                  isTransferring
                }
                className={cn(
                  'w-full py-3 rounded-xl font-bold text-sm tracking-tight transition-all',
                  fromLocation && toLocation && quantity >= 1 && quantity <= availableStock
                    ? 'bg-primary text-black hover:brightness-110 shadow-[0_0_20px_rgba(0,247,255,0.3)]'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                )}
              >
                {isTransferring ? 'Procesando...' : 'Confirmar Transferencia'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
