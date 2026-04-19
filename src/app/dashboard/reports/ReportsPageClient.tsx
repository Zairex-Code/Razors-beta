'use client'

import { cn } from '@/lib/utils'
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Printer,
} from 'lucide-react'
import {
  RevenueChart,
  RotationChart,
  StockValueChart,
} from '@/components/dashboard/charts'

interface ReportData {
  totalRevenue: number
  totalExpenses: number
  totalImportsCost: number
  netProfit: number
  stockValue: number
  lowStockCount: number
  outOfStockCount: number
  revenueByMonth: Array<{ date: string; revenue: number; expenses: number; profit: number }>
  topProducts: Array<{ name: string; quantity: number }>
  bottomProducts: Array<{ name: string; quantity: number }>
  stockByCategory: Array<{ category: string; value: number }>
  lowStockItems: Array<{ name: string; sku: string; stock: number; location: string }>
}

interface ReportsPageClientProps {
  data: ReportData
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  className
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  trend?: 'up' | 'down'
  trendValue?: string
  className?: string
}) {
  return (
    <div className={cn("glass-panel rounded-2xl p-6 border-border/30 print:bg-white print:border print:border-gray-200", className)}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center print:bg-gray-100">
          <Icon size={24} className="text-primary print:text-gray-700" />
        </div>
        {trend && trendValue && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend === 'up' ? "bg-emerald-500/10 text-emerald-400 print:bg-emerald-50 print:text-emerald-600" : "bg-rose-500/10 text-rose-400 print:bg-rose-50 print:text-rose-600"
          )}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 print:text-gray-500">{title}</p>
      <p className="text-2xl font-black tracking-tight print:text-black">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1 print:text-gray-500">{subtitle}</p>}
    </div>
  )
}

export function ReportsPageClient({ data }: ReportsPageClientProps) {
  return (
    <div className="space-y-8 print:space-y-6 print:p-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center print:bg-gray-100">
              <BarChart3 size={24} className="text-primary print:text-gray-700" />
            </div>
            Reportes y Análisis
          </h1>
          <p className="text-muted-foreground mt-1 print:text-gray-500">Inteligencia financiera y operacional del negocio.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-bold text-sm transition-all print:hidden"
        >
          <Printer size={16} />
          Imprimir Reporte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ingresos Totales"
          value={`S/ ${data.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          subtitle="Ventas acumuladas"
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
        />
        <StatCard
          title="Gastos Operativos"
          value={`S/ ${data.totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          subtitle="Operación del mes"
          icon={TrendingDown}
          trend="down"
          trendValue="-3.2%"
        />
        <StatCard
          title="Costo Importaciones"
          value={`S/ ${data.totalImportsCost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          subtitle="Inversiones en inventario"
          icon={Package}
        />
        <StatCard
          title="Ganancia Neta"
          value={`S/ ${data.netProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          subtitle="Después de importaciones"
          icon={TrendingUp}
          className={data.netProfit >= 0 ? "border-emerald-500/30" : "border-rose-500/30"}
        />
      </div>

      <div className="glass-panel rounded-[2rem] p-8 border-border/30 print:rounded-none print:p-0 print:border-0 print:bg-white">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Rentabilidad por Mes</h3>
            <p className="text-xs text-muted-foreground">Ingresos, gastos y ganancia neta</p>
          </div>
        </div>
        <div className="h-[350px] print:h-auto">
          <RevenueChart data={data.revenueByMonth} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-[2rem] p-8 border-border/30 print:rounded-none print:p-0 print:border print:border-gray-200 print:bg-white">
          <div className="flex justify-between items-center mb-6 print:hidden">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Rotación de Productos</h3>
              <p className="text-xs text-muted-foreground">Top 5 más vendidos vs. 5 menos vendidos</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-muted-foreground">Más vendidos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="text-muted-foreground">Menos vendidos</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] print:h-auto">
            <RotationChart topProducts={data.topProducts} bottomProducts={data.bottomProducts} />
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-8 border-border/30 print:rounded-none print:p-0 print:border print:border-gray-200 print:bg-white">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Valorización Stock</h3>
              <p className="text-xs text-muted-foreground">Por categoría</p>
            </div>
          </div>
          <div className="h-[240px] relative print:h-auto">
            <StockValueChart data={data.stockByCategory} />
          </div>
          <div className="mt-4 p-4 glass-panel rounded-xl bg-foreground/[0.02] print:bg-gray-50 print:border print:border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground print:text-gray-500">Valor Total Stock</span>
              <span className="text-lg font-black text-primary print:text-black">
                S/ {data.stockValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-8 border-border/30 print:rounded-none print:p-0 print:border print:border-gray-200 print:bg-white">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div>
            <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" />
              Alertas de Stock
            </h3>
            <p className="text-xs text-muted-foreground">Productos que requieren atención</p>
          </div>
          <div className="flex items-center gap-2">
            {data.outOfStockCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {data.outOfStockCount} AGOTADOS
              </span>
            )}
            {data.lowStockCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {data.lowStockCount} BAJO STOCK
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {data.lowStockItems.length > 0 ? (
            data.lowStockItems.slice(0, 8).map((item, idx) => (
              <div key={idx} className="glass-panel rounded-xl p-4 flex items-center justify-between bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all print:bg-gray-50 print:border print:border-gray-200 print:hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    item.stock === 0 ? "bg-rose-500/10 text-rose-400 print:bg-rose-100 print:text-rose-600" : "bg-amber-500/10 text-amber-400 print:bg-amber-100 print:text-amber-600"
                  )}>
                    {item.stock === 0 ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <Package size={18} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm print:text-black">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono print:text-gray-500">{item.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-lg font-black",
                    item.stock === 0 ? "text-rose-400 print:text-rose-600" : "text-amber-400 print:text-amber-600"
                  )}>
                    {item.stock}
                  </p>
                  <p className="text-[10px] text-muted-foreground">unidades</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <p className="font-bold text-emerald-400">Sin alertas</p>
              <p className="text-sm text-muted-foreground">Todos los productos tienen stock adecuado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
