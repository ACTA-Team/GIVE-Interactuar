export const dynamic = 'force-dynamic';

import {
  CredentialsListPage,
  type VaultClient,
} from '@/features/credentials/components/pages/CredentialsListPage';
import { MOCK_ENTREPRENEURS } from '@/features/entrepreneurs/data/mock-entrepreneurs';

export default function Page() {
  const clients: VaultClient[] = MOCK_ENTREPRENEURS.map((e) => ({
    id: e.id,
    name: e.name,
    businessName: e.businessName,
    businessType: e.businessType,
    email: e.email,
    credentialCount: 0,
  }));

  return <CredentialsListPage clients={clients} />;
}
