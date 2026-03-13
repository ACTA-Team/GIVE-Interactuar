import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import { createCredentialService } from '@/features/credentials/services/credentialService';
import { CredentialSharePage } from '@/features/credentials/components/pages/CredentialSharePage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return {
    title: t('titles.credentialsDetail'),
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const repo = createCredentialRepository(supabase);
  const service = createCredentialService(repo);
  const credential = await service.getById(id);

  if (!credential) notFound();

  // Try to infer holder information from public claims if available
  const claims = credential.publicClaims ?? {};
  const holderName =
    (claims['holderName'] as string | undefined) ??
    (claims['name'] as string | undefined) ??
    (claims['fullName'] as string | undefined) ??
    (claims['entrepreneurName'] as string | undefined);

  const holderDocument =
    (claims['document'] as string | undefined) ??
    (claims['documentNumber'] as string | undefined) ??
    (claims['idNumber'] as string | undefined) ??
    undefined;

  return (
    <CredentialSharePage
      credential={credential}
      holderName={holderName}
      holderDocument={holderDocument}
    />
  );
}
