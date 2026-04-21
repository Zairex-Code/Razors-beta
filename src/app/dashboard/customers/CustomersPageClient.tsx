'use client'

import { useState, useTransition } from 'react'
import { Users, Plus } from 'lucide-react'
import Swal from 'sweetalert2'
import { CustomersTable } from '@/components/customers/customers-table'
import { CustomerModal } from '@/components/ui/customer-modal'
import { Button } from '@/components/ui/button'
import { deleteCustomer } from '@/app/actions/customer-actions'

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
  items: SaleItem[]
  location: {
    id: string
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
  }
  customer: {
    id: string
    name: string
    docType: string
    docNumber: string
  }
  user: {
    id: string
    name: string
  }
}

interface Customer {
  id: string
  docType: string
  docNumber: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  totalPurchases: number
  sales: Sale[]
}

interface CustomersPageClientProps {
  initialCustomers: Customer[]
}

export default function CustomersPageClient({ initialCustomers }: CustomersPageClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCustomerCreated = (customer: {
    id: string
    docType: string
    docNumber: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
  }) => {
    const extendedCustomer: Customer = {
      ...customer,
      totalPurchases: 0,
      sales: []
    }
    setIsAddModalOpen(false)
    setCustomers(prev => [extendedCustomer, ...prev])
    Swal.fire({
      title: 'Creado',
      text: `Cliente ${customer.name} agregado exitosamente.`,
      icon: 'success',
      background: '#0a0a0a',
      color: '#ffffff',
      confirmButtonColor: '#00f7ff',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
    })
  }

  const handleCustomerUpdated = (updated: {
    id: string
    docType: string
    docNumber: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
  }) => {
    setEditModalOpen(false)
    setCustomerToEdit(null)
    setCustomers(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated, totalPurchases: c.totalPurchases, sales: c.sales } : c))
    Swal.fire({
      title: 'Actualizado',
      text: `Cliente ${updated.name} actualizado exitosamente.`,
      icon: 'success',
      background: '#0a0a0a',
      color: '#ffffff',
      confirmButtonColor: '#00f7ff',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
    })
  }

  const handleDeleteCustomer = (customerId: string) => {
    startTransition(async () => {
      try {
        const result = await deleteCustomer(customerId)
        const customer = customers.find(c => c.id === customerId)
        setCustomers(prev => prev.filter(c => c.id !== customerId))
        Swal.fire({
          title: result.softDeleted ? 'Desactivado' : 'Eliminado',
          text: result.softDeleted
            ? `${customer?.name} tenía ventas asociadas y fue desactivado.`
            : `${customer?.name} ha sido eliminado.`,
          icon: 'success',
          background: '#0a0a0a',
          color: '#ffffff',
          confirmButtonColor: '#00f7ff',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
        })
      } catch (error) {
        console.error('Error deleting customer:', error)
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el cliente.',
          icon: 'error',
          background: '#0a0a0a',
          color: '#ffffff',
          confirmButtonColor: '#00f7ff',
        })
      }
    })
  }

  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer)
    setEditModalOpen(true)
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

      <CustomersTable
        customers={customers}
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
      />

      <CustomerModal
        isOpen={isAddModalOpen}
        mode="create"
        onClose={() => setIsAddModalOpen(false)}
        onCreated={handleCustomerCreated}
        onUpdated={() => {}}
      />

      <CustomerModal
        isOpen={editModalOpen}
        mode="edit"
        customer={customerToEdit || undefined}
        onClose={() => {
          setEditModalOpen(false)
          setCustomerToEdit(null)
        }}
        onCreated={() => {}}
        onUpdated={handleCustomerUpdated}
      />
    </div>
  )
}