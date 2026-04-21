'use client'

import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SaleItem {
  id: string
  quantity: number
  unitPrice: number
  basePrice: number
  hasDiscount: boolean
  discountPct: number
  subtotal: number
  product: {
    id: string
    name: string
    brand?: string | null
    model?: string | null
    sku: string
    imageUrl?: string | null
  }
}

interface Sale {
  id: string
  invoiceNumber: string
  date: Date | string
  status: 'PAID' | 'PENDING' | 'VOID'
  totalAmount: number
  paymentMethod: string
  isDelivery: boolean
  deliveryCost: number
  voucherUrl?: string | null
  customer: {
    id: string
    name: string
    docType: string
    docNumber: string
  }
  location: {
    id: string
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
  }
  user: {
    id: string
    name: string
  }
  items: SaleItem[]
}

interface InvoiceTemplateProps {
  sale: Sale
  ref?: React.Ref<HTMLDivElement>
}

export function InvoiceTemplate({ sale, ref }: InvoiceTemplateProps) {
  const subtotal = (sale.totalAmount - sale.deliveryCost) / 1.18
  const igv = sale.totalAmount - sale.deliveryCost - subtotal

  return (
    <div ref={ref} className="invoice-template">
      <style>{`
        .invoice-template {
          font-family: 'Inter', Arial, sans-serif;
          background: #ffffff;
          color: #1a1a1a;
          padding: 48px 40px;
          max-width: 800px;
          margin: 0 auto;
          font-size: 10pt;
          line-height: 1.5;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eeeeee;
        }

        .company-info h1 {
          font-size: 20pt;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 4px 0;
          letter-spacing: -0.5px;
        }

        .company-info p {
          margin: 2px 0;
          color: #666666;
          font-size: 9pt;
        }

        .invoice-title {
          text-align: right;
        }

        .invoice-title h2 {
          font-size: 18pt;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .invoice-title .invoice-number {
          font-size: 11pt;
          font-weight: 600;
          color: #333333;
          margin-top: 6px;
        }

        .invoice-title .invoice-date {
          font-size: 9pt;
          color: #888888;
          margin-top: 2px;
        }

        .invoice-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 24px;
        }

        .meta-box {
          flex: 1;
        }

        .meta-box h4 {
          font-size: 8pt;
          font-weight: 700;
          color: #888888;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 8px 0;
          padding-bottom: 6px;
          border-bottom: 1px solid #eeeeee;
        }

        .meta-box p {
          margin: 4px 0;
          font-size: 10pt;
        }

        .meta-box strong {
          color: #1a1a1a;
          font-weight: 600;
        }

        .invoice-items {
          margin-bottom: 24px;
        }

        .invoice-items table {
          width: 100%;
          border-collapse: collapse;
        }

        .invoice-items thead tr {
          border-bottom: 1px solid #1a1a1a;
        }

        .invoice-items th {
          padding: 10px 8px;
          text-align: left;
          font-size: 8pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #666666;
        }

        .invoice-items th:nth-child(2),
        .invoice-items th:nth-child(3),
        .invoice-items th:nth-child(4),
        .invoice-items th:nth-child(5) {
          text-align: right;
        }

        .invoice-items th:first-child {
          text-align: left;
        }

        .invoice-items tbody tr {
          border-bottom: 1px solid #eeeeee;
        }

        .invoice-items td {
          padding: 10px 8px;
          font-size: 10pt;
          vertical-align: middle;
          color: #1a1a1a;
        }

        .invoice-items td:nth-child(2),
        .invoice-items td:nth-child(3),
        .invoice-items td:nth-child(4),
        .invoice-items td:nth-child(5) {
          text-align: right;
          font-weight: 500;
        }

        .invoice-items td:first-child {
          text-align: left;
        }

        .product-name {
          font-weight: 600;
          color: #1a1a1a;
        }

        .product-sku {
          font-size: 8pt;
          color: #888888;
          margin-top: 2px;
        }

        .discount-text {
          font-size: 8pt;
          color: #dc2626;
          font-weight: 600;
          margin-left: 6px;
        }

        .original-price {
          text-decoration: line-through;
          color: #888888;
          font-size: 9pt;
        }

        .invoice-totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 24px;
        }

        .totals-box {
          width: 260px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 10pt;
          border-bottom: 1px solid #eeeeee;
        }

        .totals-row.igv-row {
          color: #666666;
          font-size: 9pt;
        }

        .totals-row.total-row {
          border-bottom: none;
          border-top: 2px solid #1a1a1a;
          margin-top: 4px;
          padding-top: 12px;
        }

        .totals-row.total-row span:first-child {
          font-weight: 700;
          font-size: 12pt;
          color: #1a1a1a;
        }

        .totals-row.total-row span:last-child {
          font-weight: 800;
          font-size: 14pt;
          color: #1a1a1a;
        }

        .payment-info {
          margin-bottom: 32px;
          padding: 12px 0;
          border-top: 1px solid #eeeeee;
          border-bottom: 1px solid #eeeeee;
        }

        .payment-row {
          display: flex;
          justify-content: space-between;
          font-size: 10pt;
        }

        .payment-row span:first-child {
          color: #666666;
        }

        .payment-row span:last-child {
          font-weight: 600;
          color: #1a1a1a;
        }

        .invoice-footer {
          margin-top: 40px;
          padding-top: 20px;
          text-align: center;
        }

        .invoice-footer p {
          margin: 3px 0;
          font-size: 9pt;
          color: #888888;
        }

        .invoice-footer .thanks {
          font-size: 11pt;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 6px !important;
        }

        .status-text {
          font-size: 8pt;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-text.paid { color: #166534; }
        .status-text.pending { color: #92400e; }
        .status-text.void { color: #991b1b; }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          .invoice-template, .invoice-template * {
            visibility: visible !important;
          }
          .invoice-template {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
          }
        }
      `}</style>

      <div className="invoice-header">
        <div className="company-info">
          <h1>{sale.location.name}</h1>
          {sale.location.address && <p>{sale.location.address}</p>}
          {sale.location.phone && <p>Telf: {sale.location.phone}</p>}
          {sale.location.email && <p>{sale.location.email}</p>}
          {!sale.location.address && !sale.location.phone && !sale.location.email && (
            <>
              <p>Dirección no registrada</p>
              <p>Sin teléfono</p>
              <p>Sin correo</p>
            </>
          )}
        </div>
        <div className="invoice-title">
          <h2>FACTURA</h2>
          <p className="invoice-number">N° {sale.invoiceNumber}</p>
          <p className="invoice-date">
            {format(new Date(sale.date), "dd 'de' MMMM 'del' yyyy", { locale: es })}
          </p>
          <span className={`status-text ${sale.status === 'PAID' ? 'paid' : sale.status === 'VOID' ? 'void' : 'pending'}`}>
            {sale.status === 'PAID' ? 'Pagada' : sale.status === 'VOID' ? 'Anulada' : 'Pendiente'}
          </span>
        </div>
      </div>

      <div className="invoice-meta">
        <div className="meta-box">
          <h4>Cliente</h4>
          <p><strong>{sale.customer.name}</strong></p>
          <p>{sale.customer.docType}: {sale.customer.docNumber}</p>
        </div>
        <div className="meta-box">
          <h4>Datos de Venta</h4>
          <p><strong>Sede:</strong> {sale.location.name}</p>
          <p><strong>Vendedor:</strong> {sale.user.name}</p>
          <p><strong>Método:</strong> {sale.paymentMethod}</p>
        </div>
      </div>

      <div className="invoice-items">
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>P. Unitario</th>
              <th>Desc.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="product-name">{item.product.name}</div>
                  <div className="product-sku">{item.product.sku} {item.product.brand && `• ${item.product.brand}`}</div>
                </td>
                <td>{item.quantity}</td>
                <td>
                  {item.hasDiscount ? (
                    <span className="original-price">S/ {item.basePrice.toFixed(2)}</span>
                  ) : (
                    <span>S/ {item.unitPrice.toFixed(2)}</span>
                  )}
                </td>
                <td>
                  {item.hasDiscount && (
                    <span className="discount-text">-{item.discountPct.toFixed(0)}%</span>
                  )}
                </td>
                <td>S/ {item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="invoice-totals">
        <div className="totals-box">
          <div className="totals-row">
            <span>Subtotal</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="totals-row igv-row">
            <span>IGV (18%)</span>
            <span>S/ {igv.toFixed(2)}</span>
          </div>
          {sale.isDelivery && (
            <div className="totals-row">
              <span>Delivery</span>
              <span>S/ {sale.deliveryCost.toFixed(2)}</span>
            </div>
          )}
          <div className="totals-row total-row">
            <span>TOTAL</span>
            <span>S/ {sale.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="payment-info">
        <div className="payment-row">
          <span>Método de Pago</span>
          <span>{sale.paymentMethod}</span>
        </div>
      </div>

      <div className="invoice-footer">
        <p className="thanks">¡Gracias por su compra!</p>
        <p>Este documento es una representación impresa de la factura electrónica</p>
        {sale.location.phone && <p>Para consultas: {sale.location.phone}</p>}
        {sale.location.email && <p>{sale.location.email}</p>}
      </div>
    </div>
  )
}

interface TicketTemplateProps {
  sale: Sale
  ref?: React.Ref<HTMLDivElement>
}

export function TicketTemplate({ sale, ref }: TicketTemplateProps) {
  const subtotal = (sale.totalAmount - sale.deliveryCost) / 1.18
  const igv = sale.totalAmount - sale.deliveryCost - subtotal

  return (
    <div ref={ref} className="ticket-template">
      <style>{`
        .ticket-template {
          font-family: 'Inter', Arial, sans-serif;
          background: white;
          color: #1a1a1a;
          padding: 24px 16px;
          max-width: 280px;
          margin: 0 auto;
          font-size: 10pt;
          line-height: 1.3;
        }

        .ticket-header {
          text-align: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #1a1a1a;
        }

        .ticket-header h1 {
          font-size: 16pt;
          font-weight: 800;
          margin: 0 0 4px 0;
          color: #1a1a1a;
        }

        .ticket-header p {
          margin: 2px 0;
          font-size: 8pt;
          color: #666666;
        }

        .ticket-header .ticket-title {
          font-size: 10pt;
          font-weight: 700;
          margin-top: 8px;
          color: #1a1a1a;
        }

        .ticket-info {
          margin-bottom: 12px;
        }

        .ticket-info-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
          font-size: 9pt;
        }

        .ticket-info-row span:first-child {
          color: #666666;
        }

        .ticket-info-row span:last-child {
          font-weight: 600;
          color: #1a1a1a;
        }

        .ticket-items {
          margin-bottom: 12px;
        }

        .ticket-items table {
          width: 100%;
          border-collapse: collapse;
        }

        .ticket-items thead tr {
          border-bottom: 1px solid #1a1a1a;
        }

        .ticket-items th {
          font-size: 7pt;
          font-weight: 700;
          text-transform: uppercase;
          padding: 6px 0;
          text-align: left;
          color: #666666;
        }

        .ticket-items th:last-child {
          text-align: right;
        }

        .ticket-items tbody tr {
          border-bottom: 1px dotted #cccccc;
        }

        .ticket-items td {
          padding: 6px 0;
          font-size: 9pt;
          vertical-align: top;
          color: #1a1a1a;
        }

        .ticket-items td:last-child {
          text-align: right;
          font-weight: 600;
        }

        .item-name {
          font-weight: 600;
        }

        .item-details {
          font-size: 8pt;
          color: #666666;
          margin-top: 2px;
        }

        .ticket-totals {
          margin-bottom: 12px;
          padding-top: 8px;
          border-top: 1px solid #1a1a1a;
        }

        .ticket-totals .row {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
          font-size: 9pt;
        }

        .ticket-totals .row.total-row {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 2px solid #1a1a1a;
        }

        .ticket-totals .row.total-row span:last-child {
          font-size: 12pt;
          font-weight: 800;
        }

        .ticket-footer {
          text-align: center;
          padding-top: 12px;
          border-top: 1px dotted #cccccc;
        }

        .ticket-footer p {
          margin: 3px 0;
          font-size: 8pt;
          color: #666666;
        }

        .ticket-footer .big-thanks {
          font-size: 10pt;
          font-weight: 700;
          color: #1a1a1a;
        }

        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          .ticket-template, .ticket-template * {
            visibility: visible !important;
          }
          .ticket-template {
            position: absolute;
            left: 0;
            top: 0;
            width: 280px;
          }
        }
      `}</style>

      <div className="ticket-header">
        <h1>{sale.location.name}</h1>
        {sale.location.address && <p>{sale.location.address}</p>}
        {sale.location.phone && <p>Telf: {sale.location.phone}</p>}
        {sale.location.email && <p>{sale.location.email}</p>}
        <p className="ticket-title">TICKET DE VENTA</p>
        <p>N° {sale.invoiceNumber}</p>
      </div>

      <div className="ticket-info">
        <div className="ticket-info-row">
          <span>Fecha:</span>
          <span>{format(new Date(sale.date), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
        </div>
        <div className="ticket-info-row">
          <span>Cliente:</span>
          <span>{sale.customer.name}</span>
        </div>
        <div className="ticket-info-row">
          <span>Sede:</span>
          <span>{sale.location.name}</span>
        </div>
        <div className="ticket-info-row">
          <span>Método:</span>
          <span>{sale.paymentMethod}</span>
        </div>
      </div>

      <div className="ticket-items">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="item-name">{item.product.name}</div>
                  <div className="item-details">
                    {item.quantity} x S/ {item.unitPrice.toFixed(2)}
                    {item.hasDiscount && ` (-${item.discountPct.toFixed(0)}%)`}
                  </div>
                </td>
                <td>{item.quantity}</td>
                <td>S/ {item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ticket-totals">
        <div className="row">
          <span>Subtotal:</span>
          <span>S/ {subtotal.toFixed(2)}</span>
        </div>
        <div className="row">
          <span>IGV (18%):</span>
          <span>S/ {igv.toFixed(2)}</span>
        </div>
        {sale.isDelivery && (
          <div className="row">
            <span>Delivery:</span>
            <span>S/ {sale.deliveryCost.toFixed(2)}</span>
          </div>
        )}
        <div className="row total-row">
          <span>TOTAL:</span>
          <span>S/ {sale.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="ticket-footer">
        <p className="big-thanks">¡Gracias por su compra!</p>
        <p>Conserve este ticket para cualquier reclamo</p>
        {sale.location.phone && <p>{sale.location.phone}</p>}
        {sale.location.email && <p>{sale.location.email}</p>}
      </div>
    </div>
  )
}
