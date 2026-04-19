import { getProducts } from '@/app/actions/product-actions'
import { InventoryTable } from '@/components/inventory/inventory-table'

export default async function InventoryPage() {
  const products = await getProducts()

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Inventario</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestión de productos y stock multialmacén
        </p>
      </div>

      <InventoryTable products={products} />
    </div>
  )
}