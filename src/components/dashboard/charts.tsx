'use client'

import { useState, useEffect } from 'react'
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
  Label,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'

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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="w-full h-full animate-pulse bg-card/50 rounded-xl" />
  }

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
        <YAxis
              width={80}
              stroke="#00f7ff"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                if (v >= 1000000) return `S/ ${(v/1000000).toFixed(1)}M`
                if (v >= 1000) return `S/ ${(v/1000).toFixed(0)}k`
                return `S/ ${v}`
              }}
            />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area type="monotone" dataKey="revenue" stroke="#00f7ff" strokeWidth={2} fill="url(#gradientRevenue)" />
        <Area type="monotone" dataKey="expenses" stroke="#f472b6" strokeWidth={2} fill="url(#gradientExpenses)" />
        <Area type="monotone" dataKey="profit" stroke="#34d399" strokeWidth={2} fill="url(#gradientProfit)" />
      </AreaChart>
    </ChartContainer>
  )
}

interface TopSalesChartProps {
  topProducts: Array<{ name: string; quantity: number }>
}

const topSalesConfig = {
  quantity: { label: 'Unidades vendidas', color: '#00f7ff' },
} satisfies ChartConfig

export function TopSalesChart({ topProducts }: TopSalesChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const data = topProducts.slice(0, 5).map((p) => ({
    name: p.name.length > 16 ? p.name.substring(0, 16) + '…' : p.name,
    quantity: p.quantity,
  }))

  if (!isMounted) {
    return <div className="w-full h-full animate-pulse bg-card/50 rounded-xl" />
  }

  return (
    <ChartContainer config={topSalesConfig} className="w-full h-full">
      <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <XAxis dataKey="name" stroke="#00f7ff" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#00f7ff" fontSize={11} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="quantity" fill="#00f7ff" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ChartContainer>
  )
}

interface StockDonutChartProps {
  data: Array<{ category: string; value: number }>
}

const stockDonutConfig = {
  value: { label: 'Valor', color: '#00f7ff' },
} satisfies ChartConfig

const CATEGORY_COLORS = ['#00f7ff', '#0891b2', '#a855f7', '#64748b']

export function StockDonutChart({ data }: StockDonutChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const total = data.reduce((acc, d) => acc + d.value, 0)

  if (!isMounted) {
    return <div className="w-full h-full animate-pulse bg-card/50 rounded-xl" />
  }

  return (
    <ChartContainer config={stockDonutConfig} className="w-full h-full">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={70}
          dataKey="value"
          nameKey="category"
          paddingAngle={2}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
          ))}
          <Label
            value="Total Stock"
            position="center"
            fill="#00f7ff"
            fontSize={10}
            fontWeight="bold"
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          />
          <Label
            value={`S/${(total / 1000).toFixed(1)}k`}
            position="center"
            dy={14}
            fill="#00f7ff"
            fontSize={16}
            fontWeight="black"
          />
        </Pie>
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  )
}
