'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, CheckIcon, PlusIcon } from 'lucide-react'
import { Input } from './input'

interface CreatableSelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
}

export function CreatableSelect({ value, onChange, options, placeholder = 'Seleccionar...', className }: CreatableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const [showAdd, setShowAdd] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  const filtered = options.filter(o =>
    o.toLowerCase().includes(inputValue.toLowerCase())
  )

  const exactMatch = options.some(o => o.toLowerCase() === inputValue.toLowerCase())
  const canAdd = inputValue.trim().length > 0 && !exactMatch

  const handleAdd = () => {
    if (canAdd) {
      onChange(inputValue.trim())
      setInputValue('')
      setShowAdd(false)
      setIsOpen(false)
    }
  }

  React.useEffect(() => {
    if (!isOpen) {
      setInputValue('')
      setShowAdd(false)
    }
  }, [isOpen])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 rounded-xl border border-input bg-popover/30 py-3 px-4 text-sm transition-all',
          'hover:bg-popover/50 focus:outline-none focus:border-primary/50',
          isOpen && 'border-primary/50 bg-popover/50'
        )}
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value || placeholder}
        </span>
        <ChevronDownIcon className={cn('size-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover border border-border rounded-xl shadow-xl backdrop-blur-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Buscar o escribir nuevo..."
              className="w-full bg-transparent border-none outline-none text-sm text-popover-foreground placeholder-muted-foreground px-2 py-1.5"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 && inputValue.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">Sin opciones</p>
            )}

            {filtered.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => { onChange(option); setIsOpen(false) }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors',
                  'hover:bg-secondary/50 text-popover-foreground',
                  option === value && 'bg-primary/20 text-primary'
                )}
              >
                <span>{option}</span>
                {option === value && <CheckIcon className="size-3 text-primary" />}
              </button>
            ))}

            {canAdd && !showAdd && (
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors"
              >
                <PlusIcon className="size-3" />
                Agregar &quot;{inputValue.trim()}&quot;
              </button>
            )}

            {showAdd && (
              <div className="p-2 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    readOnly
                    className="flex-1 h-8 text-xs bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition-all"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}
