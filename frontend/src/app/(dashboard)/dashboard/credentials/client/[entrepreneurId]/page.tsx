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
    .select('id, name, company, sector, active_credit, delinquent, created_at')
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
    />
  );
}
