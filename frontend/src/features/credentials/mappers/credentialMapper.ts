import type { Credential, IssuanceDraft, CredentialTemplate } from '../types';

type RawRow = Record<string, unknown>;

export function mapCredential(row: RawRow): Credential {
  return {
    id: row.id as string,
    entrepreneurId: row.entrepreneur_id as string,
    templateId: (row.template_id as string) ?? null,
    sourceDraftId: (row.source_draft_id as string) ?? null,
    sourceSnapshotId: (row.source_snapshot_id as string) ?? null,
    credentialType: row.credential_type as Credential['credentialType'],
    status: row.status as Credential['status'],
    title: row.title as string,
    description: (row.description as string) ?? null,
    publicId: row.public_id as string,
    issuedAt: (row.issued_at as string) ?? null,
    expiresAt: (row.expires_at as string) ?? null,
    revokedAt: (row.revoked_at as string) ?? null,
    issuerDid: (row.issuer_did as string) ?? null,
    actaVcId: (row.acta_vc_id as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    publicClaims: (row.public_claims as Record<string, unknown>) ?? {},
    createdBy: (row.created_by as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapIssuanceDraft(row: RawRow): IssuanceDraft {
  return {
    id: row.id as string,
    entrepreneurId: row.entrepreneur_id as string,
    templateId: (row.template_id as string) ?? null,
    latestSnapshotId: (row.latest_snapshot_id as string) ?? null,
    preparedPayload: (row.prepared_payload as Record<string, unknown>) ?? {},
    status: row.status as IssuanceDraft['status'],
    credentialType: row.credential_type as IssuanceDraft['credentialType'],
    title: row.title as string,
    description: (row.description as string) ?? null,
    operatorNote: (row.operator_note as string) ?? null,
    createdBy: (row.created_by as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapCredentialTemplate(row: RawRow): CredentialTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    credentialType: row.credential_type as CredentialTemplate['credentialType'],
    schemaVersion: row.schema_version as string,
    templateDefinition:
      (row.template_definition as Record<string, unknown>) ?? {},
    active: row.active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
