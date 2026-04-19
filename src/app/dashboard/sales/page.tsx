import { getUserWithRole } from '@/app/actions/auth-actions'
import { getSales } from '@/app/actions/sale-actions'
import { prisma } from '@/lib/prisma'
import SalesPageClient from './SalesPageClient'

export default async function SalesPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const user = await getUserWithRole()
  if (!user) return null

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const status = params.status as 'PAID' | 'PENDING' | 'VOID' | undefined

  const [salesData, products, customers, locations] = await Promise.all([
    getSales({ page, status }),
    prisma.product.findMany({
      include: {
        inventory: true
      }
    }),
    prisma.customer.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.location.findMany()
  ])

  const defaultLocation = locations[0]

  return (
    <SalesPageClient
      sales={salesData.sales}
      pagination={salesData.pagination}
      products={products}
      customers={customers}
      userId={user.id}
      locationId={defaultLocation?.id || ''}
      locationName={defaultLocation?.name || 'Sede Principal'}
    />
  )
}