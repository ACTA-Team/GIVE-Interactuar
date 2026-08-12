import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CoursesPage } from '@/features/courses/components/pages/CoursesPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return { title: t('titles.cursos') };
}

export default function Page() {
  return <CoursesPage />;
}
