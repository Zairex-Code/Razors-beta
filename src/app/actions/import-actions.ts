'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ImportStatus } from '@prisma/client'
import { requireBossOrAdmin } from './auth-actions'
import { roundCurrency } from '@/utils/math'

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
  documents?: Array<{
    type: string
    url: string
    name: string
  }>
  delivered?: boolean
}) {
  await requireBossOrAdmin()

  const importOrder = await prisma.import.create({
    data: {
      provider: data.provider,
      piNumber: data.piNumber,
      eta: data.eta ? new Date(data.eta) : null,
      exchangeRate: roundCurrency(data.exchangeRate),
      status: data.delivered ? 'DELIVERED' : 'PLANNING',
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceUsd: roundCurrency(item.unitPriceUsd)
        }))
      },
      costs: {
        create: [
          ...data.internalCosts.map(cost => ({
            category: cost.category,
            description: cost.description,
            amount: roundCurrency(cost.amount),
            currency: cost.currency,
            exchangeRate: cost.exchangeRate ? roundCurrency(cost.exchangeRate) : null,
            voucherUrl: cost.voucherUrl
          })),
          ...data.extraCosts.map(cost => ({
            category: cost.category,
            description: cost.description,
            amount: roundCurrency(cost.amount),
            currency: cost.currency,
            exchangeRate: cost.exchangeRate ? roundCurrency(cost.exchangeRate) : null,
            voucherUrl: cost.voucherUrl
          }))
        ]
      },
      documents: data.documents ? {
        create: data.documents.map(doc => ({
          type: doc.type,
          url: doc.url,
          name: doc.name
        }))
      } : undefined
    },
    include: { items: true, costs: true, documents: true }
  })

  if (data.delivered) {
    const warehouses = await prisma.location.findMany({ where: { type: 'WAREHOUSE' } })
    for (const item of importOrder.items) {
      for (const location of warehouses) {
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
  revalidatePath('/dashboard/inventory')
  return importOrder
}

export async function updateImportStatus(id: string, status: ImportStatus) {
  await requireBossOrAdmin()

  const currentImport = await prisma.import.findUnique({
    where: { id },
    include: { items: true }
  })

  if (!currentImport) {
    throw new Error('Import not found')
  }

  const previousStatus = currentImport.status

  const importOrder = await prisma.import.update({
    where: { id },
    data: { status },
    include: { items: true }
  })

  if (previousStatus === 'DELIVERED' && status !== 'DELIVERED') {
    for (const item of importOrder.items) {
      const warehouses = await prisma.location.findMany({ where: { type: 'WAREHOUSE' } })
      for (const location of warehouses) {
        await prisma.inventory.update({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: location.id
            }
          },
          data: {
            stock: { decrement: item.quantity }
          }
        })
      }
    }
  } else if (previousStatus !== 'DELIVERED' && status === 'DELIVERED') {
    for (const item of importOrder.items) {
      const warehouses = await prisma.location.findMany({ where: { type: 'WAREHOUSE' } })
      for (const location of warehouses) {
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
  revalidatePath('/dashboard/inventory')
  return importOrder
}

export async function deleteImport(id: string) {
  await requireBossOrAdmin()

  await prisma.import.delete({
    where: { id }
  })

  revalidatePath('/dashboard/imports')
}

export async function clearCostVoucher(costId: string) {
  await requireBossOrAdmin()
  await prisma.importCost.update({
    where: { id: costId },
    data: { voucherUrl: null }
  })

  revalidatePath('/dashboard/imports')
}

export async function deleteDocument(documentId: string) {
  await requireBossOrAdmin()
  await prisma.document.delete({
    where: { id: documentId }
  })

  revalidatePath('/dashboard/imports')
}