'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Search,
  Receipt,
  Plus,
  Download,
  Eye,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateExpenseStatus, deleteExpense } from '@/app/actions/expense-actions'

interface Expense {
  id: string
  date: Date | string
  category: string
  description: string
  amountPen: number
  status: string
  voucherUrl: string | null
}

interface ExpensesTableProps {
  expenses: Expense[]
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  RENT: { label: 'Alquiler', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  MARKETING: { label: 'Marketing', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  UTILITIES: { label: 'Servicios', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  LOGISTICS: { label: 'Logística', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  SUPPLIES: { label: 'Insumos', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  OTHER: { label: 'Otros', color: 'bg-foreground/5 text-muted-foreground border-border' },
}

const CATEGORIES = ['RENT', 'MARKETING', 'UTILITIES', 'LOGISTICS', 'SUPPLIES', 'OTHER']

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null)

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(search.toLowerCase()) ||
      expense.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || expense.category === categoryFilter
    const matchesStatus = statusFilter === 'ALL' || expense.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalExpenses = filteredExpenses.reduce((acc, exp) => acc + exp.amountPen, 0)
  const paidExpenses = filteredExpenses.filter((exp) => exp.status === 'PAID').reduce((acc, exp) => acc + exp.amountPen, 0)
  const pendingExpenses = filteredExpenses.filter((exp) => exp.status === 'PENDING').reduce((acc, exp) => acc + exp.amountPen, 0)

  const handleStatusChange = async (expenseId: string, newStatus: string) => {
    try {
      await updateExpenseStatus(expenseId, newStatus)
      window.location.reload()
    } catch (error) {
      console.error('Error updating expense status:', error)
    }
  }

  const handleDelete = async (expenseId: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return

    try {
      await deleteExpense(expenseId)
      window.location.reload()
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={20} />
          <Input
            type="text"
            placeholder="Buscar por descripción o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-2xl py-3.5 pl-12 pr-4 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="glass-input rounded-xl py-2.5 px-4 text-sm bg-[#0a0a0a] text-white appearance-none"
          >
            <option value="ALL">Todas las categorías</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_CONFIG[cat]?.label ?? cat}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input rounded-xl py-2.5 px-4 text-sm bg-[#0a0a0a] text-white appearance-none"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PAID">Pagado</option>
            <option value="PENDING">Pendiente</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Gastos</p>
          <p className="text-2xl font-black text-foreground">
            S/ {totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Pagados</p>
          <p className="text-2xl font-black text-emerald-400">
            S/ {paidExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">Pendientes</p>
          <p className="text-2xl font-black text-amber-400">
            S/ {pendingExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2 min-w-[800px]">
            <thead>
              <tr className="text-muted-foreground text-[10px] uppercase tracking-[0.25em] font-bold">
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 text-right">Monto (PEN)</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => {
                const isExpanded = expandedExpenseId === expense.id
                const categoryConfig = CATEGORY_CONFIG[expense.category] ?? CATEGORY_CONFIG.OTHER

                return (
                  <tr key={expense.id}>
                    <td colSpan={6} className="p-0">
                      <div
                        onClick={() => setExpandedExpenseId(isExpanded ? null : expense.id)}
                        className={cn(
                          "group transition-all duration-300 rounded-2xl",
                          isExpanded
                            ? "bg-primary/5 border border-primary/40"
                            : "bg-foreground/[0.03] border border-transparent hover:border-primary/20"
                        )}
                      >
                        <div className="grid grid-cols-12 items-center">
                          <div className="px-6 py-4 col-span-2">
                            <span className="text-sm font-medium text-foreground/80">
                              {format(new Date(expense.date), 'dd/MM/yyyy', { locale: es })}
                            </span>
                          </div>
                          <div className="px-6 py-4 col-span-2">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border",
                              categoryConfig.color
                            )}>
                              {categoryConfig.label}
                            </span>
                          </div>
                          <div className="px-6 py-4 col-span-4">
                            <span className="text-sm font-medium">{expense.description}</span>
                          </div>
                          <div className="px-6 py-4 col-span-2 text-right">
                            <span className="text-sm font-bold text-foreground">
                              S/ {expense.amountPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="px-6 py-4 col-span-1 text-center">
                            <select
                              value={expense.status}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleStatusChange(expense.id, e.target.value)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={cn(
                                "text-sm font-medium px-3 py-1.5 rounded-lg border cursor-pointer transition-colors outline-none focus:border-cyan-500 bg-gray-950 text-white",
                                expense.status === 'PAID'
                                  ? "border-green-500/30 text-green-400"
                                  : "border-amber-500/30 text-amber-400"
                              )}
                              style={{ backgroundColor: 'rgb(3 3 3 / 1)' }}
                            >
                              <option value="PAID" className="bg-gray-950 text-white">Pagado</option>
                              <option value="PENDING" className="bg-gray-950 text-white">Pendiente</option>
                            </select>
                          </div>
                          <div className="px-6 py-4 col-span-1 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedExpenseId(isExpanded ? null : expense.id)
                              }}
                              className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(expense.id)
                              }}
                              className="p-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all ml-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-8 pb-6 pt-2 w-full">
                            <div className="glass-panel rounded-b-2xl border-x border-b border-primary/40 bg-primary/[0.02] p-6">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Descripción Completa</p>
                                    <p className="text-sm text-foreground/70">{expense.description}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Fecha</p>
                                      <p className="text-sm font-medium">
                                        {format(new Date(expense.date), 'dd MMMM yyyy', { locale: es })}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Monto</p>
                                      <p className="text-lg font-black text-primary">
                                        S/ {expense.amountPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                  {expense.voucherUrl ? (
                                    <Button variant="outline" className="rounded-xl gap-2">
                                      <Download size={14} />
                                      Descargar Comprobante
                                    </Button>
                                  ) : (
                                    <p className="text-xs text-muted-foreground text-center py-2">
                                      Sin comprobante adjunto
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground opacity-40">
                      <Receipt size={48} strokeWidth={1} className="mb-4" />
                      <p className="text-sm">No hay gastos registrados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}