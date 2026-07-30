import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import { createCredentialService } from '@/features/credentials/services/credentialService';
import { formatDateTime } from '@/lib/helpers/date';
import { CredentialSharePage } from '@/features/credentials/components/pages/CredentialSharePage';

interface Props {
  params: Promise<{ credentialId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { credentialId } = await params;
  return {
    title: `Credencial · ${credentialId}`,
  };
}

export default async function Page({ params }: Props) {
  const { credentialId } = await params;
  const supabase = await createServerSupabaseClient();
  const repo = createCredentialRepository(supabase);
  const service = createCredentialService(repo);

  const credential = await service.getByPublicId(credentialId);
  if (!credential) {
    // Simple 404 for public page
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <p>Credencial no encontrada.</p>
      </main>
    );
  }

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

  const issuedAtLabel = credential.issuedAt
    ? formatDateTime(credential.issuedAt)
    : '—';

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-5xl">
        <CredentialSharePage
          credential={credential}
          holderName={holderName}
          holderDocument={holderDocument}
          issuedAtLabel={issuedAtLabel}
        />
      </div>
    </main>
  );
}
