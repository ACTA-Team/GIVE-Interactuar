'use client';

import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { useWalletContext } from './WalletContext';

export function useWalletKit() {
  const { setWalletInfo, clearWalletInfo, walletKit } = useWalletContext();

  const connectWithWalletKit = async (): Promise<string> => {
    if (!walletKit) throw new Error('WalletKit no disponible');

    const { address } = await StellarWalletsKit.authModal();
    const walletName =
      StellarWalletsKit.selectedModule?.productName ?? 'Stellar Wallet';
    setWalletInfo(address, walletName);
    return address;
  };

  const disconnectWalletKit = async () => {
    await StellarWalletsKit.disconnect();
    clearWalletInfo();
  };

  return { connectWithWalletKit, disconnectWalletKit };
}
