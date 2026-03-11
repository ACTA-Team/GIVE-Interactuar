import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/helpers/date';
import type { CredentialVerificationStatus } from '../../types';

interface VerificationResultProps {
  status: CredentialVerificationStatus;
}

export function VerificationResult({ status }: VerificationResultProps) {
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-8 text-center shadow-sm">
      <div className="mb-4 flex justify-center">
        <Badge
          variant={status.isValid ? 'success' : 'danger'}
          className="text-base px-4 py-1"
        >
          {status.isValid ? 'Credencial válida' : 'Credencial inválida'}
        </Badge>
      </div>

      {status.title && (
        <h2 className="mt-2 text-xl font-semibold text-gray-900">
          {status.title}
        </h2>
      )}

      {status.issuedAt && (
        <p className="mt-1 text-sm text-gray-500">
          Emitida el {formatDateTime(status.issuedAt)}
        </p>
      )}

      {Object.keys(status.publicClaims).length > 0 && (
        <div className="mt-6 text-left">
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Datos públicos
          </h3>
          <dl className="space-y-1">
            {Object.entries(status.publicClaims).map(([key, value]) => (
              <div key={key} className="flex gap-2 text-sm">
                <dt className="text-gray-500">{key}:</dt>
                <dd className="text-gray-900">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400">
        Verificado el {formatDateTime(status.checkedAt)}
      </p>

      {/* TODO: show on-chain anchor info if onchainVerified is not null */}
    </div>
  );
}
