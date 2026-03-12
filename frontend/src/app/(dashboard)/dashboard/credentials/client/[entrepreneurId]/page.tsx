import { notFound } from 'next/navigation';
import { ClientCredentialsPage } from '@/features/credentials/components/pages/ClientCredentialsPage';
import { MOCK_ENTREPRENEURS } from '@/features/entrepreneurs/data/mock-entrepreneurs';

interface PageProps {
  params: Promise<{ entrepreneurId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { entrepreneurId } = await params;

  const entrepreneur = MOCK_ENTREPRENEURS.find(
    (e) => e.id === entrepreneurId,
  );
  if (!entrepreneur) notFound();

  return (
    <ClientCredentialsPage
      client={{
        id: entrepreneur.id,
        name: entrepreneur.name,
        businessName: entrepreneur.businessName,
        businessType: entrepreneur.businessType,
        email: entrepreneur.email,
        phone: entrepreneur.phone,
      }}
      credentials={[]}
    />
  );
}
