import { notFound } from 'next/navigation';
import { ClientCredentialsPage } from '@/features/credentials/components/pages/ClientCredentialsPage';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import {
  mapEmpresarioToDashboardEntrepreneur,
  type EmpresarioRow,
} from '@/features/entrepreneurs/mappers/empresariosDashboardMapper';

interface PageProps {
  params: Promise<{ entrepreneurId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { entrepreneurId } = await params;

  const supabase = await createServerSupabaseClient();

  const { data: empresario, error } = await supabase
    .from('empresarios')
    .select(
      [
        'id',
        'name',
        'company',
        'program',
        'partner',
        'status',
        'gender',
        'municipality',
        'sector',
        'sales_prev_year_cop',
        'sales_cop',
        'growth_pct',
        'new_jobs',
        'level',
        '"group"',
        'cohort_year',
        'active_credit',
        'education',
        'strata',
        'residence_zone',
        'legal_entity',
        'company_size',
        'age',
        'age_range',
        'credit_requested',
        'delinquent',
        'created_at',
        'updated_at',
      ].join(', '),
    )
    .eq('id', entrepreneurId)
    .maybeSingle();

  if (error) {
    console.error(
      'Error loading empresario for client credentials page',
      error,
    );
  }

  if (!empresario) notFound();

  const entrepreneur = mapEmpresarioToDashboardEntrepreneur(
    empresario as EmpresarioRow,
  );

  const repo = createCredentialRepository(supabase);
  const credentials = await repo.findAll({ entrepreneurId });

  return (
    <ClientCredentialsPage
      client={{
        id: entrepreneur.id,
        name: entrepreneur.name,
        businessName: entrepreneur.businessName,
        businessType: entrepreneur.businessType,
        email: entrepreneur.email,
        phone: entrepreneur.phone,
        currentStage: entrepreneur.currentStage,
        hasFunding: entrepreneur.hasFunding,
        fundingAmount: entrepreneur.fundingAmount,
        isDelinquent: entrepreneur.isDelinquent,
        delinquentDays: entrepreneur.delinquentDays,
      }}
      credentials={credentials}
      empresario={{
        program:
          (empresario as EmpresarioRow & { program?: string }).program ?? null,
        partner: (empresario as { partner?: string }).partner ?? null,
        status: (empresario as { status?: string }).status ?? null,
        gender: (empresario as { gender?: string }).gender ?? null,
        municipality:
          (empresario as EmpresarioRow & { municipality?: string })
            .municipality ?? null,
        sector: (empresario as EmpresarioRow).sector ?? null,
        salesPrevYearCop:
          (empresario as { sales_prev_year_cop?: number | null })
            .sales_prev_year_cop ?? null,
        salesCop:
          (empresario as { sales_cop?: number | null }).sales_cop ?? null,
        growthPct:
          (empresario as { growth_pct?: number | null }).growth_pct ?? null,
        newJobs: (empresario as { new_jobs?: number | null }).new_jobs ?? null,
        level: (empresario as { level?: string }).level ?? null,
        groupName: (empresario as { group?: string })['group'] ?? null,
        cohortYear:
          (empresario as { cohort_year?: number | null }).cohort_year ?? null,
        activeCredit:
          (empresario as EmpresarioRow & { active_credit?: string })
            .active_credit ?? null,
        education: (empresario as { education?: string }).education ?? null,
        strata: (empresario as { strata?: number | null }).strata ?? null,
        residenceZone:
          (empresario as { residence_zone?: string }).residence_zone ?? null,
        legalEntity:
          (empresario as { legal_entity?: string }).legal_entity ?? null,
        companySize:
          (empresario as { company_size?: string }).company_size ?? null,
        age: (empresario as { age?: number | null }).age ?? null,
        ageRange: (empresario as { age_range?: string }).age_range ?? null,
        creditRequested:
          (empresario as { credit_requested?: string }).credit_requested ?? '',
        delinquent: (empresario as EmpresarioRow).delinquent ?? '',
      }}
    />
  );
}
