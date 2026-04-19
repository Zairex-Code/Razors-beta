'use client'

import { useState, useRef, useEffect, useCallback, startTransition } from 'react'
import { Search, Plus, Package, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type SearchItem = {
  id: string
  name: string
  sku?: string
  description?: string
}

interface SmartSearchProps<T extends SearchItem> {
  placeholder?: string
  onSelect: (item: T) => void
  onCreateNew?: (name: string) => Promise<T | null>
  searchFn: (query: string) => Promise<T[]>
  renderItem?: (item: T) => React.ReactNode
  className?: string
}

export function SmartSearch<T extends SearchItem>({
  placeholder = 'Search...',
  onSelect,
  onCreateNew,
  searchFn,
  renderItem,
  className
}: SmartSearchProps<T>) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const data = await searchFn(searchQuery)
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [searchFn])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        search(query)
      }, 300)
    } else {
      startTransition(() => {
        setResults([])
      })
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, search])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCreateNew = async () => {
    if (!onCreateNew || !query.trim()) return

    setIsCreating(true)
    try {
      const newItem = await onCreateNew(query.trim())
      if (newItem) {
        onSelect(newItem)
        setQuery('')
        setShowCreateModal(false)
      }
    } finally {
      setIsCreating(false)
    }
  }

  const exactMatchExists = results.some(
    r => r.name.toLowerCase() === query.toLowerCase()
  )

  return (
    <div ref={wrapperRef} className={cn('relative w-full', className)}>
      <div className="relative flex items-center w-full">
        <Search className="absolute left-4 w-5 h-5 text-primary" />
        {isLoading && <Loader2 className="absolute left-10 w-4 h-4 text-primary animate-spin" />}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-black/60 border border-gray-800 focus:border-primary rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all"
        />
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-[#111111] border border-gray-800 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-64 overflow-y-auto">
          {results.length === 0 && !isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item)
                  setIsOpen(false)
                  setQuery('')
                }}
                className="w-full text-left px-4 py-3 hover:bg-primary/10 border-b border-gray-900 last:border-0 flex items-center gap-3 transition-colors"
              >
                {renderItem ? renderItem(item) : (
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-500 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      {item.sku && (
                        <p className="text-primary/70 text-xs font-mono">{item.sku}</p>
                      )}
                    </div>
                  </div>
                )}
              </button>
            ))
          )}

          {!exactMatchExists && onCreateNew && (
            <button
              onClick={() => {
                setShowCreateModal(true)
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-3 bg-primary/5 hover:bg-primary/10 text-primary text-sm font-bold flex items-center gap-2 transition-colors border-t border-gray-800"
            >
              <Plus className="w-4 h-4" />
              Register new: &quot;{query}&quot;
            </button>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111111] border border-primary/30 rounded-[2rem] p-8 shadow-[0_0_40px_rgba(0,247,255,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold text-white tracking-tight">Register New Item</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-foreground/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Name</label>
                  <input
                    type="text"
                    value={query}
                    readOnly
                    className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-foreground/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNew}
                    disabled={isCreating || !query.trim()}
                    className="px-8 py-3 rounded-xl bg-primary text-black font-bold text-sm tracking-tight hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,247,255,0.3)] disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export type { SearchItem }
