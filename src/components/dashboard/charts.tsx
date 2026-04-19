'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

interface TopProductsChartProps {
  data: Array<{ name: string; quantity: number }>
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#00f7ff" opacity={0.1} />
        <XAxis type="number" stroke="#00f7ff" />
        <YAxis dataKey="name" type="category" stroke="#00f7ff" width={100} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: '1px solid #00f7ff',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="quantity" fill="#00f7ff" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface SalesSummaryChartProps {
  paid: number
  pending: number
}

export function SalesSummaryChart({ paid, pending }: SalesSummaryChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={[
            { name: 'Pagadas', value: paid },
            { name: 'Pendientes', value: pending },
          ]}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          <Cell fill="#00f7ff" />
          <Cell fill="#00d4e0" />
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