'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import {
  X,
  CheckCircle,
  Loader2,
  Edit3,
  Camera,
  Upload,
} from 'lucide-react'
import { createProduct, updateProduct, uploadProductImage } from '@/app/actions/product-actions'
import { SmartSelect } from '@/components/ui/smart-select'
import { cn } from '@/lib/utils'

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

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  product?: Product
  onCreated: (product: { id: string, name: string, sku: string, category: string }) => void
  onUpdated: (product: Product) => void
  brands?: string[]
  categories?: string[]
}

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

export function ProductModal({ isOpen, onClose, mode, product, onCreated, onUpdated, brands = [], categories = [] }: ProductModalProps) {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [category, setCategory] = useState('')
  const [pricePen, setPricePen] = useState('')
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mode === 'edit' && product) {
      setName(product.name)
      setBrand(product.brand || '')
      setModel(product.model || '')
      setCategory(product.category)
      setPricePen(product.pricePen.toString())
      if (product.imageUrl) {
        setImageUrl(product.imageUrl)
        setImagePreview(product.imageUrl)
      } else {
        setImageUrl(undefined)
        setImagePreview(null)
      }
    } else {
      setName('')
      setBrand('')
      setModel('')
      setCategory('')
      setPricePen('')
      setImageUrl(undefined)
      setImagePreview(null)
    }
  }, [mode, product, isOpen])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const url = await uploadProductImage(file)
      setImageUrl(url)
    } catch (err) {
      console.error('Error uploading image:', err)
      setImagePreview(product?.imageUrl || null)
      setImageUrl(product?.imageUrl ?? undefined)
    } finally {
      setIsUploading(false)
    }
  }

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
          pricePen: parseFloat(pricePen),
          imageUrl
        })
        onCreated({ id: newProduct.id, name: newProduct.name, sku: newProduct.sku, category: newProduct.category })
      } else if (mode === 'edit' && product) {
        const updated = await updateProduct(product.id, {
          name,
          brand: brand || undefined,
          model: model || undefined,
          category,
          pricePen: parseFloat(pricePen),
          imageUrl
        })
        onUpdated({ ...product, name: updated.name, brand: updated.brand, model: updated.model, category: updated.category, pricePen: updated.pricePen, imageUrl: updated.imageUrl })
      }
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateBrand = async (newBrand: string) => {
    setBrand(newBrand)
    return newBrand
  }

  const handleCreateCategory = async (newCategory: string) => {
    setCategory(newCategory)
    return newCategory
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
        className="glass-panel p-8 rounded-[2.5rem] border-border/30 relative w-full max-w-md max-h-[90vh] overflow-y-auto"
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

          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative w-full h-40 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-3 overflow-hidden",
              imagePreview
                ? "border-primary/50 bg-card/50"
                : "border-primary/40 bg-card/50 hover:border-primary/60 hover:bg-card/70"
            )}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-sm font-bold text-white">Cambiar imagen</span>
                </div>
              </>
            ) : isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">Subiendo...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera size={20} className="text-primary" />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Upload size={12} />
                  <span>Subir Imagen del Producto</span>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

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
                <SmartSelect
                  label="Marca"
                  value={brand}
                  onChange={setBrand}
                  options={brands}
                  onCreateNew={handleCreateBrand}
                  placeholder="Seleccionar marca..."
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
              <SmartSelect
                label="Categoría"
                value={category}
                onChange={setCategory}
                options={categories}
                onCreateNew={handleCreateCategory}
                placeholder="Seleccionar categoría..."
              />
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
