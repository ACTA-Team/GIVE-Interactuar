'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface EmpresarioPrefill {
  id: string;
  name: string;
  company: string | null;
  sector: string | null;
  program: string | null;
  partner: string | null;
  status: string | null;
  level: string | null;
  group: string | null;
  cohortYear: number | null;
  growthPct: number | null;
  salesPrevYearCop: number | null;
  salesCop: number | null;
  newJobs: number | null;
  activeCredit: string | null;
  education: string | null;
  municipality: string | null;
  residenceZone: string | null;
  legalEntity: string | null;
  companySize: string | null;
}

interface EmpresarioPrefillRow {
  id: string;
  name: string;
  company: string | null;
  sector: string | null;
  program: string | null;
  partner: string | null;
  status: string | null;
  level: string | null;
  group: string | null;
  cohort_year: number | null;
  growth_pct: number | null;
  sales_prev_year_cop: number | null;
  sales_cop: number | null;
  new_jobs: number | null;
  active_credit: string | null;
  education: string | null;
  municipality: string | null;
  residence_zone: string | null;
  legal_entity: string | null;
  company_size: string | null;
}

export function useEmpresarioPrefill(id: string | null) {
  return useQuery<EmpresarioPrefill | null>({
    queryKey: ['empresario-prefill', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('empresarios')
        .select(
          [
            'id',
            'name',
            'company',
            'sector',
            'program',
            'partner',
            'status',
            'level',
            '"group"',
            'cohort_year',
            'growth_pct',
            'sales_prev_year_cop',
            'sales_cop',
            'new_jobs',
            'active_credit',
            'education',
            'municipality',
            'residence_zone',
            'legal_entity',
            'company_size',
          ].join(', '),
        )
        .eq('id', id)
        .maybeSingle<EmpresarioPrefillRow>();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        company: data.company,
        sector: data.sector,
        program: data.program,
        partner: data.partner,
        status: data.status,
        level: data.level,
        group: data.group,
        cohortYear: data.cohort_year,
        growthPct: data.growth_pct,
        salesPrevYearCop: data.sales_prev_year_cop,
        salesCop: data.sales_cop,
        newJobs: data.new_jobs,
        activeCredit: data.active_credit,
        education: data.education,
        municipality: data.municipality,
        residenceZone: data.residence_zone,
        legalEntity: data.legal_entity,
        companySize: data.company_size,
      };
    },
  });
}
