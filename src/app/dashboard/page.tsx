import { prisma } from '@/lib/prisma'
import { getUserWithRole } from '@/app/actions/auth-actions'
import { SalesChartClient } from '@/components/dashboard/SalesChartClient'
import {
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Ship,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

async function getDashboardData(userRole: string, userId?: string) {
  const isAdminOrBoss = userRole === 'ADMIN' || userRole === 'BOSS'

  const [
    totalProducts,
    recentSales,
    topProducts,
    activeImports,
    salesHistory,
  ] = await Promise.all([
    prisma.product.count(),
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
    isAdminOrBoss
      ? prisma.saleItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        })
      : [],
    isAdminOrBoss ? prisma.import.count({ where: { status: { in: ['DISPATCHED', 'IN_TRANSIT'] } } }) : 0,
    isAdminOrBoss
      ? prisma.sale.findMany({
          where: { status: 'PAID' },
          orderBy: { date: 'desc' },
          take: 365,
        })
      : [],
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

  const rawSalesData = salesHistory.map(sale => ({
    date: sale.date,
    totalAmount: sale.totalAmount,
  }))

  return {
    totalProducts,
    recentSales,
    topProducts: topProductsWithNames,
    isAdminOrBoss,
    activeImports,
    rawSalesData,
  }
}

function KPICard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  accentColor = 'primary',
}: {
  title: string
  value: string
  subValue: string
  icon: React.ElementType
  trend?: number
  accentColor?: string
}) {
  return (
    <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors",
        accentColor === 'emerald' && "bg-emerald-500/5",
        accentColor === 'amber' && "bg-amber-500/5"
      )} />

      <div className="flex justify-between items-start">
        <div className="p-2.5 rounded-lg bg-foreground/5 border border-border text-foreground/70">
          <Icon size={20} />
        </div>
        {trend !== undefined && (
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

export default async function DashboardPage() {
  const user = await getUserWithRole()
  if (!user) return null

  const data = await getDashboardData(user.role, user.id)

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
        <KPICard
          title="Ganancia del Mes"
          value={`S/ ${data.rawSalesData.reduce((sum: number, d: { totalAmount: number }) => sum + d.totalAmount, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          subValue="+12.5% vs mes anterior"
          icon={Wallet}
          trend={12.5}
        />
        <KPICard
          title="Más Vendido"
          value={data.topProducts[0]?.name || 'N/A'}
          subValue={`${data.topProducts[0]?.quantity || 0} unidades este mes`}
          icon={TrendingUp}
        />
        <KPICard
          title="Stock Total"
          value={data.totalProducts.toLocaleString()}
          subValue="En múltiples ubicaciones"
          icon={Package}
          trend={-2.4}
        />
        <KPICard
          title="Importaciones en Tránsito"
          value={`${data.activeImports} Envíos`}
          subValue="ETA: 4-12 días"
          icon={Ship}
        />
      </div>

      <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Comparación de Ventas</h3>
            <p className="text-foreground/40 text-sm">Rendimiento de ingresos en los últimos 7 meses</p>
          </div>
        </div>

        <div className="relative z-10">
          <SalesChartClient rawData={data.rawSalesData} />
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />

        <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center gap-6">
            <h3 className="text-xl font-bold tracking-tight">Productos Más Vendidos</h3>
          </div>
          <Link
            href="/dashboard/inventory"
            className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
          >
            Ver Todo el Inventario <ChevronRight size={16} />
          </Link>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-foreground/[0.02] text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4">Variante de Producto</th>
                <th className="px-8 py-4">Categoría</th>
                <th className="px-8 py-4 text-right">Unidades Vendidas</th>
                <th className="px-8 py-4 text-right">Ingresos Totales (PEN)</th>
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
    </div>
  )
}