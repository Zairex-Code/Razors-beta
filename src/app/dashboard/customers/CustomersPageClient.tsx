'use client'

import { useState } from 'react'
import { Users, Plus } from 'lucide-react'
import { CustomersTable } from '@/components/customers/customers-table'
import { AddCustomerModal } from '@/components/customers/add-customer-modal'
import { Button } from '@/components/ui/button'

interface Customer {
  id: string
  docType: string
  docNumber: string
  name: string
  email: string | null
  totalPurchases: number
  sales: Array<{
    id: string
    invoiceNumber: string
    date: Date | string
    status: 'PAID' | 'PENDING' | 'VOID'
    totalAmount: number
    items: Array<{
      id: string
      quantity: number
      unitPrice: number
      subtotal: number
      product: {
        id: string
        name: string
        sku: string
      }
    }>
    location: {
      id: string
      name: string
    }
  }>
}

interface CustomersPageClientProps {
  initialCustomers: Customer[]
}

export default function CustomersPageClient({ initialCustomers }: CustomersPageClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleCustomerCreated = () => {
    setIsAddModalOpen(false)
    window.location.reload()
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users size={24} className="text-primary" />
            </div>
            Clientes
          </h1>
          <p className="text-muted-foreground mt-1">Gestiona tu base de datos de clientes B2B.</p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={18} />
          Agregar Cliente
        </Button>
      </div>

      <CustomersTable customers={customers} />

      {isAddModalOpen && (
        <AddCustomerModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleCustomerCreated}
        />
      )}
    </div>
  )
}