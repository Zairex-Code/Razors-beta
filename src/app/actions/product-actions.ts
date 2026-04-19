'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  return prisma.product.findMany({
    include: {
      inventory: {
        include: {
          location: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      inventory: { include: { location: true } },
      importItems: true,
      saleItems: true
    }
  })
}

export async function getProductBySku(sku: string) {
  return prisma.product.findUnique({
    where: { sku },
    include: { inventory: true }
  })
}

export async function createProduct(data: {
  sku: string
  name: string
  category: string
  pricePen: number
}) {
  const product = await prisma.product.create({
    data: {
      sku: data.sku,
      name: data.name,
      category: data.category,
      pricePen: data.pricePen
    }
  })

  revalidatePath('/dashboard/inventory')
  return product
}

export async function updateInventoryStock(
  productId: string,
  locationId: string,
  quantity: number,
  operation: 'ADD' | 'SUBTRACT'
) {
  const current = await prisma.inventory.findUnique({
    where: {
      productId_locationId: { productId, locationId }
    }
  })

  if (!current) {
    return prisma.inventory.create({
      data: {
        productId,
        locationId,
        stock: operation === 'ADD' ? quantity : -quantity
      }
    })
  }

  const newStock = operation === 'ADD'
    ? current.stock + quantity
    : current.stock - quantity

  return prisma.inventory.update({
    where: { productId_locationId: { productId, locationId } },
    data: { stock: Math.max(0, newStock) }
  })
}