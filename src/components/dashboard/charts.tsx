'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface SalesComparisonChartProps {
  data: Array<{
    month: string
    sales: number
    previousPeriod: number
  }>
}

export function SalesComparisonChart({ data }: SalesComparisonChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00f7ff" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#00f7ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
        <XAxis
          dataKey="month"
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
  )
}

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue: number
    expenses: number
    profit: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#00f7ff" opacity={0.1} />
        <XAxis dataKey="date" stroke="#00f7ff" fontSize={12} />
        <YAxis stroke="#00f7ff" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: '1px solid #00f7ff',
            borderRadius: '8px',
          }}
        />
        <Line type="monotone" dataKey="revenue" stroke="#00f7ff" strokeWidth={2} dot={{ fill: '#00f7ff' }} name="Ingresos" />
        <Line type="monotone" dataKey="expenses" stroke="#f472b6" strokeWidth={2} dot={{ fill: '#f472b6' }} name="Gastos" />
        <Line type="monotone" dataKey="profit" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399' }} name="Ganancia" />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface RotationChartProps {
  topProducts: Array<{ name: string; quantity: number }>
  bottomProducts: Array<{ name: string; quantity: number }>
}

export function RotationChart({ topProducts, bottomProducts }: RotationChartProps) {
  const combined = [
    ...topProducts.map((p) => ({ name: p.name, quantity: p.quantity, fill: '#34d399' })),
    ...bottomProducts.map((p) => ({ name: p.name, quantity: p.quantity, fill: '#f87171' })),
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={combined} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis type="number" stroke="#00f7ff" fontSize={12} />
        <YAxis dataKey="name" type="category" stroke="#00f7ff" width={80} fontSize={10} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: '1px solid #00f7ff',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
          {combined.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

interface StockValueChartProps {
  data: Array<{ category: string; value: number }>
}

export function StockValueChart({ data }: StockValueChartProps) {
  const COLORS = ['#00f7ff', '#00d4e0', '#00b1c1', '#008ea2', '#006b83']

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="category"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: '1px solid #00f7ff',
            borderRadius: '8px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}