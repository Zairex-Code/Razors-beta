import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function getSessionUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('x-user-id')?.value
  const userRole = cookieStore.get('x-user-role')?.value as Role | undefined

  if (!userId) {
    return null
  }

  return { id: userId, role: userRole! }
}

export async function requireAuth() {
  const user = await getSessionUser()

  if (!user) {
    throw new Error('No autenticado')
  }

  return user
}

export async function getUserWithRole() {
  return getSessionUser()
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    throw new Error('No tienes permisos para realizar esta acción')
  }

  return user
}

export async function requireAdmin() {
  return requireRole(['ADMIN'])
}

export async function requireBossOrAdmin() {
  return requireRole(['ADMIN', 'BOSS'])
}
