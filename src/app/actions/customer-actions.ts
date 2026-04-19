'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        include: { items: true, location: true },
        orderBy: { date: 'desc' },
        take: 3
      }
    }
  })
}

export async function getCustomerByDoc(docNumber: string) {
  return prisma.customer.findUnique({
    where: { docNumber }
  })
}

export async function createCustomer(data: {
  docType: string
  docNumber: string
  name: string
  email?: string
}) {
  const customer = await prisma.customer.create({
    data: {
      docType: data.docType,
      docNumber: data.docNumber,
      name: data.name,
      email: data.email
    }
  })

  revalidatePath('/dashboard/customers')
  return customer
}