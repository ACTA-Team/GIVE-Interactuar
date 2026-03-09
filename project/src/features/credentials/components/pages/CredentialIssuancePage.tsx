'use client'

import { IssuanceForm } from '../ui/IssuanceForm'
import { useIssuanceDraft } from '../../hooks/useIssuanceDraft'
import type { IssuanceDraftInput } from '../../schemas'

interface CredentialIssuancePageProps {
  organizationId: string
  userId: string
}

// TODO: redirect to draft detail page after successful creation
// TODO: wire IssuanceOrchestrator.issue() call for the final "emit" step
export function CredentialIssuancePage({ organizationId, userId }: CredentialIssuancePageProps) {
  const { mutateAsync, isPending } = useIssuanceDraft({
    organizationId,
    createdBy: userId,
  })

  async function handleSubmit(data: IssuanceDraftInput) {
    // TODO: navigate to draft review step
    await mutateAsync(data)
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Nueva credencial</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <IssuanceForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  )
}
