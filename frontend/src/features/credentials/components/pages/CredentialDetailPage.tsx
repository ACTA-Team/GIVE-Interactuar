import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/helpers/date';
import type { Credential } from '../../types';

interface CredentialDetailPageProps {
  credential: Credential;
}

// TODO: add revoke action button (calls orchestrator.revoke)
// TODO: add credential relationships section
// TODO: add evidence snapshots section
export function CredentialDetailPage({
  credential,
}: CredentialDetailPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {credential.title}
          </h1>
          {credential.description && (
            <p className="mt-1 text-sm text-gray-500">
              {credential.description}
            </p>
          )}
        </div>
        <Badge
          label={credential.status}
          variant={credential.status === 'issued' ? 'success' : 'default'}
        />
      </div>

      {/* ACTA VC info */}
      {credential.actaVcId && (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Credencial ACTA
          </h2>
          <dl>
            <dt className="text-xs text-gray-500">VC ID</dt>
            <dd className="font-mono text-xs text-gray-900">
              {credential.actaVcId}
            </dd>
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
              {credential.expiresAt
                ? formatDateTime(credential.expiresAt)
                : '—'}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
