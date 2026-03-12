export const dynamic = 'force-dynamic';

import { CredentialsListPage } from '@/features/credentials/components/pages/CredentialsListPage';
import { MOCK_ENTREPRENEURS } from '@/features/entrepreneurs/data/mock-entrepreneurs';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import type { VaultClientSummary } from '@/features/credentials/components/pages/CredentialsListPage';

export default async function Page() {
  const supabase = await createServerSupabaseClient();
  const repo = createCredentialRepository(supabase);

  const clients: VaultClientSummary[] = await Promise.all(
    MOCK_ENTREPRENEURS.map(async (e) => {
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

  return <CredentialsListPage clients={clients} />;
}
