import { getImports } from '@/app/actions/import-actions'
import ImportsPageClient from './ImportsPageClient'

export default async function ImportsPage() {
  const imports = await getImports()

  const formattedImports = imports.map(imp => ({
    ...imp,
    eta: imp.eta?.toISOString() ?? null,
    createdAt: imp.createdAt.toISOString(),
  }))

  return <ImportsPageClient initialImports={formattedImports} />
}