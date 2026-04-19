import { prisma } from '@/lib/prisma'
import { getUserWithRole } from '@/app/actions/auth-actions'
import { TopProductsChart, SalesSummaryChart } from '@/components/dashboard/charts'
import {
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Ship,
  Wallet,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

async function getDashboardData(userRole: string, userId?: string) {
  const isAdminOrBoss = userRole === 'ADMIN' || userRole === 'BOSS'

  const [
    totalProducts,
    lowStockItems,
    recentSales,
    totalCustomers,
    monthlySales,
    topProducts,
    activeImports,
  ] = await Promise.all([
    prisma.product.count(),
    isAdminOrBoss ? prisma.inventory.count({ where: { stock: { lt: 10 } } }) : 0,
    isAdminOrBoss
      ? prisma.sale.findMany({
          take: 5,
          orderBy: { date: 'desc' },
          include: { customer: true, location: true },
        })
      : prisma.sale.findMany({
          where: { userId },
          take: 5,
          orderBy: { date: 'desc' },
          include: { customer: true, location: true },
        }),
    prisma.customer.count(),
    isAdminOrBoss
      ? prisma.sale.groupBy({
          by: ['status'],
          _sum: { totalAmount: true },
          _count: true,
        })
      : prisma.sale.groupBy({
          where: { userId },
          by: ['status'],
          _sum: { totalAmount: true },
          _count: true,
        }),
    isAdminOrBoss
      ? prisma.saleItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        })
      : [],
    isAdminOrBoss ? prisma.import.count({ where: { status: { in: ['DISPATCHED', 'IN_TRANSIT'] } } }) : 0,
  ])

  const topProductsWithNames = topProducts.length > 0
    ? await Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true, sku: true, category: true, pricePen: true },
          })
          return {
            name: product?.name || 'Unknown',
            sku: product?.sku || '',
            category: product?.category || '',
            quantity: item._sum.quantity || 0,
            revenue: (item._sum.quantity || 0) * (product?.pricePen || 0),
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
    activeImports,
  }
}

function KPICard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  subValue: string
  icon: React.ElementType
  trend?: number
}) {
  return (
    <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />

      <div className="flex justify-between items-start">
        <div className="p-2.5 rounded-lg bg-foreground/5 border border-border text-foreground/70">
          <Icon size={20} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
          )}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        <p className="text-white/60 text-xs mt-1">{subValue}</p>
      </div>
    </div>
  )
}

