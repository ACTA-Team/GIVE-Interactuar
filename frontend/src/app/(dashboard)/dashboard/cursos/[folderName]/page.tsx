import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CourseDetailPage } from '@/features/courses/components/pages/CourseDetailPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return { title: t('titles.cursos') };
}

interface Props {
  params: Promise<{ folderName: string }>;
}

export default async function Page({ params }: Props) {
  const { folderName } = await params;
  return <CourseDetailPage folderName={decodeURIComponent(folderName)} />;
}
