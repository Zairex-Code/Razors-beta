'use client'

import { useState } from 'react'
import { Receipt, Plus } from 'lucide-react'
import { ExpensesTable } from '@/components/expenses/expenses-table'
import { AddExpenseModal } from '@/components/expenses/add-expense-modal'
import { Button } from '@/components/ui/button'

interface Expense {
  id: string
  date: Date | string
  category: string
  description: string
  amountPen: number
  status: string
  voucherUrl: string | null
  isRecurring?: boolean
  recurrenceInterval?: string | null
}

interface ExpensesPageClientProps {
  initialExpenses: Expense[]
}

export default function ExpensesPageClient({ initialExpenses }: ExpensesPageClientProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleExpenseCreated = () => {
    setIsAddModalOpen(false)
    window.location.reload()
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Receipt size={24} className="text-primary" />
            </div>
            Gastos Operativos
          </h1>
          <p className="text-muted-foreground mt-1">Registra y gestiona tus gastos del negocio.</p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={18} />
          Nuevo Gasto
        </Button>
      </div>

      <ExpensesTable expenses={expenses} />

      {isAddModalOpen && (
        <AddExpenseModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleExpenseCreated}
        />
      )}
    </div>
  )
}