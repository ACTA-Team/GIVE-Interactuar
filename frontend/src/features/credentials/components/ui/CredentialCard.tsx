import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/helpers/date'
import type { Credential } from '../../types'

const statusVariant: Record<Credential['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  draft: 'default',
  issued: 'success',
  revoked: 'danger',
  expired: 'warning',
  pending_endorsement: 'info',
}

const statusLabel: Record<Credential['status'], string> = {
  draft: 'Borrador',
  issued: 'Emitida',
  revoked: 'Revocada',
  expired: 'Expirada',
  pending_endorsement: 'Pendiente',
}

interface CredentialCardProps {
  credential: Credential
  onClick?: (id: string) => void
}

export function CredentialCard({ credential, onClick }: CredentialCardProps) {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onClick?.(credential.id)}
      role={onClick ? 'button' : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-gray-900">{credential.title}</p>
        <Badge label={statusLabel[credential.status]} variant={statusVariant[credential.status]} />
      </div>
      <p className="mt-1 text-xs text-gray-500 capitalize">{credential.credentialType}</p>
      {credential.issuedAt && (
        <p className="mt-2 text-xs text-gray-400">
          Emitida el {formatDate(credential.issuedAt)}
        </p>
      )}
      {/* TODO: show onchain anchor indicator if onchainTxHash is present */}
    </div>
  )
}
