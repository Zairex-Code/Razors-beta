import { prisma } from '@/lib/prisma'
import { getUserWithRole } from '@/app/actions/auth-actions'
import { ReportsPageClient } from './ReportsPageClient'

async function getReportData() {
  const [
    sales,
    expenses,
    imports,
    products,
    inventory,
    locations
  ] = await Promise.all([
    prisma.sale.findMany({
      where: { status: 'PAID' },
      include: { items: true }
    }),
    prisma.expense.findMany({
      where: { status: 'PAID' }
    }),
    prisma.import.findMany({
      where: { status: 'DELIVERED' },
      include: { items: true, costs: true }
    }),
    prisma.product.findMany({
      include: { inventory: true, saleItems: true }
    }),
    prisma.inventory.findMany({
      include: { product: true, location: true }
    }),
    prisma.location.findMany()
  ])

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0)
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amountPen, 0)
  const totalImportsCost = imports.reduce((acc, imp) => {
    const itemsCost = imp.items.reduce((sum, item) => sum + (item.quantity * item.unitPriceUsd * imp.exchangeRate), 0)
    const costsCost = imp.costs.reduce((sum, cost) => {
      return sum + (cost.currency === 'PEN' ? cost.amount : cost.amount * (cost.exchangeRate ?? imp.exchangeRate))
    }, 0)
    return acc + itemsCost + costsCost
  }, 0)
  const netProfit = totalRevenue - totalExpenses - totalImportsCost

  const productQuantities = new Map<string, number>()
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const current = productQuantities.get(item.productId) || 0
      productQuantities.set(item.productId, current + item.quantity)
    })
  })

  const productSalesMap = Array.from(productQuantities.entries())
    .map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId)
      return { productId, quantity, name: product?.name || 'Unknown', sku: product?.sku || '' }
    })
    .sort((a, b) => b.quantity - a.quantity)

  const topProducts = productSalesMap.slice(0, 5)
  const bottomProducts = productSalesMap.slice(-5).reverse()

  const stockByCategory = products.reduce((acc, product) => {
    const totalStock = product.inventory.reduce((sum, inv) => sum + inv.stock, 0)
    const value = totalStock * product.pricePen
    const existing = acc.find(a => a.category === product.category)
    if (existing) {
      existing.value += value
    } else {
      acc.push({ category: product.category, value })
    }
    return acc
  }, [] as Array<{ category: string; value: number }>)

  const stockValue = inventory.reduce((acc, inv) => {
    const product = products.find(p => p.id === inv.productId)
    return acc + (inv.stock * (product?.pricePen || 0))
  }, 0)

  const lowStockItems = inventory
    .filter(inv => inv.stock < 10)
    .map(inv => {
      const product = products.find(p => p.id === inv.productId)
      const location = locations.find(l => l.id === inv.locationId)
      return {
        name: product?.name || 'Unknown',
        sku: product?.sku || '',
        stock: inv.stock,
        location: location?.name || 'Unknown'
      }
    })
    .sort((a, b) => a.stock - b.stock)

  const monthlyData = new Map<string, { revenue: number; expenses: number; profit: number }>()
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyData.set(key, { revenue: 0, expenses: 0, profit: 0 })
  }

  sales.forEach(sale => {
    const d = new Date(sale.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (monthlyData.has(key)) {
      const current = monthlyData.get(key)!
      current.revenue += sale.totalAmount
    }
  })

  expenses.forEach(expense => {
    const d = new Date(expense.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (monthlyData.has(key)) {
      const current = monthlyData.get(key)!
      current.expenses += expense.amountPen
    }
  })

  monthlyData.forEach((data) => {
    data.profit = data.revenue - data.expenses
  })

  const revenueByMonth = Array.from(monthlyData.entries())
    .map(([date, data]) => ({
      date: date.split('-').reverse()[0] + '/' + date.split('-')[1],
      ...data
    }))

  const lowStockCount = lowStockItems.filter(i => i.stock > 0).length
  const outOfStockCount = lowStockItems.filter(i => i.stock === 0).length

  return {
    totalRevenue,
    totalExpenses,
    totalImportsCost,
    netProfit,
    stockValue,
    lowStockCount,
    outOfStockCount,
    revenueByMonth,
    topProducts,
    bottomProducts,
    stockByCategory,
    lowStockItems
  }
}

export default async function ReportsPage() {
  const user = await getUserWithRole()
  if (!user) return null

  const data = await getReportData()

  return <ReportsPageClient data={data} />
}