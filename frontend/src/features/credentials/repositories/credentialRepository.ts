import { mapCredential, mapIssuanceDraft } from '../mappers/credentialMapper';
import type { Credential, IssuanceDraft } from '../types';
import type { CredentialFilters } from '../schemas';
import type { SupabaseLikeClient } from '@/@types/supabase';

export function createCredentialRepository(client: SupabaseLikeClient) {
  return {
    async findAll(filters?: CredentialFilters): Promise<Credential[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (client as any).from('credentials').select('*');

      if (filters?.entrepreneurId)
        q = q.eq('entrepreneur_id', filters.entrepreneurId);
      if (filters?.status) q = q.eq('status', filters.status);
      if (filters?.credentialType)
        q = q.eq('credential_type', filters.credentialType);

      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => mapCredential(row));
    },

    async findById(id: string): Promise<Credential | null> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('credentials')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapCredential(data);
    },

    async findByPublicId(publicId: string): Promise<Credential | null> {
      // Used by the public verification portal — no auth required
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('credentials')
        .select('*')
        .eq('public_id', publicId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapCredential(data);
    },

    async createDraft(
      draft: Omit<IssuanceDraft, 'id' | 'createdAt' | 'updatedAt'>,
    ): Promise<IssuanceDraft> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('issuance_drafts')
        .insert({
          organization_id: draft.organizationId,
          entrepreneur_id: draft.entrepreneurId,
          template_id: draft.templateId,
          latest_snapshot_id: draft.latestSnapshotId,
          prepared_payload: draft.preparedPayload,
          status: draft.status,
          created_by: draft.createdBy,
        })
        .select()
        .single();
      if (error) throw error;
      return mapIssuanceDraft(data);
    },

    async updateActaVcId(id: string, actaVcId: string): Promise<void> {
      // TODO: call this after ACTA SDK returns the issued VC ID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (client as any)
        .from('credentials')
        .update({ acta_vc_id: actaVcId, status: 'issued', issued_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
  };
}

export type CredentialRepository = ReturnType<
  typeof createCredentialRepository
>;
