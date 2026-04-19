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
} from 'recharts'

const COLORS = ['#00f7ff', '#00d4e0', '#00b1c1', '#008ea2', '#006b83']

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
          formatter={(value) => `S/. ${Number(value).toLocaleString('es-PE')}`}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}