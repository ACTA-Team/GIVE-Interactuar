'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { DashboardEntrepreneur } from '../types/stages';
import {
  mapEmpresarioToDashboardEntrepreneur,
  type EmpresarioRow,
} from '../mappers/empresariosDashboardMapper';

export function useDashboardEntrepreneurs() {
  return useQuery<DashboardEntrepreneur[]>({
    queryKey: ['dashboard-entrepreneurs'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('empresarios')
        .select(
          [
            'id',
            'name',
            'gender',
            'company',
            'sector',
            'active_credit',
            'delinquent',
            'created_at',
            'program',
            'partner',
            'level',
            '"group"',
            'cohort_year',
          ].join(', '),
        );

      if (error) throw error;

      return (data ?? []).map((row) =>
        mapEmpresarioToDashboardEntrepreneur(row as EmpresarioRow),
      );
    },
  });
}

export function useDashboardEntrepreneur(id: string | null) {
  return useQuery<DashboardEntrepreneur | null>({
    queryKey: ['dashboard-entrepreneur', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('empresarios')
        .select(
          'id, name, company, sector, active_credit, delinquent, created_at',
        )
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return mapEmpresarioToDashboardEntrepreneur(data as EmpresarioRow);
    },
  });
}
