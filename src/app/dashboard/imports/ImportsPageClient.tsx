'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { Ship, Plus } from 'lucide-react'
import { ImportsTable } from '@/components/imports/imports-table'
import { ImportWizard } from '@/components/imports/import-wizard'
import { Button } from '@/components/ui/button'
import { updateImportStatus } from '@/app/actions/import-actions'
import type { ImportStatus } from '@prisma/client'

interface Import {
  id: string
  provider: string
  piNumber: string
  eta: string | null
  exchangeRate: number
  status: 'PLANNING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED'
  createdAt: Date | string
  items: Array<{
    id: string
    quantity: number
    unitPriceUsd: number
    product: {
      id: string
      name: string
      sku: string
    }
  }>
  costs: Array<{
    id: string
    category: string
    description: string
    amount: number
    currency: string
    exchangeRate: number | null
    voucherUrl: string | null
  }>
  documents: Array<{
    id: string
    type: string
    url: string
  }>
}

interface ImportsPageClientProps {
  initialImports: Import[]
  providers: string[]
  products: Array<{
    id: string
    name: string
    sku: string
    brand?: string
    model?: string
    category: string
  }>
  productOptions?: {
    brands: string[]
    categories: string[]
  }
}

export default function ImportsPageClient({ initialImports, providers, products, productOptions }: ImportsPageClientProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [optimisticImports, setOptimisticImports] = useOptimistic(
    initialImports,
    (state: Import[], { importId, newStatus }: { importId: string, newStatus: ImportStatus }) =>
      state.map(imp =>
        imp.id === importId ? { ...imp, status: newStatus } : imp
      )
  )

  const handleStatusChange = async (importId: string, newStatus: ImportStatus) => {
    setOptimisticImports({ importId, newStatus })

    startTransition(async () => {
      await updateImportStatus(importId, newStatus)
    })
  }

  const handleWizardComplete = () => {
    setIsWizardOpen(false)
    window.location.reload()
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Ship size={24} className="text-primary" />
            </div>
            Importaciones
          </h1>
          <p className="text-muted-foreground mt-1">Gestiona tus importaciones internacionales y costos de envío.</p>
        </div>

        <Button
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-tight neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={18} />
          Nueva Importación
        </Button>
      </div>

      <ImportsTable imports={optimisticImports} onStatusChange={handleStatusChange} isProcessing={isPending} />

      {isWizardOpen && (
        <ImportWizard
          onClose={() => setIsWizardOpen(false)}
          onComplete={handleWizardComplete}
          providers={providers}
          products={products}
          productOptions={productOptions}
        />
      )}
    </div>
  )
}