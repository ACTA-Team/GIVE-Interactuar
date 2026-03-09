'use client'

import { useQuery } from '@tanstack/react-query'
import type { CredentialVerificationStatus } from '../types'

// Calls the public API route — no Supabase client needed on the browser for verification
// TODO: implement GET /api/verify/[credentialId] route handler
export function useVerification(credentialPublicId: string) {
  return useQuery<CredentialVerificationStatus>({
    queryKey: ['verification', credentialPublicId],
    queryFn: async () => {
      const res = await fetch(`/api/verify/${credentialPublicId}`)
      if (!res.ok) throw new Error('Verification request failed')
      return res.json() as Promise<CredentialVerificationStatus>
    },
    enabled: Boolean(credentialPublicId),
    staleTime: 30_000, // 30s — verifications are somewhat cacheable
  })
}
