import type { Metadata } from 'next';
import { formatDateTime } from '@/lib/helpers/date';
import { CredentialSharePage } from '@/features/credentials/components/pages/CredentialSharePage';
import { CourseCompletionCertificatePage } from '@/features/credentials/components/pages/CourseCompletionCertificatePage';
import { getCachedCredential } from './getCredential';

interface Props {
  params: Promise<{ credentialId: string }>;
}

function extractHolderName(
  claims: Record<string, unknown>,
): string | undefined {
  return (
    (claims['holderName'] as string | undefined) ??
    (claims['name'] as string | undefined) ??
    (claims['fullName'] as string | undefined) ??
    (claims['entrepreneurName'] as string | undefined)
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { credentialId } = await params;
  const credential = await getCachedCredential(credentialId);

  if (!credential) {
    return { title: `Credencial · ${credentialId}` };
  }

  const claims = credential.publicClaims ?? {};
  const holderName = extractHolderName(claims) ?? 'Interactuar';
  const description =
    credential.credentialType === 'course_completion'
      ? `Constancia de finalización del curso "${(claims['courseName'] as string | undefined) ?? ''}" — ${holderName}`
      : `${credential.title} — credencial verificable emitida por Interactuar`;

  const title = `${credential.title} — ${holderName}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function Page({ params }: Props) {
  const { credentialId } = await params;
  const credential = await getCachedCredential(credentialId);
  if (!credential) {
    // Simple 404 for public page
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <p>Credencial no encontrada.</p>
      </main>
    );
  }

  if (credential.credentialType === 'course_completion') {
    return (
      <main className="min-h-screen w-full bg-white flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-5xl">
          <CourseCompletionCertificatePage credential={credential} />
        </div>
      </main>
    );
  }

  const claims = credential.publicClaims ?? {};
  const holderName = extractHolderName(claims);

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
