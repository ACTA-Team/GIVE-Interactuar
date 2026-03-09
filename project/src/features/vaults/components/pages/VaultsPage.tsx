import type { SponsorVault } from '../../types'
import { VaultCard } from '../ui/VaultCard'

interface VaultsPageProps {
  vaults: SponsorVault[]
}

// TODO: add "Deploy new vault" action
// TODO: filter by network and active status
export function VaultsPage({ vaults }: VaultsPageProps) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Vaults</h1>
        {/* TODO: DeployVaultButton */}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vaults.map((v) => (
          <VaultCard key={v.id} vault={v} />
        ))}
      </div>

      {vaults.length === 0 && (
        <p className="mt-8 text-center text-sm text-gray-500">No hay vaults registrados.</p>
      )}
    </div>
  )
}
