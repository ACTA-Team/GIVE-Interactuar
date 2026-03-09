import type { Entrepreneur } from '../../types';
import { formatDate } from '@/lib/helpers/date';

interface EntrepreneurDetailPageProps {
  entrepreneur: Entrepreneur;
}

// Data is fetched server-side in app/(dashboard)/dashboard/entrepreneurs/[id]/page.tsx
// TODO: render BusinessProfile section
// TODO: render latest snapshot data
// TODO: render associated credentials list
// TODO: render wallet + vault info
export function EntrepreneurDetailPage({
  entrepreneur,
}: EntrepreneurDetailPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {entrepreneur.fullName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Registrado el {formatDate(entrepreneur.createdAt)}
        </p>
      </div>

      {/* Personal info */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          Información personal
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Documento</dt>
            <dd className="text-sm text-gray-900">
              {entrepreneur.documentType} {entrepreneur.documentNumber}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Email</dt>
            <dd className="text-sm text-gray-900">
              {entrepreneur.email ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Teléfono</dt>
            <dd className="text-sm text-gray-900">
              {entrepreneur.phone ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Municipio</dt>
            <dd className="text-sm text-gray-900">
              {entrepreneur.municipality ?? '—'}
              {entrepreneur.department ? `, ${entrepreneur.department}` : ''}
            </dd>
          </div>
        </dl>
      </section>

      {/* TODO: BusinessProfile section */}
      {/* TODO: Credentials section */}
      {/* TODO: Wallets section */}
    </div>
  );
}
