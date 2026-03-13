export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import { CredentialsListPage } from '@/features/credentials/components/pages/CredentialsListPage';
import { Pagination } from '@/components/ui/pagination';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import type { VaultClientSummary } from '@/features/credentials/components/pages/CredentialsListPage';
import {
  mapEmpresarioToDashboardEntrepreneur,
  type EmpresarioRow,
} from '@/features/entrepreneurs/mappers/empresariosDashboardMapper';

export default async function Page({
  searchParams,
}: {
  // In Next.js 16, searchParams is a Promise that must be awaited
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createServerSupabaseClient();
  const repo = createCredentialRepository(supabase);

  const resolvedSearchParams = await searchParams;
  const rawPage = Array.isArray(resolvedSearchParams.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams.page;
  const page = Math.max(1, Number(rawPage ?? '1') || 1);
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {
    data: empresarios,
    error,
    count,
  } = await supabase
    .from('empresarios')
    .select(
      'id, name, company, sector, active_credit, delinquent, created_at',
      { count: 'exact' },
    )
    .range(from, to);

  if (error) {
    // In case of a table missing or RLS error, fail softly with empty list
    console.error('Error loading empresarios for credentials page', error);
  }

  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

  const clients: VaultClientSummary[] = await Promise.all(
    (empresarios ?? []).map(async (row) => {
      const e = mapEmpresarioToDashboardEntrepreneur(row as EmpresarioRow);
      const credentials = await repo.findAll({ entrepreneurId: e.id });

      const byType = {
        impact: credentials.filter((c) => c.credentialType === 'impact'),
        behavior: credentials.filter((c) => c.credentialType === 'behavior'),
        profile: credentials.filter((c) => c.credentialType === 'profile'),
      };

      const issued = credentials.filter((c) => c.status === 'issued');

      return {
        id: e.id,
        name: e.name,
        email: e.email,
        phone: e.phone,
        businessName: e.businessName,
        businessType: e.businessType,
        currentStage: e.currentStage,
        hasFunding: e.hasFunding,
        fundingAmount: e.fundingAmount,
        isDelinquent: e.isDelinquent,
        delinquentDays: e.delinquentDays,
        totalCredentials: credentials.length,
        issuedCredentials: issued.length,
        impactCount: byType.impact.length,
        behaviorCount: byType.behavior.length,
        profileCount: byType.profile.length,
        hasOnChain: credentials.some((c) => !!c.actaVcId),
      };
    }),
  );

  const tc = await getTranslations('common');
  const showingLabel = tc('showing', {
    count: clients.length,
    total,
  });

  return (
    <div className="space-y-4">
      <CredentialsListPage clients={clients} hidePagination />
      {clients.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          showingLabel={showingLabel}
          useServerNavigation
        />
      )}
    </div>
  );
}
