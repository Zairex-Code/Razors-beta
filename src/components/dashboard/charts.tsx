'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue: number
    expenses: number
    profit: number
  }>
}

const revenueChartConfig = {
  revenue: { label: 'Ingresos', color: '#00f7ff' },
  expenses: { label: 'Gastos', color: '#f472b6' },
  profit: { label: 'Ganancia', color: '#34d399' },
} satisfies ChartConfig

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ChartContainer config={revenueChartConfig} className="w-full h-full">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00f7ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00f7ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradientExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradientProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#00f7ff" opacity={0.1} vertical={false} />
        <XAxis dataKey="date" stroke="#00f7ff" fontSize={12} tickLine={false} axisLine={{ stroke: '#00f7ff', strokeOpacity: 0.3 }} />
        <YAxis stroke="#00f7ff" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `S/${(v/1000).toFixed(0)}k`} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Area type="monotone" dataKey="revenue" stroke="#00f7ff" strokeWidth={2} fill="url(#gradientRevenue)" />
        <Area type="monotone" dataKey="expenses" stroke="#f472b6" strokeWidth={2} fill="url(#gradientExpenses)" />
        <Area type="monotone" dataKey="profit" stroke="#34d399" strokeWidth={2} fill="url(#gradientProfit)" />
      </AreaChart>
    </ChartContainer>
  )
}

interface RotationChartProps {
  topProducts: Array<{ name: string; quantity: number }>
  bottomProducts: Array<{ name: string; quantity: number }>
}

const rotationChartConfig = {
  top: { label: 'Más vendidos', color: '#34d399' },
  bottom: { label: 'Menos vendidos', color: '#f87171' },
} satisfies ChartConfig

export function RotationChart({ topProducts, bottomProducts }: RotationChartProps) {
  const combined = [
    ...topProducts.map((p) => ({ name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name, quantity: p.quantity, type: 'top' })),
    ...bottomProducts.map((p) => ({ name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name, quantity: p.quantity, type: 'bottom' })),
  ]

  return (
    <ChartContainer config={rotationChartConfig} className="w-full h-full">
      <BarChart data={combined} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#00f7ff" opacity={0.1} horizontal={false} />
        <XAxis type="number" stroke="#00f7ff" fontSize={12} tickLine={false} axisLine={{ stroke: '#00f7ff', strokeOpacity: 0.3 }} />
        <YAxis dataKey="name" type="category" stroke="#00f7ff" width={90} fontSize={10} tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="quantity" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {combined.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.type === 'top' ? '#34d399' : '#f87171'} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

interface StockValueChartProps {
  data: Array<{ category: string; value: number }>
}

const stockChartConfig = {
  value: { label: 'Valorización', color: '#00f7ff' },
} satisfies ChartConfig

const CATEGORY_COLORS = ['#00f7ff', '#f472b6', '#34d399', '#fbbf24', '#a78bfa']

export function StockValueChart({ data }: StockValueChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0)

  return (
    <ChartContainer config={stockChartConfig} className="w-full h-full">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={110} innerRadius={65} dataKey="value" nameKey="category" paddingAngle={2}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs text-muted-foreground font-medium">Total</p>
          <p className="text-xl font-black text-primary">S/{(total/1000).toFixed(1)}k</p>
        </div>
      </PieChart>
    </ChartContainer>
  )
}
