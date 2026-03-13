import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { EntrepreneursListPage } from '@/features/entrepreneurs/components/pages/EntrepreneursListPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return {
    title: t('titles.entrepreneurs'),
  };
}

export default function Page() {
  return <EntrepreneursListPage />;
}
