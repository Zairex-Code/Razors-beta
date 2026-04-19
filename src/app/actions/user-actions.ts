'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Role } from '@prisma/client'
import { requireAdmin } from './auth-actions'
import { getSupabaseAdmin } from '@/utils/supabase/admin'

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
  await requireAdmin()

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !currentStatus }
  })

  revalidatePath('/dashboard/users')
  return updatedUser
}

export async function changeUserRole(userId: string, newRole: Role) {
  await requireAdmin()

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
  await requireAdmin()

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

export async function createUserAction(formData: FormData) {
  await requireAdmin()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as Role

  if (!name || !email || !password || !role) {
    throw new Error('All fields are required')
  }

  const supabaseAdmin = getSupabaseAdmin()
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role }
  })

  if (authError) {
    throw new Error(`Auth error: ${authError.message}`)
  }

  const user = await prisma.user.create({
    data: {
      id: authUser.user.id,
      name,
      email,
      password,
      role,
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
