'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireRole } from './auth-actions'

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key }
  })
  return setting?.value ?? null
}

export async function getSettings(keys: string[]): Promise<Record<string, string | null>> {
  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: keys } }
  })
  const result: Record<string, string | null> = {}
  for (const key of keys) {
    const setting = settings.find(s => s.key === key)
    result[key] = setting?.value ?? null
  }
  return result
}

export async function updateSetting(key: string, value: string) {
  await requireRole(['ADMIN'])

  const setting = await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  })

  revalidatePath('/dashboard/settings')
  return setting
}

export async function getProfitMargin(): Promise<number> {
  const margin = await getSetting('PROFIT_MARGIN')
  return margin ? parseFloat(margin) : 30
}
