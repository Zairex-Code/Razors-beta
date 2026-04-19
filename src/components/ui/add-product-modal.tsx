'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import {
  X,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { createProduct } from '@/app/actions/product-actions'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (product: { id: string, name: string, sku: string, category: string }) => void
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

export function AddProductModal({ isOpen, onClose, onCreated }: AddProductModalProps) {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [category, setCategory] = useState('Otros')
  const [pricePen, setPricePen] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name || !category || !pricePen) return
    setIsCreating(true)
    try {
      const autoSku = generateSku()
      const product = await createProduct({
        sku: autoSku,
        name,
        brand: brand || undefined,
        model: model || undefined,
        category,
        pricePen: parseFloat(pricePen)
      })
      onCreated({ id: product.id, name: product.name, sku: product.sku, category: product.category })
      setName('')
      setBrand('')
      setModel('')
      setCategory('Otros')
      setPricePen('')
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

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
            <h3 className="text-xl font-bold tracking-tight">Agregar Producto Nuevo</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-muted-foreground text-sm">Registra un producto que no existe en el inventario.</p>

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
              onClick={handleCreate}
              disabled={!name || !category || !pricePen || isCreating}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Crear Producto
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
