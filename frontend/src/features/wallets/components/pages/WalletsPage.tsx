import type { StellarWallet } from '../../types';
import { WalletCard } from '../ui/WalletCard';

interface WalletsPageProps {
  wallets: StellarWallet[];
}

// TODO: add "Connect wallet" button using @creit-tech/stellar-wallets-kit
// TODO: filter by network (testnet / mainnet)
export function WalletsPage({ wallets }: WalletsPageProps) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Wallets Stellar
        </h1>
        {/* TODO: ConnectWalletButton */}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wallets.map((w) => (
          <WalletCard key={w.id} wallet={w} />
        ))}
      </div>

      {wallets.length === 0 && (
        <p className="mt-8 text-center text-sm text-gray-500">
          No hay wallets registradas.
        </p>
      )}
    </div>
  );
}
