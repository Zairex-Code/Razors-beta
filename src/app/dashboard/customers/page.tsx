import { getCustomers } from '@/app/actions/customer-actions'
import CustomersPageClient from './CustomersPageClient'

export default async function CustomersPage() {
  const customers = await getCustomers()

  const formattedCustomers = customers.map(customer => ({
    id: customer.id,
    docType: customer.docType,
    docNumber: customer.docNumber,
    name: customer.name,
    email: customer.email,
    totalPurchases: customer.sales
      .filter(sale => sale.status === 'PAID')
      .reduce((acc, sale) => acc + sale.totalAmount, 0),
    sales: customer.sales.map(sale => ({
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      date: sale.date instanceof Date ? sale.date.toISOString() : sale.date,
      status: sale.status,
      totalAmount: sale.totalAmount,
      items: [],
      location: sale.location
    }))
  }))

  return <CustomersPageClient initialCustomers={formattedCustomers} />
}