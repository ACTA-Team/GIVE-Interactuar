import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createEntrepreneurRepository } from '@/features/entrepreneurs/repositories/entrepreneurRepository';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import { ClientCredentialsPage } from '@/features/credentials/components/pages/ClientCredentialsPage';
import type { Credential } from '@/features/credentials/types';

interface PageProps {
  params: Promise<{ entrepreneurId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { entrepreneurId } = await params;
  const supabase = await createServerSupabaseClient();

  const entrepreneurRepo = createEntrepreneurRepository(supabase);
  const credentialRepo = createCredentialRepository(supabase);

  const entrepreneur = await entrepreneurRepo.findById(entrepreneurId);
  if (!entrepreneur) notFound();

  let credentials: Credential[] = [];
  try {
    credentials = await credentialRepo.findAll({ entrepreneurId });
  } catch {
    // credentials table may not exist yet
  }

  return (
    <ClientCredentialsPage
      entrepreneur={entrepreneur}
      credentials={credentials}
    />
  );
}
