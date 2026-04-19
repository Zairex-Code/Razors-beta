import { getImports } from '@/app/actions/import-actions'
import { getProviders } from '@/app/actions/provider-actions'
import { getProductsForImport } from '@/app/actions/product-actions'
import ImportsPageClient from './ImportsPageClient'

export default async function ImportsPage() {
  const [imports, providers, products] = await Promise.all([
    getImports(),
    getProviders(),
    getProductsForImport()
  ])

  const formattedImports = imports.map(imp => ({
    ...imp,
    eta: imp.eta?.toISOString() ?? null,
    createdAt: imp.createdAt.toISOString(),
  }))

  return <ImportsPageClient initialImports={formattedImports} providers={providers} products={products} />
}