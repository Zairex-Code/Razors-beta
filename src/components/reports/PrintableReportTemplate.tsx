'use client'

import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReportData {
  totalRevenue: number
  totalExpenses: number
  totalImportsCost: number
  netProfit: number
  stockValue: number
  lowStockCount: number
  outOfStockCount: number
  revenueByMonth: Array<{ date: string; revenue: number; expenses: number; profit: number }>
  topProducts: Array<{ name: string; quantity: number }>
  bottomProducts: Array<{ name: string; quantity: number }>
  stockByCategory: Array<{ category: string; value: number }>
  lowStockItems: Array<{ name: string; sku: string; stock: number; location: string }>
}

interface PrintableReportTemplateProps {
  data: ReportData
  ref?: React.Ref<HTMLDivElement>
}

export function PrintableReportTemplate({ data, ref }: PrintableReportTemplateProps) {
  const today = format(new Date(), "dd 'de' MMMM 'del' yyyy", { locale: es })

  return (
    <div ref={ref} className="printable-report">
      <style>{`
        .printable-report {
          font-family: 'Inter', Arial, sans-serif;
          background: #ffffff;
          color: #1a1a1a;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          font-size: 10pt;
          line-height: 1.5;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #1a1a1a;
        }

        .company-info h1 {
          font-size: 18pt;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 4px 0;
        }

        .company-info p {
          margin: 2px 0;
          font-size: 9pt;
          color: #666666;
        }

        .report-title {
          text-align: right;
        }

        .report-title h2 {
          font-size: 14pt;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .report-title .date {
          font-size: 9pt;
          color: #888888;
          margin-top: 4px;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .kpi-card {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
        }

        .kpi-card h4 {
          font-size: 7pt;
          font-weight: 600;
          color: #666666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 6px 0;
        }

        .kpi-card .value {
          font-size: 14pt;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .kpi-card .subtitle {
          font-size: 7pt;
          color: #888888;
          margin-top: 2px;
        }

        .kpi-card.positive .value { color: #166534; }
        .kpi-card.negative .value { color: #991b1b; }

        .section {
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 10pt;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 10px 0;
          padding-bottom: 6px;
          border-bottom: 1px solid #eeeeee;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 8px 10px;
          font-size: 7pt;
          font-weight: 700;
          color: #666666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .data-table th:nth-child(n+2),
        .data-table td:nth-child(n+2) {
          text-align: right;
        }

        .data-table td {
          padding: 8px 10px;
          font-size: 9pt;
          border-bottom: 1px solid #eeeeee;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table .total-row {
          font-weight: 700;
          background: #f9fafb;
        }

        .data-table .profit-positive { color: #166534; }
        .data-table .profit-negative { color: #991b1b; }

        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .stock-alert {
          padding: 6px 10px;
          border-radius: 4px;
          margin-bottom: 6px;
          font-size: 8pt;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stock-alert.critical {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .stock-alert.warning {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
        }

        .footer {
          margin-top: 30px;
          padding-top: 16px;
          border-top: 1px solid #eeeeee;
          text-align: center;
        }

        .footer p {
          margin: 2px 0;
          font-size: 8pt;
          color: #888888;
        }

        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden !important;
          }
          .printable-report, .printable-report * {
            visibility: visible !important;
          }
          .printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
          }
        }
      `}</style>

      <div className="report-header">
        <div className="company-info">
          <h1>RAZOR CRM</h1>
          <p>RUC: 20601234567</p>
          <p>Av. Javier Prado 2150, Lima</p>
          <p>Telf: (01) 345-6789</p>
        </div>
        <div className="report-title">
          <h2>Reporte Financiero y de Análisis</h2>
          <p className="date">Generado: {today}</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card positive">
          <h4>Ingresos Totales</h4>
          <p className="value">S/ {data.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          <p className="subtitle">Ventas acumuladas</p>
        </div>
        <div className="kpi-card negative">
          <h4>Gastos Operativos</h4>
          <p className="value">S/ {data.totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          <p className="subtitle">Operación del mes</p>
        </div>
        <div className="kpi-card">
          <h4>Costo Importaciones</h4>
          <p className="value">S/ {data.totalImportsCost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          <p className="subtitle">Inversiones en inventario</p>
        </div>
        <div className={`kpi-card ${data.netProfit >= 0 ? 'positive' : 'negative'}`}>
          <h4>Ganancia Neta</h4>
          <p className="value">S/ {Math.abs(data.netProfit).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          <p className="subtitle">{data.netProfit >= 0 ? 'Después de importaciones' : 'Pérdida neta'}</p>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Rentabilidad por Mes</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Ingresos</th>
              <th>Gastos</th>
              <th>Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {data.revenueByMonth.map((item, idx) => (
              <tr key={idx}>
                <td>{item.date}</td>
                <td>S/ {item.revenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                <td>S/ {item.expenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                <td className={item.profit >= 0 ? 'profit-positive' : 'profit-negative'}>
                  S/ {Math.abs(item.profit).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td>TOTAL</td>
              <td>S/ {data.revenueByMonth.reduce((sum, i) => sum + i.revenue, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
              <td>S/ {data.revenueByMonth.reduce((sum, i) => sum + i.expenses, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
              <td className={data.revenueByMonth.reduce((sum, i) => sum + i.profit, 0) >= 0 ? 'profit-positive' : 'profit-negative'}>
                S/ {Math.abs(data.revenueByMonth.reduce((sum, i) => sum + i.profit, 0)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="two-column">
        <div className="section">
          <h3 className="section-title">Top 5 Productos Más Vendidos</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Unidades</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.slice(0, 5).map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="section">
          <h3 className="section-title">Valorización de Stock por Categoría</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Valor (S/)</th>
              </tr>
            </thead>
            <tbody>
              {data.stockByCategory.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.category}</td>
                  <td>S/ {item.value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>TOTAL</td>
                <td>S/ {data.stockByCategory.reduce((sum, i) => sum + i.value, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {(data.lowStockCount > 0 || data.outOfStockCount > 0) && (
        <div className="section">
          <h3 className="section-title">Alertas de Stock</h3>
          {data.lowStockItems.slice(0, 10).map((item, idx) => (
            <div key={idx} className={`stock-alert ${item.stock === 0 ? 'critical' : 'warning'}`}>
              <span>
                <strong>{item.name}</strong> ({item.sku})
                <span style={{ marginLeft: 8, color: '#888' }}>{item.location}</span>
              </span>
              <span>
                {item.stock === 0 ? 'AGOTADO' : `Stock: ${item.stock}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="footer">
        <p>Reporte generado el {today}</p>
        <p>Razors CRM - Sistema de Gestión Comercial</p>
        <p>Este documento es confidencial y para uso interno de la empresa.</p>
      </div>
    </div>
  )
}
