export type CredentialStatus = 'draft' | 'issued' | 'revoked' | 'expired' | 'pending_endorsement'
export type CredentialType = 'impact' | 'verification' | 'endorsement'
export type RelationshipType = 'endorses' | 'verifies' | 'references' | 'supersedes'
export type StellarNetwork = 'testnet' | 'mainnet' | 'futurenet'

export interface Credential {
  id: string
  organizationId: string
  entrepreneurId: string
  templateId: string | null
  sourceDraftId: string | null
  sourceSnapshotId: string | null
  credentialType: CredentialType
  status: CredentialStatus
  title: string
  description: string | null
  publicId: string

  issuedAt: string | null
  expiresAt: string | null
  revokedAt: string | null

  issuerStellarAddress: string | null
  issuerDid: string | null

  subjectWalletId: string | null
  sponsorVaultId: string | null

  onchainVcId: string | null
  onchainOwnerAddress: string | null
  onchainContractId: string | null
  onchainIssuanceContract: string | null
  onchainTxHash: string | null
  onchainLedgerSequence: number | null
  onchainNetwork: StellarNetwork | null

  metadata: Record<string, unknown>
  publicClaims: Record<string, unknown>
  privateClaims: Record<string, unknown>

  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface IssuanceDraft {
  id: string
  organizationId: string
  entrepreneurId: string
  templateId: string | null
  latestSnapshotId: string | null
  subjectWalletId: string | null
  sponsorVaultId: string | null
  preparedPayload: Record<string, unknown>
  status: 'draft' | 'ready' | 'archived'
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface CredentialTemplate {
  id: string
  organizationId: string
  name: string
  credentialType: CredentialType
  schemaVersion: string
  templateDefinition: Record<string, unknown>
  active: boolean
  createdAt: string
  updatedAt: string
}
