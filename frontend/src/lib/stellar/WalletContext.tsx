'use client';

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import {
  FREIGHTER_ID,
  FreighterModule,
} from '@creit.tech/stellar-wallets-kit/modules/freighter';

const walletSubscribers = new Set<() => void>();

function subscribeWallet(cb: () => void) {
  walletSubscribers.add(cb);
  return () => walletSubscribers.delete(cb);
}

function notifyWallet() {
  walletSubscribers.forEach((cb) => cb());
}

type WalletContextType = {
  walletAddress: string | null;
  walletName: string | null;
  connected: boolean;
  setWalletInfo: (address: string, name: string) => void;
  clearWalletInfo: () => void;
  signTransaction: (
    xdr: string,
    options: { networkPassphrase: string },
  ) => Promise<string>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function getNetwork(): Networks {
  const env = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet';
  return env === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const walletAddress = useSyncExternalStore(
    subscribeWallet,
    () => localStorage.getItem('walletAddress'),
    () => null,
  );

  const walletName = useSyncExternalStore(
    subscribeWallet,
    () => localStorage.getItem('walletName'),
    () => null,
  );

  // Side-effect only — no setState needed, StellarWalletsKit is a static singleton
  useEffect(() => {
    try {
      StellarWalletsKit.init({
        network: getNetwork(),
        selectedWalletId: FREIGHTER_ID,
        modules: [new FreighterModule()],
      });
    } catch {
      // kit unavailable (e.g. wallet extension not installed)
    }
  }, []);

  const setWalletInfo = (address: string, name: string) => {
    localStorage.setItem('walletAddress', address);
    localStorage.setItem('walletName', name);
    notifyWallet();
  };

  const clearWalletInfo = () => {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletName');
    notifyWallet();
  };

  const signTransaction = async (
    xdr: string,
    options: { networkPassphrase: string },
  ): Promise<string> => {
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
      address: walletAddress ?? undefined,
      networkPassphrase: options.networkPassphrase,
    });
    return signedTxXdr;
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletName,
        connected: !!walletAddress,
        setWalletInfo,
        clearWalletInfo,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx)
    throw new Error('useWalletContext must be used within WalletProvider');
  return ctx;
}
