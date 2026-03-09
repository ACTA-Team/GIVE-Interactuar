import { VaultsPage } from '@/features/vaults/components/pages/VaultsPage';

// TODO: vaults are scoped to an entrepreneur, not directly to the org.
// Decide if this page should:
//   a) require an ?entrepreneurId=... query param, or
//   b) show all vaults for the org (requires joining with entrepreneurs)
// For now renders an empty state as placeholder.
export default async function Page() {
  // TODO: fetch vaults by org or by selected entrepreneur
  return <VaultsPage vaults={[]} />;
}
