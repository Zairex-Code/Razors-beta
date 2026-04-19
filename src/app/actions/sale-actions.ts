'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { SaleStatus } from '@prisma/client'

export async function getSales(options: {
  status?: SaleStatus
  page?: number
  perPage?: number
} = {}) {
  const { status, page = 1, perPage = 20 } = options
  const skip = (page - 1) * perPage

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where: status ? { status } : undefined,
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        location: true,
        items: { include: { product: true } }
      },
      orderBy: { date: 'desc' },
      skip,
      take: perPage
    }),
    prisma.sale.count({
      where: status ? { status } : undefined
    })
  ])

  return {
    sales,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage)
    }
  }
}

export async function getSale(id: string) {
  return prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      user: { select: { id: true, name: true } },
      location: true,
      items: { include: { product: true } }
    }
  })
}

export async function createSale(data: {
  customerId: string
  userId: string
  locationId: string
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  totalAmount: number
  invoiceNumber: string
}) {
  const sale = await prisma.sale.create({
    data: {
      invoiceNumber: data.invoiceNumber,
      customerId: data.customerId,
      userId: data.userId,
      locationId: data.locationId,
      totalAmount: data.totalAmount,
      status: 'PAID',
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal
        }))
      }
    },
    include: { items: true }
  })

  for (const item of data.items) {
    await prisma.inventory.update({
      where: {
        productId_locationId: {
          productId: item.productId,
          locationId: data.locationId
        }
      },
      data: {
        stock: { decrement: item.quantity }
      }
    })
  }

  revalidatePath('/dashboard/sales')
  return sale
}

export async function voidSale(saleId: string) {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { items: true }
  })

  if (!sale || sale.status === 'VOID') {
    throw new Error('Sale not found or already voided')
  }

  await prisma.$transaction(async (tx) => {
    for (const item of sale.items) {
      await tx.inventory.update({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: sale.locationId
          }
        },
        data: {
          stock: { increment: item.quantity }
        }
      })
    }

    await tx.sale.update({
      where: { id: saleId },
      data: {
        status: 'VOID',
        totalAmount: 0
      }
    })
  })

  revalidatePath('/dashboard/sales')
}

export async function generateInvoiceNumber() {
  const lastSale = await prisma.sale.findFirst({
    orderBy: { date: 'desc' }
  })

  const lastNumber = lastSale?.invoiceNumber
    ? parseInt(lastSale.invoiceNumber.replace(/\D/g, ''))
    : 0

  return `FV-${String(lastNumber + 1).padStart(8, '0')}`
}