function TimeFilterToggle({ active = "Mensual" }: { active?: string }) {
  const filters = ["Diario", "Semanal", "Mensual", "Trimestral", "Anual"]
  return (
    <div className="flex p-1 rounded-full bg-foreground/5 border border-border/50 backdrop-blur-md">
      {filters.map((filter) => (
        <button
          key={filter}
          className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
            active === filter
              ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,247,255,0.3)] font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 font-bold"
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  )
}

export default async function DashboardPage() {
  const user = await getUserWithRole()
  if (!user) return null

  const data = await getDashboardData(user.role, user.id)

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
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Bienvenido, {user.name}
        </h1>
        <p className="text-muted-foreground">
          Panel de control - Razors CRM
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(user.role === 'ADMIN' || user.role === 'BOSS') ? (
          <KPICard
            title="Ganancia del Mes"
            value={`S/ ${salesSummary.paid.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            subValue="+12.5% vs mes anterior"
            icon={Wallet}
            trend={12.5}
          />
        ) : (
          <KPICard
            title="Mis Ventas de Hoy"
            value={`S/ ${(salesSummary.paid * 0.05).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            subValue="5 transacciones"
            icon={TrendingUp}
            trend={5.2}
          />
        )}
        <KPICard
          title={(user.role === 'ADMIN' || user.role === 'BOSS') ? "Más Vendido" : "Mis Ventas"}
          value={(user.role === 'ADMIN' || user.role === 'BOSS') ? (data.topProducts[0]?.name || 'N/A') : `S/ ${(salesSummary.paid * 0.3).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          subValue={(user.role === 'ADMIN' || user.role === 'BOSS') ? `${data.topProducts[0]?.quantity || 0} unidades este mes` : "Meta: S/ 2,000.00"}
          icon={(user.role === 'ADMIN' || user.role === 'BOSS') ? TrendingUp : Wallet}
        />
        <KPICard
          title="Stock Total"
          value={data.totalProducts.toLocaleString()}
          subValue="En múltiples ubicaciones"
          icon={Package}
          trend={-2.4}
        />
        {(user.role === 'ADMIN' || user.role === 'BOSS') ? (
          <KPICard
            title="Importaciones en Tránsito"
            value={`${data.activeImports} Envíos`}
            subValue="ETA: 4-12 días"
            icon={Ship}
          />
        ) : (
          <KPICard
            title="Entregas Pendientes"
            value={`${4} Órdenes`}
            subValue="Programadas para hoy"
            icon={Truck}
          />
        )}
      </div>

      {(user.role === 'ADMIN' || user.role === 'BOSS') && (
        <>
          <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Comparativa de Ventas</h3>
                <p className="text-foreground/40 text-sm">Rendimiento de ingresos en los últimos 7 meses</p>
              </div>
              <TimeFilterToggle active="Mensual" />
            </div>

            <div className="h-[350px] w-full relative z-10">
              <TopProductsChart data={data.topProducts} />
            </div>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />

            <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div className="flex items-center gap-6">
                <h3 className="text-xl font-bold tracking-tight">Top Selling Products</h3>
                <TimeFilterToggle active="Mensual" />
              </div>
              <Link
                href="/dashboard/inventory"
                className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
              >
                View All Inventory <ChevronRight size={16} />
              </Link>
            </div>

            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-foreground/[0.02] text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-bold">
                    <th className="px-8 py-4">Product Variant</th>
                    <th className="px-8 py-4">Category</th>
                    <th className="px-8 py-4 text-right">Units Sold</th>
                    <th className="px-8 py-4 text-right">Total Revenue (PEN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.topProducts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-foreground/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-foreground/5 border border-border flex items-center justify-center text-muted-foreground group-hover:border-primary/30 transition-colors overflow-hidden">
                            <Package size={18} />
                          </div>
                          <div>
                            <span className="font-bold text-sm">{item.name}</span>
                            <span className="text-[10px] text-muted-foreground ml-2 font-mono">{item.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-foreground/5 border border-border text-primary">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-sm">{item.quantity.toLocaleString()}</td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-black text-primary neon-glow">S/ {item.revenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                      </td>
                    </tr>
                  ))}
                  {data.topProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-muted-foreground">
                        No hay datos de productos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="glass-panel rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <div className="p-6 border-b border-border/50 relative z-10">
          <h3 className="text-xl font-bold tracking-tight">Ventas Recientes</h3>
          <p className="text-foreground/40 text-sm">Últimas 5 transacciones</p>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-foreground/[0.02] text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4">Factura</th>
                <th className="px-8 py-4">Cliente</th>
                <th className="px-8 py-4">Sede</th>
                <th className="px-8 py-4 text-right">Total</th>
                <th className="px-8 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-foreground/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <span className="font-mono text-xs font-bold text-primary">{sale.invoiceNumber}</span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium">{sale.customer.name}</td>
                  <td className="px-8 py-5 text-sm text-muted-foreground">{sale.location.name}</td>
                  <td className="px-8 py-5 text-right font-bold text-sm">
                    S/ {sale.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        sale.status === 'PAID'
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : sale.status === 'PENDING'
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      )}
                    >
                      {sale.status === 'PAID' && <ArrowUpRight size={12} className="mr-1" />}
                      {sale.status === 'PENDING' && <ArrowDownRight size={12} className="mr-1" />}
                      {sale.status === 'PAID' ? 'Pagada' : sale.status === 'PENDING' ? 'Pendiente' : 'Anulada'}
                    </span>
                  </td>
                </tr>
              ))}
              {data.recentSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground">
                    No hay ventas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}