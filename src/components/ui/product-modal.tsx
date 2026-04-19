'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  X,
  CheckCircle,
  Loader2,
  Edit3,
} from 'lucide-react'
import { createProduct, updateProduct } from '@/app/actions/product-actions'

interface Product {
  id: string
  sku: string
  name: string
  brand?: string | null
  model?: string | null
  category: string
  pricePen: number
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  product?: Product
  onCreated: (product: { id: string, name: string, sku: string, category: string }) => void
  onUpdated: (product: Product) => void
}

const CATEGORIES = ['Máquinas', 'Cuchillas', 'Cosméticos', 'Muebles', 'Peines', 'Otros']

function generateSku(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const nums = '0123456789'
  let sku = 'PRD-'
  for (let i = 0; i < 2; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  for (let i = 0; i < 4; i++) {
    sku += nums.charAt(Math.floor(Math.random() * nums.length))
  }
  return sku
}

export function ProductModal({ isOpen, onClose, mode, product, onCreated, onUpdated }: ProductModalProps) {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [category, setCategory] = useState('Otros')
  const [pricePen, setPricePen] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && product) {
      setName(product.name)
      setBrand(product.brand || '')
      setModel(product.model || '')
      setCategory(product.category)
      setPricePen(product.pricePen.toString())
    } else {
      setName('')
      setBrand('')
      setModel('')
      setCategory('Otros')
      setPricePen('')
    }
  }, [mode, product, isOpen])

  const handleSubmit = async () => {
    if (!name || !category || !pricePen) return
    setIsSubmitting(true)
    try {
      if (mode === 'create') {
        const autoSku = generateSku()
        const newProduct = await createProduct({
          sku: autoSku,
          name,
          brand: brand || undefined,
          model: model || undefined,
          category,
          pricePen: parseFloat(pricePen)
        })
        onCreated({ id: newProduct.id, name: newProduct.name, sku: newProduct.sku, category: newProduct.category })
      } else if (mode === 'edit' && product) {
        const updated = await updateProduct(product.id, {
          name,
          brand: brand || undefined,
          model: model || undefined,
          category,
          pricePen: parseFloat(pricePen)
        })
        onUpdated({ ...product, name: updated.name, brand: updated.brand, model: updated.model, category: updated.category, pricePen: updated.pricePen })
      }
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const isDisabled = !name || !category || !pricePen || isSubmitting

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel p-8 rounded-[2.5rem] border-border/30 relative w-full max-w-md"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mode === 'edit' && <Edit3 size={20} className="text-primary" />}
              <h3 className="text-xl font-bold tracking-tight">
                {mode === 'create' ? 'Agregar Producto Nuevo' : 'Editar Producto'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-muted-foreground text-sm">
            {mode === 'create' ? 'Registra un producto que no existe en el inventario.' : `Editando: ${product?.sku}`}
          </p>

            <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del producto"
                className="w-full glass-input rounded-xl py-3 px-4 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Marca</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Wahl, Babyliss..."
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Modelo</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Guía #2, Inalámbrica..."
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Categoría</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input rounded-xl py-3 px-4 text-sm bg-[#0a0a0a] text-white appearance-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Precio (PEN)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={pricePen}
                  onChange={(e) => setPricePen(e.target.value)}
                  placeholder="0.00"
                  className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-sm font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === 'create' ? 'Creando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  {mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}