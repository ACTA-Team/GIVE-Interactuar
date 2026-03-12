'use client';

import type { ISupportedWallet } from '@creit.tech/stellar-wallets-kit';
import { useWalletContext } from './WalletContext';

export function useWalletKit() {
  const { setWalletInfo, clearWalletInfo, walletKit } = useWalletContext();

  const connectWithWalletKit = async (): Promise<string> => {
    if (!walletKit) throw new Error('WalletKit no disponible');

    return new Promise<string>((resolve, reject) => {
      walletKit.openModal({
        modalTitle: 'Conecta tu wallet Stellar',
        onWalletSelected: (option: ISupportedWallet) => {
          walletKit.setWallet(option.id);
          void (async () => {
            try {
              const { address } = await walletKit.getAddress();
              setWalletInfo(address, option.name);
              resolve(address);
            } catch (err) {
              reject(
                err instanceof Error
                  ? err
                  : new Error('No se pudo obtener la dirección de la wallet'),
              );
            }
          })();
        },
      });
    });
  };

  const disconnectWalletKit = async () => {
    await walletKit?.disconnect();
    clearWalletInfo();
  };

  return { connectWithWalletKit, disconnectWalletKit };
}
