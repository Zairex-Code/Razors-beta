'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { SaleStatus } from '@prisma/client'
import { requireAuth, requireRole } from './auth-actions'
import { uploadFileToStorageAdmin } from '@/lib/storage'
import { roundCurrency } from '@/utils/math'

export async function getSales(options: {
  status?: SaleStatus
  hasDiscount?: boolean
  page?: number
  perPage?: number
} = {}) {
  const { status, hasDiscount, page = 1, perPage = 20 } = options
  const skip = (page - 1) * perPage

  const whereClause: any = {}
  if (status) whereClause.status = status
  if (hasDiscount !== undefined) whereClause.items = { some: { hasDiscount } }

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
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
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined
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
  status: 'PAID' | 'PENDING'
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
    basePrice: number
    hasDiscount: boolean
    discountPct: number
    subtotal: number
  }>
  totalAmount: number
  invoiceNumber: string
  paymentMethod: string
  isDelivery: boolean
  deliveryCost: number
}) {
  await requireAuth()

  const result = await prisma.$transaction(async (tx) => {
    for (const item of data.items) {
      const inventory = await tx.inventory.findUnique({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: data.locationId
          }
        }
      })

      if (!inventory) {
        throw new Error(`Stock no encontrado para el producto.`)
      }

      if (inventory.stock < item.quantity) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        })
        throw new Error(`Venta cancelada: El stock de "${product?.name || item.productId}" cambió mientras procesabas el pago. Stock disponible: ${inventory.stock}`)
      }
    }

    const sale = await tx.sale.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        customerId: data.customerId,
        userId: data.userId,
        locationId: data.locationId,
        totalAmount: roundCurrency(data.totalAmount),
        status: data.status,
        paymentMethod: data.paymentMethod,
        isDelivery: data.isDelivery,
        deliveryCost: roundCurrency(data.deliveryCost),
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: roundCurrency(item.unitPrice),
            basePrice: roundCurrency(item.basePrice),
            hasDiscount: item.hasDiscount,
            discountPct: roundCurrency(item.discountPct),
            subtotal: roundCurrency(item.subtotal)
          }))
        }
      },
      include: { items: true }
    })

    for (const item of data.items) {
      await tx.inventory.update({
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

    return sale
  })

  revalidatePath('/dashboard/sales')
  return result
}

export async function voidSale(saleId: string) {
  await requireRole(['ADMIN', 'BOSS', 'EMPLOYEE'])

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

export async function updateSaleStatusAction(saleId: string, newStatus: 'PAID' | 'PENDING') {
  await requireAuth()

  const sale = await prisma.sale.findUnique({
    where: { id: saleId }
  })

  if (!sale) {
    throw new Error('Venta no encontrada')
  }

  if (sale.status === 'VOID') {
    throw new Error('No se puede cambiar el estado de una venta anulada')
  }

  await prisma.sale.update({
    where: { id: saleId },
    data: { status: newStatus }
  })

  revalidatePath('/dashboard/sales')
}

export async function uploadSaleVoucherAction(saleId: string, formData: FormData) {
  await requireAuth()

  const file = formData.get('voucher') as File | null

  if (!file) {
    throw new Error('No se encontró ningún archivo')
  }

  const sale = await prisma.sale.findUnique({
    where: { id: saleId }
  })

  if (!sale) {
    throw new Error('Venta no encontrada')
  }

  const voucherUrl = await uploadFileToStorageAdmin(
    'vouchers',
    'sales',
    file,
    `sale_${saleId}_${file.name}`
  )

  await prisma.sale.update({
    where: { id: saleId },
    data: { voucherUrl }
  })

  revalidatePath('/dashboard/sales')

  return { success: true, voucherUrl }
}

export async function deleteSaleVoucherAction(saleId: string) {
  await requireAuth()

  await prisma.sale.update({
    where: { id: saleId },
    data: { voucherUrl: null }
  })

  revalidatePath('/dashboard/sales')
}