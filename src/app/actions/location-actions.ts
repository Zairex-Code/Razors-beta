'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getLocations() {
  return prisma.location.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function getLocation(id: string) {
  return prisma.location.findUnique({
    where: { id },
    include: { inventory: { include: { product: true } } }
  })
}

export async function transferStock(data: {
  productId: string
  fromLocationId: string
  toLocationId: string
  quantity: number
}) {
  if (data.quantity <= 0) {
    throw new Error('Quantity must be greater than 0')
  }

  if (data.fromLocationId === data.toLocationId) {
    throw new Error('Source and destination locations must be different')
  }

  const fromInventory = await prisma.inventory.findUnique({
    where: {
      productId_locationId: {
        productId: data.productId,
        locationId: data.fromLocationId
      }
    }
  })

  if (!fromInventory || fromInventory.stock < data.quantity) {
    throw new Error('Insufficient stock in source location')
  }

  await prisma.$transaction(async (tx) => {
    await tx.inventory.update({
      where: {
        productId_locationId: {
          productId: data.productId,
          locationId: data.fromLocationId
        }
      },
      data: {
        stock: { decrement: data.quantity }
      }
    })

    const toInventory = await tx.inventory.findUnique({
      where: {
        productId_locationId: {
          productId: data.productId,
          locationId: data.toLocationId
        }
      }
    })

    if (toInventory) {
      await tx.inventory.update({
        where: {
          productId_locationId: {
            productId: data.productId,
            locationId: data.toLocationId
          }
        },
        data: {
          stock: { increment: data.quantity }
        }
      })
    } else {
      await tx.inventory.create({
        data: {
          productId: data.productId,
          locationId: data.toLocationId,
          stock: data.quantity
        }
      })
    }
  })

  revalidatePath('/dashboard/inventory')
  return { success: true }
}

export async function getInventoryWithLocations() {
  return prisma.inventory.findMany({
    include: {
      product: true,
      location: true
    },
    orderBy: [
      { location: { name: 'asc' } },
      { product: { name: 'asc' } }
    ]
  })
}