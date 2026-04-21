'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireRole } from './auth-actions'
import { LocationType } from '@prisma/client'

export async function getLocations() {
  return prisma.location.findMany({
    orderBy: { createdAt: 'desc' },
    where: { isActive: true },
  })
}

export async function getAllLocations() {
  return prisma.location.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function getWarehouses() {
  return prisma.location.findMany({
    where: { type: 'WAREHOUSE', isActive: true },
  })
}

export async function getStores() {
  return prisma.location.findMany({
    where: { type: 'STORE', isActive: true },
  })
}

export async function createLocation(data: {
  name: string
  type: LocationType
  address?: string
  phone?: string
  email?: string
}) {
  await requireRole(['ADMIN', 'BOSS'])

  const location = await prisma.location.create({
    data: {
      name: data.name,
      type: data.type,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
      isActive: true,
    },
  })

  revalidatePath('/dashboard/locations')
  return location
}

export async function updateLocation(id: string, data: {
  name?: string
  type?: LocationType
  address?: string
  phone?: string
  email?: string
}) {
  await requireRole(['ADMIN', 'BOSS'])

  const location = await prisma.location.update({
    where: { id },
    data: {
      ...data,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
    },
  })

  revalidatePath('/dashboard/locations')
  return location
}

export async function deactivateLocation(id: string) {
  await requireRole(['ADMIN', 'BOSS'])

  const locationWithSales = await prisma.location.findFirst({
    where: { id, sales: { some: {} } },
  })

  if (locationWithSales) {
    throw new Error('No se puede desactivar una sede con ventas registradas')
  }

  const location = await prisma.location.update({
    where: { id },
    data: { isActive: false },
  })

  revalidatePath('/dashboard/locations')
  return location
}

export async function getLocationInventory(locationId: string) {
  return prisma.inventory.findMany({
    where: { locationId },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      location: { select: { id: true, name: true, type: true } }
    }
  })
}

export async function closeLocationAction(
  locationId: string,
  destinationLocationId?: string
) {
  await requireRole(['ADMIN', 'BOSS'])

  const locationToClose = await prisma.location.findUnique({
    where: { id: locationId },
    include: { sales: true }
  })

  if (!locationToClose) {
    throw new Error('Sede no encontrada')
  }

  if (locationToClose.sales.length > 0) {
    throw new Error('No se puede cerrar una sede con ventas registradas')
  }

  if (locationToClose.type === 'WAREHOUSE' && destinationLocationId) {
    throw new Error('Los almacenes no pueden recibir transferencias de otras sedes')
  }

  const inventoryItems = await prisma.inventory.findMany({
    where: { locationId, stock: { gt: 0 } },
    include: { product: true }
  })

  if (inventoryItems.length > 0 && !destinationLocationId) {
    throw new Error('Esta sede tiene inventario. Selecciona una sede de destino.')
  }

  await prisma.$transaction(async (tx) => {
    if (destinationLocationId && inventoryItems.length > 0) {
      for (const item of inventoryItems) {
        const targetInventory = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: destinationLocationId
            }
          }
        })

        if (targetInventory) {
          await tx.inventory.update({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: destinationLocationId
              }
            },
            data: { stock: { increment: item.stock } }
          })
        } else {
          await tx.inventory.create({
            data: {
              productId: item.productId,
              locationId: destinationLocationId,
              stock: item.stock
            }
          })
        }

        await tx.inventory.update({
          where: { id: item.id },
          data: { stock: 0 }
        })
      }
    }

    await tx.location.update({
      where: { id: locationId },
      data: { isActive: false }
    })
  })

  revalidatePath('/dashboard/locations')
  revalidatePath('/dashboard/inventory')
  return { success: true }
}

export async function getDefaultStoreLocation() {
  const store = await prisma.location.findFirst({
    where: { type: 'STORE', isActive: true },
    orderBy: { createdAt: 'asc' },
  })
  return store
}

export async function getDefaultWarehouseLocation() {
  const warehouse = await prisma.location.findFirst({
    where: { type: 'WAREHOUSE', isActive: true },
    orderBy: { createdAt: 'asc' },
  })
  return warehouse
}

export async function getInventoryWithLocations() {
  return prisma.inventory.findMany({
    include: {
      product: true,
      location: true,
    },
    where: {
      location: { isActive: true },
      stock: { gt: 0 },
    },
  })
}

export async function createTransfer(data: {
  fromLocationId: string
  toLocationId: string
  productId: string
  quantity: number
}) {
  await requireRole(['ADMIN', 'BOSS', 'EMPLOYEE'])

  if (data.fromLocationId === data.toLocationId) {
    throw new Error('Origen y destino no pueden ser la misma ubicación')
  }

  const fromInventory = await prisma.inventory.findUnique({
    where: {
      productId_locationId: {
        productId: data.productId,
        locationId: data.fromLocationId,
      },
    },
  })

  if (!fromInventory || fromInventory.stock < data.quantity) {
    throw new Error('Stock insuficiente en la ubicación de origen')
  }

  const transfer = await prisma.$transaction(async (tx) => {
    await tx.inventory.update({
      where: {
        productId_locationId: {
          productId: data.productId,
          locationId: data.fromLocationId,
        },
      },
      data: { stock: { decrement: data.quantity } },
    })

    await tx.inventory.upsert({
      where: {
        productId_locationId: {
          productId: data.productId,
          locationId: data.toLocationId,
        },
      },
      update: {
        stock: { increment: data.quantity },
      },
      create: {
        productId: data.productId,
        locationId: data.toLocationId,
        stock: data.quantity,
      },
    })

    return { success: true }
  })

  revalidatePath('/dashboard/inventory')
  revalidatePath('/dashboard/inventory/transfers')
  return transfer
}
