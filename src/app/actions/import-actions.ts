'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ImportStatus } from '@prisma/client'

export async function getImports(status?: ImportStatus) {
  return prisma.import.findMany({
    where: status ? { status } : undefined,
    include: {
      items: { include: { product: true } },
      costs: true,
      documents: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getImport(id: string) {
  return prisma.import.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      costs: true,
      documents: true
    }
  })
}

export async function createImport(data: {
  provider: string
  piNumber: string
  eta?: string
  exchangeRate: number
  items: Array<{
    productId: string
    quantity: number
    unitPriceUsd: number
  }>
  internalCosts: Array<{
    category: string
    description: string
    amount: number
    currency: string
    exchangeRate?: number
    voucherUrl?: string
  }>
  extraCosts: Array<{
    category: string
    description: string
    amount: number
    currency: string
    exchangeRate?: number
    voucherUrl?: string
  }>
}) {
  const importOrder = await prisma.import.create({
    data: {
      provider: data.provider,
      piNumber: data.piNumber,
      eta: data.eta ? new Date(data.eta) : null,
      exchangeRate: data.exchangeRate,
      status: 'PLANNING',
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceUsd: item.unitPriceUsd
        }))
      },
      costs: {
        create: [
          ...data.internalCosts.map(cost => ({
            category: cost.category,
            description: cost.description,
            amount: cost.amount,
            currency: cost.currency,
            exchangeRate: cost.exchangeRate,
            voucherUrl: cost.voucherUrl
          })),
          ...data.extraCosts.map(cost => ({
            category: cost.category,
            description: cost.description,
            amount: cost.amount,
            currency: cost.currency,
            exchangeRate: cost.exchangeRate,
            voucherUrl: cost.voucherUrl
          }))
        ]
      }
    },
    include: { items: true, costs: true }
  })

  revalidatePath('/dashboard/imports')
  return importOrder
}

export async function updateImportStatus(id: string, status: ImportStatus) {
  const importOrder = await prisma.import.update({
    where: { id },
    data: { status },
    include: { items: true }
  })

  if (status === 'DELIVERED') {
    for (const item of importOrder.items) {
      const locations = await prisma.location.findMany()

      for (const location of locations) {
        await prisma.inventory.upsert({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: location.id
            }
          },
          update: {
            stock: { increment: item.quantity }
          },
          create: {
            productId: item.productId,
            locationId: location.id,
            stock: item.quantity
          }
        })
      }
    }
  }

  revalidatePath('/dashboard/imports')
  return importOrder
}

export async function deleteImport(id: string) {
  await prisma.import.delete({
    where: { id }
  })

  revalidatePath('/dashboard/imports')
}