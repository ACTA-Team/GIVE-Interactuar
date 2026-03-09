import type { CredentialVerificationStatus } from '../../types'
import { VerificationResult } from '../ui/VerificationResult'

interface VerificationPageProps {
  status: CredentialVerificationStatus
}

// Data is fetched server-side in app/verify/[credentialId]/page.tsx
// so this page is SEO-friendly and shareable
export function VerificationPage({ status }: VerificationPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm text-gray-500">GIVE Interactuar — Portal de verificación</p>
        </div>
        <VerificationResult status={status} />
      </div>
    </div>
  )
}
