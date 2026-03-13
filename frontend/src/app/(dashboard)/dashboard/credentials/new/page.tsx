import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CredentialIssuancePage } from '@/features/credentials/components/pages/CredentialIssuancePage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return {
    title: t('titles.credentialsNew'),
  };
}

// TODO: add auth guard once login flow is built
// TODO: resolve organizationId and userId from authenticated session
export default function Page() {
  return <CredentialIssuancePage />;
}
