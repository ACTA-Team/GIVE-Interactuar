import type { SupabaseClient } from '@supabase/supabase-js';
import type { StellarWallet } from '../types';

type RawRow = Record<string, unknown>;

function mapWallet(row: RawRow): StellarWallet {
  return {
    id: row.id as string,
    entrepreneurId: row.entrepreneur_id as string,
    publicKey: row.public_key as string,
    network: row.network as StellarWallet['network'],
    isPrimary: row.is_primary as boolean,
    isVerified: row.is_verified as boolean,
    federationAddress: (row.federation_address as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// TODO: switch to SupabaseClient<Database> once database.types.ts is generated
export function createWalletRepository(client: SupabaseClient) {
  return {
    async findByEntrepreneur(entrepreneurId: string): Promise<StellarWallet[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('stellar_wallets')
        .select('*')
        .eq('entrepreneur_id', entrepreneurId)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => mapWallet(row));
    },

    async findById(id: string): Promise<StellarWallet | null> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('stellar_wallets')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapWallet(data);
    },
  };
}

export type WalletRepository = ReturnType<typeof createWalletRepository>;
