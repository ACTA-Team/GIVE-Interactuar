import type { CredentialRepository } from '../repositories/credentialRepository';
import type { Credential, IssuanceDraft } from '../types';
import type { CredentialFilters, IssuanceDraftInput } from '../schemas';

export function createCredentialService(repo: CredentialRepository) {
  return {
    async list(filters?: CredentialFilters): Promise<Credential[]> {
      // TODO: add pagination
      return repo.findAll(filters);
    },

    async getById(id: string): Promise<Credential | null> {
      return repo.findById(id);
    },

    async getByPublicId(publicId: string): Promise<Credential | null> {
      return repo.findByPublicId(publicId);
    },

    async createDraft(
      input: IssuanceDraftInput,
      organizationId: string,
      createdBy: string,
    ): Promise<IssuanceDraft> {
      // TODO: validate that entrepreneur belongs to organization
      // TODO: fetch latest snapshot and attach to draft
      // TODO: fetch template if templateId is provided and validate compatibility
      return repo.createDraft({
        organizationId,
        entrepreneurId: input.entrepreneurId,
        templateId: input.templateId ?? null,
        latestSnapshotId: null, // TODO: resolve latest snapshot
        subjectWalletId: input.subjectWalletId ?? null,
        sponsorVaultId: input.sponsorVaultId ?? null,
        preparedPayload: {}, // TODO: build from template + snapshot
        status: 'draft',
        createdBy,
      });
    },
  };
}

export type CredentialService = ReturnType<typeof createCredentialService>;
