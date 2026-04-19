'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Role } from '@prisma/client'

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  })
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !currentStatus }
  })

  revalidatePath('/dashboard/users')
  return updatedUser
}

export async function changeUserRole(userId: string, newRole: Role) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  })

  revalidatePath('/dashboard/users')
  return updatedUser
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: Role
}) {
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      isActive: true
    }
  })

  revalidatePath('/dashboard/users')
  return user
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  })
}
