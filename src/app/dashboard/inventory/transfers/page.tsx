import { getLocations, getInventoryWithLocations } from '@/app/actions/location-actions'
import TransfersPageClient from './TransfersPageClient'

export default async function TransfersPage() {
  const [locations, inventory] = await Promise.all([
    getLocations(),
    getInventoryWithLocations()
  ])

  const formattedInventory = inventory.map(inv => ({
    ...inv,
    product: {
      ...inv.product,
    },
    location: {
      ...inv.location,
    }
  }))

  return (
    <TransfersPageClient
      locations={locations}
      inventory={formattedInventory}
    />
  )
}
