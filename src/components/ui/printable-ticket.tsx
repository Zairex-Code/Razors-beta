'use client'

import { useRef, useCallback } from 'react'
import { Printer, Download } from 'lucide-react'

type SaleItem = {
  product: { name: string; sku?: string }
  quantity: number
  unitPrice: number
  subtotal: number
}

type Sale = {
  id: string
  invoiceNumber: string
  date: string | Date
  status: string
  totalAmount: number
  customer: { name: string; docType?: string; docNumber?: string }
  location?: { name: string }
  items: SaleItem[]
}

interface PrintableTicketProps {
  sale: Sale
  onClose?: () => void
}

export function PrintableTicket({ sale, onClose }: PrintableTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null)

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  const subtotal = sale.items.reduce((sum, item) => sum + item.subtotal, 0)
  const igv = subtotal * 0.18
  const total = sale.totalAmount

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Ticket / Factura</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/30 font-medium text-sm hover:bg-primary/20 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={() => {
              const printContent = ticketRef.current
              if (!printContent) return
              const printWindow = window.open('', '_blank')
              if (!printWindow) return
              printWindow.document.write(`
                <html>
                  <head>
                    <title>${sale.invoiceNumber}</title>
                    <style>
                      body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
                      .header { text-align: center; margin-bottom: 20px; }
                      .items { border-top: 1px dashed #000; padding-top: 10px; }
                      .item { display: flex; justify-content: space-between; margin: 5px 0; }
                      .totals { border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; }
                      .total { font-weight: bold; font-size: 1.2em; }
                      @media print { body { padding: 0; } }
                    </style>
                  </head>
                  <body>
                    ${printContent.innerHTML}
                  </body>
                </html>
              `)
              printWindow.document.close()
              printWindow.print()
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 font-medium text-sm hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>

      <div ref={ticketRef} className="bg-white text-black p-6 rounded-lg font-mono text-sm">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">RAZORS BARBER SUPPLIES</h2>
          <p className="text-xs mt-1">RUC: 20601234567</p>
          <p className="text-xs">Av. Ejemplo 1234, Lima</p>
        </div>

        <div className="border-t border-b border-dashed border-gray-400 py-4 mb-4">
          <div className="flex justify-between">
            <span>Ticket:</span>
            <span className="font-bold">{sale.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Fecha:</span>
            <span>{formatDate(sale.date)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cliente:</span>
            <span>{sale.customer.name}</span>
          </div>
          {sale.location && (
            <div className="flex justify-between">
              <span>Sede:</span>
              <span>{sale.location.name}</span>
            </div>
          )}
        </div>

        <div className="border-dashed border-b border-gray-400 pb-4 mb-4">
          <div className="flex justify-between font-bold text-xs mb-2">
            <span>Producto</span>
            <span>Total</span>
          </div>
          {sale.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs mb-1">
              <span>
                {item.quantity}x {item.product.name.length > 20
                  ? item.product.name.substring(0, 20) + '...'
                  : item.product.name}
              </span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>IGV (18%):</span>
            <span>{formatCurrency(igv)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-dashed border-gray-400 pt-2 mt-2">
            <span>TOTAL:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-400">
          <p className="text-xs">¡Gracias por su compra!</p>
          <p className="text-xs mt-1">www.razors.pe</p>
        </div>
      </div>
    </div>
  )
}

interface InvoiceData {
  invoiceNumber: string
  date: Date | string
  customer: {
    name: string
    docType: string
    docNumber: string
    address?: string
    email?: string
  }
  seller?: {
    name: string
  }
  location: {
    name: string
    address: string
  }
  items: Array<{
    product: { name: string; sku?: string }
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  subtotal: number
  igv: number
  total: number
  paymentMethod?: string
  observations?: string
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Factura ${data.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .company-info h1 { font-size: 24px; color: #111; }
        .company-info p { font-size: 12px; color: #666; }
        .invoice-info { text-align: right; }
        .invoice-info h2 { font-size: 20px; color: #00f7ff; margin-bottom: 5px; }
        .invoice-info p { font-size: 12px; color: #666; }
        .addresses { display: flex; gap: 40px; margin-bottom: 30px; padding: 20px; background: #f8f8f8; border-radius: 8px; }
        .addresses h3 { font-size: 11px; color: #999; text-transform: uppercase; margin-bottom: 8px; }
        .addresses p { font-size: 13px; line-height: 1.5; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #111; color: #fff; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
        th:last-child { text-align: right; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; }
        td:last-child { text-align: right; }
        .totals { display: flex; justify-content: flex-end; }
        .totals-table { width: 300px; }
        .totals-table tr td { padding: 8px 12px; border: none; }
        .totals-table tr:last-child { font-size: 18px; font-weight: bold; color: #00f7ff; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 11px; color: #999; text-align: center; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>RAZORS BARBER SUPPLIES</h1>
          <p>RUC: 20601234567</p>
          <p>Av. Ejemplo 1234, Lima, Perú</p>
          <p>Tel: (01) 234-5678</p>
        </div>
        <div class="invoice-info">
          <h2>FACTURA ELECTRÓNICA</h2>
          <p>${data.invoiceNumber}</p>
          <p>Fecha: ${formatDate(data.date)}</p>
        </div>
      </div>

      <div class="addresses">
        <div>
          <h3>Cliente</h3>
          <p><strong>${data.customer.name}</strong></p>
          <p>${data.customer.docType}: ${data.customer.docNumber}</p>
          ${data.customer.address ? `<p>${data.customer.address}</p>` : ''}
          ${data.customer.email ? `<p>${data.customer.email}</p>` : ''}
        </div>
        <div>
          <h3>Lugar de Entrega</h3>
          <p><strong>${data.location.name}</strong></p>
          <p>${data.location.address}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unit.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td>${item.product.name}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.unitPrice)}</td>
              <td>${formatCurrency(item.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td>${formatCurrency(data.subtotal)}</td>
          </tr>
          <tr>
            <td>IGV (18%):</td>
            <td>${formatCurrency(data.igv)}</td>
          </tr>
          <tr>
            <td>Total:</td>
            <td>${formatCurrency(data.total)}</td>
          </tr>
        </table>
      </div>

      ${data.observations ? `
        <div style="margin-top: 30px; padding: 15px; background: #f8f8f8; border-radius: 8px;">
          <strong>Observaciones:</strong><br/>
          ${data.observations}
        </div>
      ` : ''}

      <div class="footer">
        <p>Authorized by SUNAT - Resolution 097-2020/SUNAT</p>
        <p>Este documento es un representation impresa de a electronic invoice</p>
      </div>
    </body>
    </html>
  `
}

export function printInvoice(data: InvoiceData) {
  const html = generateInvoiceHTML(data)
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.print()
  }
}
