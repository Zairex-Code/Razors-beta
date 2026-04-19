import { prisma } from '@/lib/prisma'
import { getUserWithRole } from '@/app/actions/auth-actions'
import { getSales } from '@/app/actions/sale-actions'
import { SalesTable } from '@/components/sales/sales-table'

export default async function SalesPage() {
  const user = await getUserWithRole()
  if (!user) return null

  const sales = await getSales()

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Ventas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Historial de ventas y transacciones
        </p>
      </div>

      <SalesTable sales={sales} />
    </div>
  )
}