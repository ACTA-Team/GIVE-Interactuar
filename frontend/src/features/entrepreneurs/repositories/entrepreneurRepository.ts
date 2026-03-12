import {
  mapEntrepreneur,
  mapBusinessProfile,
  mapSnapshot,
} from '../mappers/entrepreneurMapper';
import type {
  Entrepreneur,
  EntrepreneurFilters,
  BusinessProfile,
  EntrepreneurProfileSnapshot,
} from '../types';
import type { SupabaseLikeClient } from '@/@types/supabase';

export function createEntrepreneurRepository(client: SupabaseLikeClient) {
  return {
    async findAll(filters?: EntrepreneurFilters): Promise<Entrepreneur[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (client as any).from('entrepreneurs').select('*');

      if (filters?.active !== undefined) q = q.eq('active', filters.active);
      if (filters?.query) {
        // TODO: switch to full-text search using the full_name index
        q = q.ilike('full_name', `%${filters.query}%`);
      }
      if (filters?.municipality) q = q.eq('municipality', filters.municipality);
      if (filters?.department) q = q.eq('department', filters.department);

      const { data, error } = await q.order('full_name');
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => mapEntrepreneur(row));
    },

    async findById(id: string): Promise<Entrepreneur | null> {
      // TODO: join entrepreneur_business_profiles and latest entrepreneur_profile_snapshots
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('entrepreneurs')
        .select(
          '*, entrepreneur_business_profiles(*), entrepreneur_profile_snapshots(*)',
        )
        .eq('id', id)
        .eq('entrepreneur_profile_snapshots.is_latest', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapEntrepreneur(data);
    },

    async findAllBusinessProfiles(filters?: {
      entrepreneurId?: string;
    }): Promise<BusinessProfile[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (client as any)
        .from('entrepreneur_business_profiles')
        .select('*');

      if (filters?.entrepreneurId)
        q = q.eq('entrepreneur_id', filters.entrepreneurId);

      const { data, error } = await q.order('created_at', {
        ascending: false,
      });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => mapBusinessProfile(row));
    },

    async findBusinessProfileById(id: string): Promise<BusinessProfile | null> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('entrepreneur_business_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapBusinessProfile(data);
    },

    async findAllSnapshots(filters?: {
      entrepreneurId?: string;
      isLatest?: boolean;
    }): Promise<EntrepreneurProfileSnapshot[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (client as any)
        .from('entrepreneur_profile_snapshots')
        .select('*');

      if (filters?.entrepreneurId)
        q = q.eq('entrepreneur_id', filters.entrepreneurId);
      if (filters?.isLatest !== undefined)
        q = q.eq('is_latest', filters.isLatest);

      const { data, error } = await q.order('created_at', {
        ascending: false,
      });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => mapSnapshot(row));
    },

    async findSnapshotById(
      id: string,
    ): Promise<EntrepreneurProfileSnapshot | null> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from('entrepreneur_profile_snapshots')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapSnapshot(data);
    },
  };
}

export type EntrepreneurRepository = ReturnType<
  typeof createEntrepreneurRepository
>;
