'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ImportStatus } from '@prisma/client'
import { requireBossOrAdmin } from './auth-actions'
import { roundCurrency } from '@/utils/math'
import { getProfitMargin } from './setting-actions'

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

async function processDelivery(importId: string, previousStatus: ImportStatus) {
  const importOrder = await prisma.import.findUnique({
    where: { id: importId },
    include: {
      items: { include: { product: true } },
      costs: true
    }
  })

  if (!importOrder) return

  if (previousStatus === 'DELIVERED') {
    const warehouses = await prisma.location.findMany({
      where: { type: 'WAREHOUSE', isActive: true }
    })
    for (const item of importOrder.items) {
      for (const location of warehouses) {
        await prisma.inventory.update({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: location.id
            }
          },
          data: { stock: { decrement: item.quantity } }
        })
      }
    }
    return
  }

  const profitMargin = await getProfitMargin()

  const totalProductCostUsd = importOrder.items.reduce(
    (sum, item) => sum + (item.unitPriceUsd * item.quantity),
    0
  )

  const totalExtraCostsPen = importOrder.costs.reduce((sum, cost) => {
    const amount = cost.currency === 'USD'
      ? cost.amount * (cost.exchangeRate || importOrder.exchangeRate)
      : cost.amount
    return sum + amount
  }, 0)

  await prisma.$transaction(async (tx) => {
    const warehouses = await tx.location.findMany({
      where: { type: 'WAREHOUSE', isActive: true }
    })

    for (const item of importOrder.items) {
      const itemCostUsd = item.unitPriceUsd * item.quantity
      const prorrateo = totalProductCostUsd > 0
        ? (itemCostUsd / totalProductCostUsd) * totalExtraCostsPen
        : 0

      const totalItemCostPen = (itemCostUsd * importOrder.exchangeRate) + prorrateo
      const unitCostPen = totalItemCostPen / item.quantity
      const profitMultiplier = 1 + (profitMargin / 100)
      const newPricePen = roundCurrency(unitCostPen * profitMultiplier)

      await tx.product.update({
        where: { id: item.productId },
        data: { pricePen: newPricePen }
      })

      for (const location of warehouses) {
        await tx.inventory.upsert({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: location.id
            }
          },
          update: { stock: { increment: item.quantity } },
          create: {
            productId: item.productId,
            locationId: location.id,
            stock: item.quantity
          }
        })
      }
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
    await processDelivery(importOrder.id, 'PLANNING')
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

  await prisma.import.update({
    where: { id },
    data: { status }
  })

  if (previousStatus !== status && status === 'DELIVERED') {
    await processDelivery(id, previousStatus)
  } else if (previousStatus === 'DELIVERED' && status !== 'DELIVERED') {
    await processDelivery(id, previousStatus)
  }

  revalidatePath('/dashboard/imports')
  revalidatePath('/dashboard/inventory')
  return { success: true }
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
