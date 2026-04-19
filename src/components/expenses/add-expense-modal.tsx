'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { X, Receipt, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createExpense } from '@/app/actions/expense-actions'

interface AddExpenseModalProps {
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIES = [
  { value: 'RENT', label: 'Alquiler' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'UTILITIES', label: 'Servicios (Luz, Agua, Internet)' },
  { value: 'LOGISTICS', label: 'Logística' },
  { value: 'SUPPLIES', label: 'Insumos de Oficina' },
  { value: 'OTHER', label: 'Otros' },
]

export function AddExpenseModal({ onClose, onSuccess }: AddExpenseModalProps) {
  const [category, setCategory] = useState('RENT')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('PENDING')
  const [date, setDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await createExpense({
        category,
        description,
        amountPen: parseFloat(amount),
        status,
      })
      onSuccess()
    } catch (err) {
      setError('Error al crear el gasto. Intenta de nuevo.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-panel rounded-[2.5rem] w-full max-w-2xl p-10 relative overflow-hidden border-primary/30 shadow-[0_0_80px_rgba(0,247,255,0.15)]"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full -ml-24 -mb-24 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Registrar Nuevo Gasto</h2>
              <p className="text-foreground/40 text-sm mt-1">Agrega un gasto operativo a tu registro.</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-500 text-xs font-bold text-center mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Fecha</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm cursor-pointer"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descripción</label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Alquiler mensual de local - Av. Javier Prado"
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Monto (PEN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-sm font-bold"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Estado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm cursor-pointer"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="PAID">Pagado</option>
                </select>
              </div>
            </div>

            <div className="border-2 border-dashed border-border/30 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-3">
                <Upload size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Subir comprobante (opcional)</p>
              <Button variant="outline" type="button" size="sm" className="rounded-xl text-xs">
                Seleccionar Archivo
              </Button>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                className="px-6 py-3 rounded-xl text-sm font-bold text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Creando...
                  </div>
                ) : (
                  'Registrar Gasto'
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}