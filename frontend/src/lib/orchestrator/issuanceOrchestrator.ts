// Coordinates the credential issuance flow:
// Supabase (persist draft) → ACTA SDK (issue VC) → Supabase (update with result)
//
// TODO: inject CredentialService via constructor once implemented

export interface IssuanceDraft {
  entrepreneurId: string;
  credentialType: string;
  title: string;
  description?: string;
  operatorNote?: string;
  issuedAt: Date;
}

export interface IssuanceResult {
  credentialId: string;
  // TODO: replace with actual ACTA SDK response fields
  actaVcId: string | null;
}

export class IssuanceOrchestrator {
  constructor() {}

  async issue(_draft: IssuanceDraft): Promise<IssuanceResult> {
    // TODO:
    // 1. Validate and persist draft in Supabase
    // 2. Call ACTA SDK to issue the verifiable credential:
    //    actaClient.issue({
    //      subject: entrepreneur.documentNumber,
    //      claims: {
    //        credentialType: draft.credentialType,
    //        title: draft.title,
    //        description: draft.description,
    //      },
    //      issuer: organization.did,
    //    })
    // 3. Update credential record with ACTA VC ID
    // 4. Return IssuanceResult
    throw new Error('Not implemented');
  }

  async revoke(_credentialId: string): Promise<void> {
    // TODO:
    // 1. Fetch credential from Supabase
    // 2. Call actaClient.revoke() with the VC ID
    // 3. Update credential status to 'revoked' in Supabase
    throw new Error('Not implemented');
  }
}
