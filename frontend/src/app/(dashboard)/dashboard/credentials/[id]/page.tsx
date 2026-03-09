import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import { createCredentialService } from '@/features/credentials/services/credentialService';
import { CredentialDetailPage } from '@/features/credentials/components/pages/CredentialDetailPage';

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

  return <CredentialDetailPage credential={credential} />;
}
