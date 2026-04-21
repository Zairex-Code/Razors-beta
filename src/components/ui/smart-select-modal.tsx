'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Search, Plus, X, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SmartSelectModalProps {
  isOpen: boolean
  onClose: () => void
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  onCreateNew?: (name: string) => Promise<string | null>
  placeholder?: string
}

export function SmartSelectModal({
  isOpen,
  onClose,
  label,
  value,
  onChange,
  options,
  onCreateNew,
  placeholder = 'Buscar por nombre...',
}: SmartSelectModalProps) {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      setShowCreate(false)
      setNewItemName('')
      setIsCreating(false)
    }
  }, [isOpen])

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  )

  const exactMatch = options.some(o => o.toLowerCase() === search.toLowerCase())
  const canCreate = search.trim().length > 0 && !exactMatch && onCreateNew

  const handleSelect = (option: string) => {
    onChange(option)
    onClose()
  }

  const handleCreate = async () => {
    if (!newItemName.trim() || !onCreateNew) return

    setIsCreating(true)
    try {
      const created = await onCreateNew(newItemName.trim())
      if (created) {
        onChange(created)
        onClose()
      }
    } catch (error) {
      console.error('Error creating item:', error)
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
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-panel rounded-[2rem] w-full max-w-lg p-8 relative overflow-hidden border-primary/30 shadow-[0_0_80px_rgba(0,247,255,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full -ml-24 -mb-24 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Seleccionar {label}</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Busca o crea una nueva {label.toLowerCase()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {!showCreate ? (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-popover/80 border border-input focus:border-primary rounded-xl py-3.5 pl-12 pr-4 text-popover-foreground placeholder-muted-foreground outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredOptions.length === 0 && search.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No hay {label.toLowerCase()}s registrados
                  </p>
                )}

                {filteredOptions.length === 0 && search.length > 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No se encontraron resultados
                  </p>
                )}

                {filteredOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all",
                      option === value
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-secondary/30 border-input hover:bg-secondary/50"
                    )}
                  >
                    <span className="font-medium">{option}</span>
                    {option === value && (
                      <CheckCircle size={16} className="inline ml-2" />
                    )}
                  </button>
                ))}

                {canCreate && (
                  <button
                    onClick={() => {
                      setNewItemName(search.trim())
                      setShowCreate(true)
                    }}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-3"
                  >
                    <Plus size={20} />
                    <span className="font-bold">Agregar nueva {label.toLowerCase()}</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Nueva {label}
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`Nombre de la nueva ${label.toLowerCase()}`}
                  className="w-full bg-popover/80 border border-input focus:border-primary rounded-xl py-3.5 px-4 text-sm text-popover-foreground placeholder-muted-foreground outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all"
                >
                  Cancelar
                </button>
                <Button
                  onClick={handleCreate}
                  disabled={!newItemName.trim() || isCreating}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Crear {label}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
