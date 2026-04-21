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
    phone: customer.phone,
    address: customer.address,
    totalPurchases: customer.sales
      .filter(sale => sale.status === 'PAID')
      .reduce((acc, sale) => acc + sale.totalAmount, 0),
    sales: customer.sales.map(sale => ({
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      date: sale.date instanceof Date ? sale.date.toISOString() : sale.date,
      status: sale.status,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      isDelivery: sale.isDelivery,
      deliveryCost: sale.deliveryCost,
      items: [],
      location: {
        ...sale.location,
        address: null,
        phone: null,
        email: null
      },
      customer: {
        id: customer.id,
        name: customer.name,
        docType: customer.docType,
        docNumber: customer.docNumber
      },
      user: {
        id: '',
        name: 'Vendedor'
      }
    }))
  }))

  return <CustomersPageClient initialCustomers={formattedCustomers} />
}