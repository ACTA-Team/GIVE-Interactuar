'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import {
  FREIGHTER_ID,
  FreighterModule,
} from '@creit.tech/stellar-wallets-kit/modules/freighter';

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
  walletKit: typeof StellarWalletsKit | null;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function getNetwork(): Networks {
  const env = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet';
  return env === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);

  useEffect(() => {
    setWalletAddress(localStorage.getItem('walletAddress'));
    setWalletName(localStorage.getItem('walletName'));
  }, []);

  const [walletKit, setWalletKit] = useState<typeof StellarWalletsKit | null>(
    null,
  );

  useEffect(() => {
    try {
      StellarWalletsKit.init({
        network: getNetwork(),
        selectedWalletId: FREIGHTER_ID,
        modules: [new FreighterModule()],
      });
      setWalletKit(() => StellarWalletsKit);
    } catch {
      setWalletKit(null);
    }
  }, []);

  const setWalletInfo = (address: string, name: string) => {
    setWalletAddress(address);
    setWalletName(name);
    localStorage.setItem('walletAddress', address);
    localStorage.setItem('walletName', name);
  };

  const clearWalletInfo = () => {
    setWalletAddress(null);
    setWalletName(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletName');
  };

  const signTransaction = async (
    xdr: string,
    options: { networkPassphrase: string },
  ): Promise<string> => {
    if (!walletKit) throw new Error('WalletKit no disponible');
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
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
