import { prisma } from '@/lib/prisma'

export async function getProviders() {
  const providers = await prisma.import.findMany({
    select: { provider: true },
    distinct: ['provider'],
    orderBy: { provider: 'asc' }
  })
  return providers.map(p => p.provider)
}
