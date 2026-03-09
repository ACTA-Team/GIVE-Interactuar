import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/helpers/date'
import type { Credential } from '../../types'

interface CredentialDetailPageProps {
  credential: Credential
}

// TODO: add revoke action button (calls orchestrator.revoke)
// TODO: add on-chain verification status panel
// TODO: add credential relationships section
// TODO: add evidence snapshots section
export function CredentialDetailPage({ credential }: CredentialDetailPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{credential.title}</h1>
          {credential.description && (
            <p className="mt-1 text-sm text-gray-500">{credential.description}</p>
          )}
        </div>
        <Badge label={credential.status} variant={credential.status === 'issued' ? 'success' : 'default'} />
      </div>

      {/* On-chain info */}
      {credential.onchainTxHash && (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Anclaje on-chain</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-gray-500">TX Hash</dt>
              <dd className="break-all font-mono text-xs text-gray-900">
                {credential.onchainTxHash}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Contrato (vc-vault)</dt>
              <dd className="break-all font-mono text-xs text-gray-900">
                {credential.onchainContractId ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">VC ID on-chain</dt>
              <dd className="font-mono text-xs text-gray-900">
                {credential.onchainVcId ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Red</dt>
              <dd className="text-sm capitalize">{credential.onchainNetwork ?? '—'}</dd>
            </div>
          </dl>
        </section>
      )}

      {/* Timestamps */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Fechas</h2>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-500">Creada</dt>
            <dd className="text-sm">{formatDateTime(credential.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Emitida</dt>
            <dd className="text-sm">
              {credential.issuedAt ? formatDateTime(credential.issuedAt) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Expira</dt>
            <dd className="text-sm">
              {credential.expiresAt ? formatDateTime(credential.expiresAt) : '—'}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
