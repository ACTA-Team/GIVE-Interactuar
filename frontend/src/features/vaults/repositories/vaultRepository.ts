import type { SupabaseClient } from '@supabase/supabase-js';
import type { SponsorVault } from '../types';

type RawRow = Record<string, unknown>;

function mapVault(row: RawRow): SponsorVault {
  return {
    id: row.id as string,
    entrepreneurId: row.entrepreneur_id as string,
    walletId: (row.wallet_id as string) ?? null,
    network: row.network as SponsorVault['network'],
    vaultRole: row.vault_role as SponsorVault['vaultRole'],
    vaultAddress: (row.vault_address as string) ?? null,
    vaultContractId: (row.vault_contract_id as string) ?? null,
    vaultDidUri: (row.vault_did_uri as string) ?? null,
    vaultRevoked: row.vault_revoked as boolean,
    sponsorAddress: (row.sponsor_address as string) ?? null,
    active: row.active as boolean,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// TODO: switch to SupabaseClient<Database> once database.types.ts is generated
export function createVaultRepository(client: SupabaseClient) {
  return {
    async findByEntrepreneur(entrepreneurId: string): Promise<SponsorVault[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('sponsor_vaults')
        .select('*')
        .eq('entrepreneur_id', entrepreneurId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => mapVault(row));
    },

    async findById(id: string): Promise<SponsorVault | null> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('sponsor_vaults')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapVault(data);
    },
  };
}

export type VaultRepository = ReturnType<typeof createVaultRepository>;
