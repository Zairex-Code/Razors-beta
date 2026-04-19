'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCustomer } from '@/app/actions/customer-actions'

interface AddCustomerModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function AddCustomerModal({ onClose, onSuccess }: AddCustomerModalProps) {
  const [docType, setDocType] = useState('RUC')
  const [docNumber, setDocNumber] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await createCustomer({
        docType,
        docNumber,
        name,
        email: email || undefined
      })
      onSuccess()
    } catch (err) {
      setError('Error al crear el cliente. Verifica que el número de documento no esté registrado.')
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
              <h2 className="text-3xl font-bold tracking-tight">Agregar Nuevo Cliente</h2>
              <p className="text-foreground/40 text-sm mt-1">Registra un nuevo cliente o empresa en tu base de datos.</p>
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
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tipo de Documento</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm bg-[#0a0a0a] text-white appearance-none"
                >
                  <option value="RUC">RUC</option>
                  <option value="DNI">DNI</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Número de Documento</label>
                <Input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder={docType === 'RUC' ? '20601234567' : '12345678'}
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm"
                  maxLength={docType === 'RUC' ? 11 : 8}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre / Razón Social</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Barbería El Corte Real S.A.C."
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. contacto@empresa.com"
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Teléfono</label>
                <Input
                  type="tel"
                  placeholder="+51 987 654 321"
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Dirección de Entrega</label>
                <Input
                  type="text"
                  placeholder="e.g. Av. Javier Prado Este 123, San Isidro"
                  className="w-full glass-input rounded-xl py-3 px-4 text-sm"
                />
              </div>
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
                  'Guardar Cliente'
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}