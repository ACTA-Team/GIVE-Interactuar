export type VerificationResult = 'success' | 'failed'

export interface VerificationRecord {
  id: string
  credentialId: string
  verifierType: string | null
  verifierIdentifier: string | null
  verificationResult: VerificationResult
  checkedAt: string
  metadata: Record<string, unknown>
}

export interface CredentialVerificationStatus {
  credentialPublicId: string
  onchainVerified: boolean | null   // result from verify_vc() on Soroban
  dbStatus: string                  // status from Supabase (issued / revoked / etc.)
  isValid: boolean
  checkedAt: string
  // The credential public claims shown on the verification portal
  publicClaims: Record<string, unknown>
  title: string
  issuedAt: string | null
}
