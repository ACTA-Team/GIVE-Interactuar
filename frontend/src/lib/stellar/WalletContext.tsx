'use client';

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
} from '@creit.tech/stellar-wallets-kit';

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
  walletKit: StellarWalletsKit | null;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function getNetwork(): WalletNetwork {
  const env = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet';
  return env === 'mainnet' ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return typeof window !== 'undefined'
      ? localStorage.getItem('walletAddress')
      : null;
  });
  const [walletName, setWalletName] = useState<string | null>(() => {
    return typeof window !== 'undefined'
      ? localStorage.getItem('walletName')
      : null;
  });

  const walletKit = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      return new StellarWalletsKit({
        network: getNetwork(),
        selectedWalletId: FREIGHTER_ID,
        modules: [new FreighterModule()],
      });
    } catch {
      return null;
    }
  }, []);

  const setWalletInfo = (address: string, name: string) => {
    setWalletAddress(address);
    setWalletName(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('walletName', name);
    }
  };

  const clearWalletInfo = () => {
    setWalletAddress(null);
    setWalletName(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('walletName');
    }
  };

  const signTransaction = async (
    xdr: string,
    options: { networkPassphrase: string },
  ): Promise<string> => {
    if (!walletKit) throw new Error('WalletKit no disponible');
    const { signedTxXdr } = await walletKit.signTransaction(xdr, {
      address: walletAddress || undefined,
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
        walletKit,
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
