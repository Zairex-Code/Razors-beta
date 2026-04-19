import { prisma } from '@/lib/prisma'
import { getUserWithRole } from '@/app/actions/auth-actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TopProductsChart, SalesSummaryChart } from '@/components/dashboard/charts'
import {
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

async function getDashboardData(userRole: string) {
  const isAdminOrBoss = userRole === 'ADMIN' || userRole === 'BOSS'

  const [
    totalProducts,
    lowStockItems,
    recentSales,
    totalCustomers,
    monthlySales,
    topProducts,
  ] = await Promise.all([
    prisma.product.count(),
    isAdminOrBoss ? prisma.inventory.count({ where: { stock: { lt: 10 } } }) : 0,
    prisma.sale.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { customer: true, location: true },
    }),
    prisma.customer.count(),
    isAdminOrBoss ? prisma.sale.groupBy({
      by: ['status'],
      _sum: { totalAmount: true },
      _count: true,
    }) : [],
    isAdminOrBoss ? prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }) : [],
  ])

  const topProductsWithNames = topProducts.length > 0
    ? await Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true, sku: true },
          })
          return {
            name: product?.name || 'Unknown',
            quantity: item._sum.quantity || 0,
          }
        })
      )
    : []

  return {
    totalProducts,
    lowStockItems,
    recentSales,
    totalCustomers,
    monthlySales,
    topProducts: topProductsWithNames,
    isAdminOrBoss,
  }
}

export default async function DashboardPage() {
  const user = await getUserWithRole()
  if (!user) return null

  const data = await getDashboardData(user.role)

  const salesSummary = data.monthlySales.reduce(
    (acc, item) => {
      if (item.status === 'PAID') acc.paid += item._sum.totalAmount || 0
      if (item.status === 'PENDING') acc.pending += item._sum.totalAmount || 0
      if (item.status === 'VOID') acc.void += item._count
      return acc
    },
    { paid: 0, pending: 0, void: 0 }
  )

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Bienvenido, {user.name}
        </h1>
        <p className="text-muted-foreground">
          Panel de control - Razors CRM
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Productos
            </CardTitle>
            <Package className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {data.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              En inventario
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes
            </CardTitle>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {data.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">
              Registrados
            </p>
          </CardContent>
        </Card>

        {data.isAdminOrBoss && (
          <>
            <Card className="bg-card/50 backdrop-blur-sm border-cyan-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ventas Pagadas
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  S/. {salesSummary.paid.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total acumulado
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-cyan-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Stock Bajo
                </CardTitle>
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {data.lowStockItems}
                </div>
                <p className="text-xs text-muted-foreground">
                  Productos con menos de 10 unidades
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {data.isAdminOrBoss && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="bg-card/50 backdrop-blur-sm border-cyan-500/20 lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-white">Top 5 Productos Más Vendidos</CardTitle>
              <CardDescription>Productos con mayor rotación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <TopProductsChart data={data.topProducts} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-cyan-500/20 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-white">Resumen de Ventas</CardTitle>
              <CardDescription>Estado actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <SalesSummaryChart paid={salesSummary.paid} pending={salesSummary.pending} />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pagadas</span>
                  <span className="text-sm font-medium text-cyan-400">S/. {salesSummary.paid.toLocaleString('es-PE')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pendientes</span>
                  <span className="text-sm font-medium text-yellow-400">S/. {salesSummary.pending.toLocaleString('es-PE')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-card/50 backdrop-blur-sm border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-white">Ventas Recientes</CardTitle>
          <CardDescription>Últimas 5 transacciones</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-cyan-500/20">
                <TableHead className="text-cyan-400">Factura</TableHead>
                <TableHead className="text-cyan-400">Cliente</TableHead>
                <TableHead className="text-cyan-400">Sede</TableHead>
                <TableHead className="text-cyan-400">Total</TableHead>
                <TableHead className="text-cyan-400">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentSales.map((sale) => (
                <TableRow key={sale.id} className="border-cyan-500/10">
                  <TableCell className="font-medium text-white">
                    {sale.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {sale.customer.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {sale.location.name}
                  </TableCell>
                  <TableCell className="text-white">
                    S/. {sale.totalAmount.toLocaleString('es-PE')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'PAID'
                          ? 'bg-green-500/20 text-green-400'
                          : sale.status === 'PENDING'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {sale.status === 'PAID' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                      {sale.status === 'PENDING' && <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {sale.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {data.recentSales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay ventas registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}