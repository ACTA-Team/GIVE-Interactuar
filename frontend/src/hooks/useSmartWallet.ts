'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ConnectWalletResult } from 'smart-account-kit';
import { getSmartAccountKit } from '@/lib/smart-account/config';

export type SmartWalletStatus =
  | 'idle'
  | 'loading'
  | 'creating'
  | 'connecting'
  | 'ready'
  | 'error';

export function useSmartWallet() {
  const [wallet, setWallet] = useState<ConnectWalletResult | null>(null);
  const [status, setStatus] = useState<SmartWalletStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  // Auto-restore session on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const kit = getSmartAccountKit();
        const result = await kit.connectWallet();
        setWallet(result);
        setStatus('ready');
      } catch {
        // No existing session — that's fine
        setStatus('idle');
      }
    };
    restore();
  }, []);

  // Listen for session expiration
  useEffect(() => {
    try {
      const kit = getSmartAccountKit();
      const handler = () => {
        setWallet(null);
        setStatus('idle');
      };
      kit.events.on('sessionExpired', handler);
      return () => kit.events.off('sessionExpired', handler);
    } catch {
      return undefined;
    }
  }, []);

  const createWallet = useCallback(async (userName: string) => {
    setError(null);
    setStatus('creating');
    try {
      const kit = getSmartAccountKit();
      const nativeTokenContract = process.env.NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT;
      const result = await kit.createWallet('Interactuar', userName, {
        autoSubmit: true,
        autoFund: true,
        nativeTokenContract: nativeTokenContract ?? undefined,
      });
      const connected = await kit.connectWallet();
      setWallet(connected);
      setStatus('ready');
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error creando wallet';
      setError(msg);
      setStatus('error');
      throw err;
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setStatus('connecting');
    try {
      const kit = getSmartAccountKit();
      const result = await kit.connectWallet({ prompt: true });
      setWallet(result);
      setStatus('ready');
      return result;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Error conectando wallet';
      setError(msg);
      setStatus('error');
      throw err;
    }
  }, []);

  const disconnect = useCallback(async () => {
    const kit = getSmartAccountKit();
    await kit.disconnect();
    setWallet(null);
    setStatus('idle');
  }, []);

  return {
    wallet,
    status,
    error,
    isLoading: status === 'loading',
    isCreating: status === 'creating',
    isConnecting: status === 'connecting',
    isReady: status === 'ready',
    contractId: wallet?.contractId ?? null,
    createWallet,
    connect,
    disconnect,
  };
}
