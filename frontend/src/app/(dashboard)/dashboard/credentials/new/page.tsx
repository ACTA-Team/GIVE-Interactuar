import { CredentialIssuancePage } from '@/features/credentials/components/pages/CredentialIssuancePage';

// TODO: add auth guard once login flow is built
// TODO: resolve organizationId and userId from authenticated session
export default function Page() {
  return (
    <CredentialIssuancePage
      organizationId="dev-org"
      userId="dev-user"
    />
  );
}
