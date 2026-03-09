import { Badge } from '@/components/ui/Badge'
import type { SponsorVault } from '../../types'

interface VaultCardProps {
  vault: SponsorVault
}

export function VaultCard({ vault }: VaultCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 capitalize">{vault.vaultRole}</p>
        <div className="flex gap-1">
          <Badge
            label={vault.active ? 'Activo' : 'Inactivo'}
            variant={vault.active ? 'success' : 'default'}
          />
          {vault.vaultRevoked && <Badge label="Revocado" variant="danger" />}
        </div>
      </div>

      {vault.vaultContractId && (
        <p className="mt-2 font-mono text-xs text-gray-500 truncate">
          {vault.vaultContractId}
        </p>
      )}
      {vault.vaultDidUri && (
        <p className="mt-1 text-xs text-gray-400 truncate">{vault.vaultDidUri}</p>
      )}
      <p className="mt-2 text-xs text-gray-400 capitalize">{vault.network}</p>

      {/* TODO: add "Deploy vault" button if vaultContractId is null */}
    </div>
  )
}
