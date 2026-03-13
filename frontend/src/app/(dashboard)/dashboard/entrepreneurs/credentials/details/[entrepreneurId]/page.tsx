import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ClientCredentialsPage } from '@/features/credentials/components/pages/ClientCredentialsPage';
import { MOCK_ENTREPRENEURS } from '@/features/entrepreneurs/data/mock-entrepreneurs';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return {
    title: t('titles.entrepreneurClientDetail'),
  };
}

interface PageProps {
  params: Promise<{ entrepreneurId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { entrepreneurId } = await params;

  const entrepreneur = MOCK_ENTREPRENEURS.find((e) => e.id === entrepreneurId);
  if (!entrepreneur) notFound();

  const supabase = await createServerSupabaseClient();
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
