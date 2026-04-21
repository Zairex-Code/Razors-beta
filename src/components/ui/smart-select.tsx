'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Plus, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartSelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  onCreateNew?: (name: string) => Promise<string | null>
  placeholder?: string
  label?: string
}

export function SmartSelect({
  value,
  onChange,
  options,
  onCreateNew,
  placeholder = 'Seleccionar...',
  label,
}: SmartSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setShowCreate(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      setShowCreate(false)
      setNewItemName('')
    }
  }, [isOpen])

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  )

  const exactMatch = options.some(o => o.toLowerCase() === search.toLowerCase())
  const canCreate = search.trim().length > 0 && !exactMatch && onCreateNew

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setSearch('')
  }

  const handleCreate = async () => {
    if (!newItemName.trim() || !onCreateNew) return
    setIsCreating(true)
    try {
      const created = await onCreateNew(newItemName.trim())
      if (created) {
        onChange(created)
        setIsOpen(false)
        setSearch('')
        setShowCreate(false)
      }
    } catch (error) {
      console.error('Error creating item:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1.5 block">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 rounded-xl border bg-popover/30 py-3 px-4 text-sm transition-all hover:bg-popover/50",
          isOpen ? "border-primary/50 bg-popover/50 ring-1 ring-primary/20" : "border-input"
        )}
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value || placeholder}
        </span>
        <ChevronRight
          size={16}
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-popover border border-border rounded-xl shadow-xl backdrop-blur-xl overflow-hidden">
          {!showCreate ? (
            <>
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full bg-popover/80 border border-input focus:border-primary rounded-lg py-2.5 pl-10 pr-4 text-sm text-popover-foreground placeholder-muted-foreground outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                {filteredOptions.length === 0 && search.length === 0 && (
                  <p className="text-center text-muted-foreground py-6 text-xs">
                    Sin opciones disponibles
                  </p>
                )}

                {filteredOptions.length === 0 && search.length > 0 && (
                  <p className="text-center text-muted-foreground py-6 text-xs">
                    Sin resultados
                  </p>
                )}

                {filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-all text-sm",
                      option === value
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : "bg-transparent hover:bg-secondary/50 text-popover-foreground"
                    )}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                ))}

                {canCreate && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewItemName(search.trim())
                      setShowCreate(true)
                    }}
                    className="w-full p-3 rounded-lg border border-dashed border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus size={16} />
                    <span className="font-bold">Agregar nueva</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="p-3 space-y-3">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Nombre de la nueva ${label?.toLowerCase() || 'opción'}`}
                className="w-full bg-popover/80 border border-input focus:border-primary rounded-lg py-2.5 px-4 text-sm text-popover-foreground placeholder-muted-foreground outline-none transition-all"
                autoFocus
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!newItemName.trim() || isCreating}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Crear
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
