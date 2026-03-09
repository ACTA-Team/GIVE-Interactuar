import { Badge } from '@/components/ui/Badge'
import type { StellarWallet } from '../../types'

interface WalletCardProps {
  wallet: StellarWallet
}

export function WalletCard({ wallet }: WalletCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs text-gray-700 truncate">{wallet.publicKey}</p>
        <div className="flex gap-1 shrink-0">
          {wallet.isPrimary && <Badge label="Principal" variant="info" />}
          {wallet.isVerified && <Badge label="Verificada" variant="success" />}
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-400 capitalize">{wallet.network}</p>
      {wallet.federationAddress && (
        <p className="mt-1 text-xs text-gray-500">{wallet.federationAddress}</p>
      )}
      {/* TODO: add "Set as primary" and "Verify" action buttons */}
    </div>
  )
}
