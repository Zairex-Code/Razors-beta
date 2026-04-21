'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import {
  format,
  parseISO,
  isValid,
  getWeek,
  subDays,
  startOfDay,
  eachDayOfInterval,
  differenceInDays,
} from 'date-fns'
import { es } from 'date-fns/locale'

type TimeFilter = 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL'

interface SaleData {
  date: Date | string
  totalAmount: number
}

interface ChartDataPoint {
  label: string
  sales: number
}

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: 'DIARIO', label: 'Diario' },
  { key: 'SEMANAL', label: 'Semanal' },
  { key: 'MENSUAL', label: 'Mensual' },
  { key: 'TRIMESTRAL', label: 'Trimestral' },
  { key: 'ANUAL', label: 'Anual' },
]

function groupByPeriod(data: SaleData[], filter: TimeFilter): ChartDataPoint[] {
  const now = new Date()

  if (filter === 'DIARIO') {
    const last7Days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now,
    })

    const salesByDay = data.reduce((acc: Map<string, number>, sale) => {
      const date = typeof sale.date === 'string' ? parseISO(sale.date) : sale.date
      if (!isValid(date)) return acc
      const dayKey = format(startOfDay(date), 'yyyy-MM-dd')
      acc.set(dayKey, (acc.get(dayKey) || 0) + sale.totalAmount)
      return acc
    }, new Map())

    return last7Days.map((day) => {
      const dayKey = format(day, 'yyyy-MM-dd')
      const dayLabel = format(day, 'EEE dd', { locale: es })
      return {
        label: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
        sales: salesByDay.get(dayKey) || 0,
      }
    })
  }

  const grouped = data.reduce((acc: Map<string, number>, sale) => {
    const date = typeof sale.date === 'string' ? parseISO(sale.date) : sale.date
    if (!isValid(date)) return acc

    let key: string
    switch (filter) {
      case 'SEMANAL':
        key = `Sem ${getWeek(date)}`
        break
      case 'MENSUAL':
        key = format(date, 'MMM yyyy', { locale: es })
        break
      case 'TRIMESTRAL':
        key = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${format(date, 'yyyy')}`
        break
      case 'ANUAL':
        key = format(date, 'yyyy')
        break
      default:
        key = format(date, 'MMM yyyy', { locale: es })
    }

    acc.set(key, (acc.get(key) || 0) + sale.totalAmount)
    return acc
  }, new Map())

  const entries = Array.from(grouped.entries())

  const sortedEntries = entries.sort((a, b) => {
    return a[0].localeCompare(b[0])
  })

  return sortedEntries.slice(-7).map(([label, sales]) => ({
    label,
    sales,
  }))
}

interface SalesChartClientProps {
  rawData: SaleData[]
}

export function SalesChartClient({ rawData }: SalesChartClientProps) {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('MENSUAL')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const chartData = useMemo(() => {
    return groupByPeriod(rawData, activeFilter)
  }, [rawData, activeFilter])

  if (!isMounted) {
    return (
      <div className="h-[350px] w-full animate-pulse bg-card/50 rounded-xl flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Cargando gráfico...</div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
        No hay datos disponibles
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex p-1 rounded-full bg-black border border-gray-800">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                activeFilter === f.key
                  ? "bg-primary text-black rounded-full"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f7ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00f7ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#00f7ff"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#00f7ff', strokeOpacity: 0.3 }}
            />
            <YAxis
              stroke="#00f7ff"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `S/ ${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10,10,10,0.95)',
                border: '1px solid #00f7ff',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 0 20px rgba(0,247,255,0.2)',
              }}
              labelStyle={{ color: '#00f7ff', fontWeight: 'bold', marginBottom: '8px' }}
              itemStyle={{ color: '#00f7ff' }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#00f7ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
