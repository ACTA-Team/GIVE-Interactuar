import type { CredentialType } from '@/features/credentials/types';
import { CREDENTIAL_TYPE_LABELS } from '@/features/credentials/types';

export interface IssuanceDraft {
  entrepreneurId: string;
  credentialType: CredentialType;
  title: string;
  description?: string;
  operatorNote?: string;
  issuedAt: Date;
}

export interface IssuanceResult {
  credentialId: string;
  actaVcId: string | null;
  issuerDid: string | null;
}

export function buildIssuanceDraft(
  entrepreneurId: string,
  credentialType: CredentialType,
): IssuanceDraft {
  return {
    entrepreneurId,
    credentialType,
    title: CREDENTIAL_TYPE_LABELS[credentialType],
    issuedAt: new Date(),
  };
}
