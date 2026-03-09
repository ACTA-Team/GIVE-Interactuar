import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { Button } from '@/components/ui/Button'
import type { Credential } from '../../types'
import { CredentialCard } from '../ui/CredentialCard'

interface CredentialsListPageProps {
  credentials: Credential[]
}

// Data is fetched server-side in app/(dashboard)/dashboard/credentials/page.tsx
// TODO: add status filter tabs (all / draft / issued / revoked)
// TODO: add pagination
export function CredentialsListPage({ credentials }: CredentialsListPageProps) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Credenciales</h1>
        <Link href={ROUTES.credentials.new}>
          <Button>Nueva credencial</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {credentials.map((c) => (
          <CredentialCard key={c.id} credential={c} />
        ))}
      </div>

      {credentials.length === 0 && (
        <p className="mt-8 text-center text-sm text-gray-500">
          No hay credenciales todavía.
        </p>
      )}
    </div>
  )
}
