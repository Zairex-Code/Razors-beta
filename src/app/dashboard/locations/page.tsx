import { getLocations } from '@/app/actions/location-actions'
import LocationsPageClient from './LocationsPageClient'

export default async function LocationsPage() {
  const locations = await getLocations()

  return <LocationsPageClient initialLocations={locations} />
}
