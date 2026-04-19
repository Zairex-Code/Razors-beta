import { getExpenses } from '@/app/actions/expense-actions'
import ExpensesPageClient from './ExpensesPageClient'

export default async function ExpensesPage() {
  const expenses = await getExpenses()

  const formattedExpenses = expenses.map(expense => ({
    ...expense,
    date: expense.date instanceof Date ? expense.date.toISOString() : expense.date
  }))

  return <ExpensesPageClient initialExpenses={formattedExpenses} />
}