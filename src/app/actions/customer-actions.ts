'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCustomers() {
  return prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: {
      sales: {
        include: {
          location: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 5
      }
    }
  })
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true
                }
              }
            }
          },
          location: true
        },
        orderBy: { date: 'desc' }
      }
    }
  })
}

export async function getCustomerByDoc(docNumber: string) {
  return prisma.customer.findUnique({
    where: { docNumber }
  })
}

export async function searchCustomers(query: string) {
  return prisma.customer.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { docNumber: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: { name: 'asc' },
    take: 10
  })
}

export async function createCustomer(data: {
  docType: string
  docNumber: string
  name: string
  email?: string
  phone?: string
  address?: string
}) {
  const customer = await prisma.customer.create({
    data: {
      docType: data.docType,
      docNumber: data.docNumber,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address
    }
  })

  revalidatePath('/dashboard/customers')
  return customer
}

export async function updateCustomer(id: string, data: {
  docType?: string
  docNumber?: string
  name?: string
  email?: string
  phone?: string
  address?: string
}) {
  const customer = await prisma.customer.update({
    where: { id },
    data
  })

  revalidatePath('/dashboard/customers')
  return customer
}

export async function deleteCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { sales: true }
  })

  if (!customer) {
    throw new Error('Cliente no encontrado')
  }

  if (customer.sales.length > 0) {
    await prisma.customer.update({
      where: { id },
      data: { isActive: false }
    })
    return { success: true, softDeleted: true }
  }

  await prisma.customer.delete({
    where: { id }
  })
  return { success: true, softDeleted: false }
}

export async function getCustomerStats() {
  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    include: {
      sales: {
        where: { status: 'PAID' },
        select: { totalAmount: true }
      }
    }
  })

  return customers.map(customer => ({
    id: customer.id,
    name: customer.name,
    docType: customer.docType,
    docNumber: customer.docNumber,
    email: customer.email,
    totalPurchases: customer.sales.reduce((acc, sale) => acc + sale.totalAmount, 0),
    purchaseCount: customer.sales.length
  }))
}