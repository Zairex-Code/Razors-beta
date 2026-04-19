'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireBossOrAdmin } from './auth-actions'

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
}) {
  await requireBossOrAdmin()

  const expense = await prisma.expense.create({
    data: {
      category: data.category,
      description: data.description,
      amountPen: data.amountPen,
      status: data.status,
      voucherUrl: data.voucherUrl
    }
  })

  revalidatePath('/dashboard/expenses')
  return expense
}

export async function updateExpenseStatus(id: string, status: string) {
  await requireBossOrAdmin()

  const expense = await prisma.expense.update({
    where: { id },
    data: { status }
  })

  revalidatePath('/dashboard/expenses')
  return expense
}

export async function deleteExpense(id: string) {
  await requireBossOrAdmin()

  await prisma.expense.delete({
    where: { id }
  })

  revalidatePath('/dashboard/expenses')
}