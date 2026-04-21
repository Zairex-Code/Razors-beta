'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireBossOrAdmin } from './auth-actions'
import { roundCurrency } from '@/utils/math'

export async function getExpenses(status?: string) {
  return prisma.expense.findMany({
    where: status ? { status } : undefined,
    orderBy: { date: 'desc' }
  })
}

export async function getExpense(id: string) {
  return prisma.expense.findUnique({
    where: { id }
  })
}

export async function createExpense(data: {
  category: string
  description: string
  amountPen: number
  status: string
  voucherUrl?: string
  isRecurring?: boolean
  recurrenceInterval?: string
}) {
  await requireBossOrAdmin()

  const expense = await prisma.expense.create({
    data: {
      category: data.category,
      description: data.description,
      amountPen: roundCurrency(data.amountPen),
      status: data.status,
      voucherUrl: data.voucherUrl,
      isRecurring: data.isRecurring || false,
      recurrenceInterval: data.recurrenceInterval || null
    }
  })

  revalidatePath('/dashboard/expenses')
  return expense
}

export async function updateExpenseStatus(id: string, status: string) {
  await requireBossOrAdmin()

  const expense = await prisma.expense.findUnique({
    where: { id }
  })

  if (!expense) {
    throw new Error('Expense not found')
  }

  const updated = await prisma.expense.update({
    where: { id },
    data: { status }
  })

  if (status === 'PAID' && expense.isRecurring && expense.recurrenceInterval) {
    const nextDate = calculateNextDate(expense.date, expense.recurrenceInterval)

    await prisma.expense.create({
      data: {
        category: expense.category,
        description: expense.description,
        amountPen: expense.amountPen,
        status: 'PENDING',
        isRecurring: true,
        recurrenceInterval: expense.recurrenceInterval,
        date: nextDate
      }
    })
  }

  revalidatePath('/dashboard/expenses')
  return updated
}

function calculateNextDate(currentDate: Date, interval: string): Date {
  const date = new Date(currentDate)
  switch (interval) {
    case 'WEEKLY':
      date.setDate(date.getDate() + 7)
      break
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1)
      break
    case 'YEARLY':
      date.setFullYear(date.getFullYear() + 1)
      break
    default:
      date.setMonth(date.getMonth() + 1)
  }
  return date
}

export async function deleteExpense(id: string) {
  await requireBossOrAdmin()

  await prisma.expense.delete({
    where: { id }
  })

  revalidatePath('/dashboard/expenses')
}
