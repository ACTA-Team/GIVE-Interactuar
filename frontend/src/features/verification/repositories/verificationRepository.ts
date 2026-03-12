import type { VerificationRecord, VerificationResult } from '../types';
import type { SupabaseLikeClient } from '@/@types/supabase';

type RawRow = Record<string, unknown>;

function mapVerificationRecord(row: RawRow): VerificationRecord {
  return {
    id: row.id as string,
    credentialId: row.credential_id as string,
    verifierType: (row.verifier_type as string) ?? null,
    verifierIdentifier: (row.verifier_identifier as string) ?? null,
    verificationResult: row.verification_result as VerificationResult,
    checkedAt: row.checked_at as string,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
  };
}

export function createVerificationRepository(client: SupabaseLikeClient) {
  return {
    async findAll(filters?: {
      credentialId?: string;
      verificationResult?: string;
    }): Promise<VerificationRecord[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (client as any).from('verification_records').select('*');
      if (filters?.credentialId)
        q = q.eq('credential_id', filters.credentialId);
      if (filters?.verificationResult)
        q = q.eq('verification_result', filters.verificationResult);
      const { data, error } = await q.order('checked_at', { ascending: false });
      if (error) throw error;
      return (data as RawRow[]).map(mapVerificationRecord);
    },

    async findById(id: string): Promise<VerificationRecord | null> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('verification_records')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapVerificationRecord(data);
    },
  };
}

export type VerificationRepository = ReturnType<
  typeof createVerificationRepository
>;
