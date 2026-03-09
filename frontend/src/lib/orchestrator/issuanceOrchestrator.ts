// Coordinates the full credential issuance flow:
// Supabase (draft + persistence) → VC payload → Soroban (anchor on-chain) → Supabase (update with tx hash)
//
// TODO: inject CredentialService, StellarService, VcVaultService via constructor
// TODO: connect to repositories and services once implemented in features/

export interface IssuanceDraft {
  entrepreneurId: string
  credentialType: string
  issuedAt: Date
  metadata: Record<string, unknown>
}

export interface IssuanceResult {
  credentialId: string
  transactionHash: string
  vaultAddress: string
}

export class IssuanceOrchestrator {
  // TODO: add constructor params:
  // private readonly credentialService: CredentialService
  // private readonly vcVaultService: VcVaultService
  constructor() {}

  async issue(_draft: IssuanceDraft): Promise<IssuanceResult> {
    // TODO:
    // 1. Validate draft via CredentialService
    // 2. Build W3C VC payload
    // 3. Persist draft in Supabase (credentialRepository.create)
    // 4. Anchor VC hash on Soroban via vcVaultService.store()
    // 5. Update credential record with tx hash + vault address
    // 6. Return IssuanceResult
    throw new Error('Not implemented')
  }

  async revoke(_credentialId: string): Promise<void> {
    // TODO:
    // 1. Fetch credential from Supabase
    // 2. Call vcVaultService.revoke() with vault address
    // 3. Update credential status to 'revoked' in Supabase
    throw new Error('Not implemented')
  }
}
