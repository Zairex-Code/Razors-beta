'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { Role } from '@prisma/client'

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserWithRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true, name: true, email: true, role: true, isActive: true }
  })

  return dbUser
}

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autenticado')
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true, role: true, isActive: true }
  })

  if (!dbUser) {
    throw new Error('Usuario no encontrado')
  }

  if (!dbUser.isActive) {
    throw new Error('Usuario desactivado')
  }

  return dbUser
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