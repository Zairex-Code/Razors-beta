import { getProducts } from '@/app/actions/product-actions'
import { getLocations } from '@/app/actions/location-actions'
import { getProductOptions } from '@/app/actions/product-actions'
import { InventoryTable } from '@/components/inventory/inventory-table'
import Link from 'next/link'
import { ArrowLeftRight } from 'lucide-react'

export default async function InventoryPage() {
  const [products, locations, productOptions] = await Promise.all([
    getProducts(),
    getLocations(),
    getProductOptions()
  ])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Inventario</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestión de productos y stock multialmacén
          </p>
        </div>
        <Link
          href="/dashboard/inventory/transfers"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/30 font-medium text-sm hover:bg-primary/20 transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Transferencias
        </Link>
      </div>

      <InventoryTable products={products} locations={locations} productOptions={productOptions} />
    </div>
  )
}