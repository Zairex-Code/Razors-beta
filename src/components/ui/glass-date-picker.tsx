'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface GlassDatePickerProps {
  value: string | null
  onChange: (date: string | null) => void
  label?: string
  placeholder?: string
}

export function GlassDatePicker({
  value,
  onChange,
  label,
  placeholder = 'Seleccionar fecha...',
}: GlassDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      return new Date(value + 'T00:00:00')
    }
    return new Date()
  })
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

  useEffect(() => {
    if (value) {
      setViewDate(new Date(value + 'T00:00:00'))
    }
  }, [value])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const monthLabels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const selectDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(dateStr)
    setIsOpen(false)
  }

  const isSelected = (day: number) => {
    if (!value) return false
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return dateStr === value
  }

  const displayValue = value
    ? (() => {
        const d = new Date(value + 'T00:00:00')
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
      })()
    : ''

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
          "w-full flex items-center justify-between gap-2 rounded-xl border bg-popover/50 backdrop-blur-md py-3.5 px-4 text-sm transition-all hover:bg-popover/70",
          isOpen ? "border-primary/50 bg-popover/70 ring-1 ring-primary/20" : "border-input"
        )}
      >
        <span className={displayValue ? 'text-foreground' : 'text-muted-foreground'}>
          {displayValue || placeholder}
        </span>
        <Calendar size={16} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-foreground">
              {monthLabels[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayLabels.map(d => (
                <div key={d} className="text-center text-[10px] text-muted-foreground font-bold uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const selected = isSelected(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => selectDate(day)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-sm transition-all",
                      selected
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "text-popover-foreground hover:bg-primary/20 hover:text-primary"
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-3 border-t border-border">
            <button
              type="button"
              onClick={() => { onChange(null); setIsOpen(false) }}
              className="w-full py-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Limpiar fecha
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
