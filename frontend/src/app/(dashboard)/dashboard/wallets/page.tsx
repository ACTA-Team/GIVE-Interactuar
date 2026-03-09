import { WalletsPage } from '@/features/wallets/components/pages/WalletsPage';

// TODO: wallets are scoped to an entrepreneur, not directly to the org.
// Decide if this page should:
//   a) require an ?entrepreneurId=... query param, or
//   b) show all wallets for the org (requires joining with entrepreneurs)
// For now renders an empty state as placeholder.
export default async function Page() {
  // TODO: fetch wallets by org or by selected entrepreneur
  return <WalletsPage wallets={[]} />;
}
