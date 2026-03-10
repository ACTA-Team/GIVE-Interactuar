export type CredentialStatus =
  | 'draft'
  | 'issued'
  | 'revoked'
  | 'expired'
  | 'pending_endorsement';
export type CredentialType = 'impact' | 'verification' | 'endorsement';
export type RelationshipType =
  | 'endorses'
  | 'verifies'
  | 'references'
  | 'supersedes';

export interface Credential {
  id: string;
  organizationId: string;
  entrepreneurId: string;
  templateId: string | null;
  sourceDraftId: string | null;
  sourceSnapshotId: string | null;
  credentialType: CredentialType;
  status: CredentialStatus;
  title: string;
  description: string | null;
  publicId: string;

  issuedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;

  issuerDid: string | null;

  // TODO: populate with ACTA SDK response once integration is ready
  actaVcId: string | null;

  metadata: Record<string, unknown>;
  publicClaims: Record<string, unknown>;

  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IssuanceDraft {
  id: string;
  organizationId: string;
  entrepreneurId: string;
  templateId: string | null;
  latestSnapshotId: string | null;
  preparedPayload: Record<string, unknown>;
  status: 'draft' | 'ready' | 'archived';
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialTemplate {
  id: string;
  organizationId: string;
  name: string;
  credentialType: CredentialType;
  schemaVersion: string;
  templateDefinition: Record<string, unknown>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
