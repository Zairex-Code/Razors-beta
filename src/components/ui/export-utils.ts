'use client'

export function exportToCSV<T extends Record<string, unknown[]>>(
  data: T,
  filename: string = 'export'
) {
  const keys = Object.keys(data) as (keyof T)[]
  if (keys.length === 0) return

  const firstArray = data[keys[0]]
  if (!firstArray || firstArray.length === 0) return

  const headers = keys.join(',')

  const rows = firstArray.map((_, rowIndex) => {
    return keys.map(key => {
      const value = data[key][rowIndex]
      if (value === null || value === undefined) return ''
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  })

  const csv = [headers, ...rows].join('\n')
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

export function exportArrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string = 'export'
) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])

  const rows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      if (value === null || value === undefined) return ''
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function formatCurrency(value: number, currency: string = 'PEN'): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency
  }).format(value)
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'long') {
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function generateReportData(data: {
  sales?: Array<{
    invoiceNumber: string
    date: Date | string
    customer: { name: string }
    totalAmount: number
    status: string
  }>
  products?: Array<{
    name: string
    sku: string
    category: string
    pricePen: number
    stock: number
  }>
  customers?: Array<{
    name: string
    docType: string
    docNumber: string
    email?: string | null
    totalPurchases?: number
  }>
  expenses?: Array<{
    date: Date | string
    category: string
    description: string
    amountPen: number
    status: string
  }>
}) {
  const report: Record<string, unknown[]> = {}

  if (data.sales) {
    report['Numero de Factura'] = data.sales.map(s => s.invoiceNumber)
    report['Fecha'] = data.sales.map(s => formatDate(s.date))
    report['Cliente'] = data.sales.map(s => s.customer.name)
    report['Total (PEN)'] = data.sales.map(s => s.totalAmount)
    report['Estado'] = data.sales.map(s => s.status)
  }

  if (data.products) {
    report['Producto'] = data.products.map(p => p.name)
    report['SKU'] = data.products.map(p => p.sku)
    report['Categoria'] = data.products.map(p => p.category)
    report['Precio (PEN)'] = data.products.map(p => p.pricePen)
    report['Stock'] = data.products.map(p => p.stock)
  }

  if (data.customers) {
    report['Cliente'] = data.customers.map(c => c.name)
    report['Tipo de Documento'] = data.customers.map(c => c.docType)
    report['Numero de Documento'] = data.customers.map(c => c.docNumber)
    report['Email'] = data.customers.map(c => c.email || '')
    report['Total de Compras (PEN)'] = data.customers.map(c => c.totalPurchases || 0)
  }

  if (data.expenses) {
    report['Fecha'] = data.expenses.map(e => formatDate(e.date))
    report['Categoria'] = data.expenses.map(e => e.category)
    report['Descripcion'] = data.expenses.map(e => e.description)
    report['Monto (PEN)'] = data.expenses.map(e => e.amountPen)
    report['Estado'] = data.expenses.map(e => e.status)
  }

  return report
}
