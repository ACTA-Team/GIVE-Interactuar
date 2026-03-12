import type { FinancialProfile, CreditLevel } from '../types';
import type { SupabaseLikeClient } from '@/@types/supabase';

type RawRow = Record<string, unknown>;

function mapFinancialProfile(row: RawRow): FinancialProfile {
  return {
    id: row.id as string,
    entrepreneurId: row.entrepreneur_id as string,
    creditLevel: (row.credit_level as CreditLevel) ?? undefined,
    loanStatus: (row.loan_status as string) ?? undefined,
    rawData: (row.raw_data as Record<string, unknown>) ?? {},
    importedAt: row.imported_at as string,
    sourceFile: row.source_file as string,
  };
}

export function createFinancialProfileRepository(client: SupabaseLikeClient) {
  return {
    async findAll(filters?: {
      entrepreneurId?: string;
      creditLevel?: string;
    }): Promise<FinancialProfile[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (client as any).from('financial_profiles').select('*');
      if (filters?.entrepreneurId)
        q = q.eq('entrepreneur_id', filters.entrepreneurId);
      if (filters?.creditLevel) q = q.eq('credit_level', filters.creditLevel);
      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw error;
      return (data as RawRow[]).map(mapFinancialProfile);
    },

    async findById(id: string): Promise<FinancialProfile | null> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('financial_profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapFinancialProfile(data);
    },
  };
}

export type FinancialProfileRepository = ReturnType<
  typeof createFinancialProfileRepository
>;
