import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { EntrepreneurDetailPage } from '@/features/entrepreneurs/components/pages/EntrepreneurDetailPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return {
    title: t('titles.entrepreneurDetail'),
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EntrepreneurDetailPage entrepreneurId={id} />;
}
