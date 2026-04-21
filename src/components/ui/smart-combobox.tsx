'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Plus, Search } from 'lucide-react'

interface SmartComboboxProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  label?: string
}

export function SmartCombobox({
  value,
  onChange,
  options,
  placeholder = 'Escribe o selecciona...',
  label,
}: SmartComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayValue = isOpen ? search : value

  const filteredOptions = options.filter(o =>
    o.toLowerCase().includes(search.toLowerCase())
  )

  const exactMatch = options.some(o => o.toLowerCase() === search.toLowerCase())
  const showCreateOption = search.trim().length > 0 && !exactMatch

  const handleSelect = (option: string) => {
    onChange(option)
    setSearch('')
    setIsOpen(false)
  }

  const handleCreate = () => {
    if (search.trim()) {
      onChange(search.trim())
      setSearch('')
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1.5 block">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-popover/50 border border-input backdrop-blur-md rounded-xl py-3 px-4 text-sm pr-10 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-all",
            !value && "text-muted-foreground"
          )}
        />
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-[100] bg-popover border border-border rounded-xl shadow-xl backdrop-blur-xl overflow-hidden">
          <div className="max-h-48 overflow-y-auto p-1.5">
            {filteredOptions.length === 0 && !showCreateOption && (
              <div className="p-3 text-center text-muted-foreground text-xs">
                Sin coincidencias
              </div>
            )}

            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full px-3 py-2.5 rounded-lg text-left text-sm text-popover-foreground hover:bg-secondary/50 transition-colors"
              >
                {option}
              </button>
            ))}

            {showCreateOption && (
              <button
                type="button"
                onClick={handleCreate}
                className="w-full px-3 py-2.5 rounded-lg text-left text-sm flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
              >
                <Plus size={14} />
                Crear nueva: <span className="font-bold">{search.trim()}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
