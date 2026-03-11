import { EntrepreneurDetailPage } from '@/features/entrepreneurs/components/pages/EntrepreneurDetailPage';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EntrepreneurDetailPage entrepreneurId={id} />;
}
