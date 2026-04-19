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