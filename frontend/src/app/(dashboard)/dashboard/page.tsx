import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DashboardPage } from '@/features/dashboard/components/pages/DashboardPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return {
    title: t('titles.dashboard'),
  };
}

export default function Page() {
  return <DashboardPage />;
}
