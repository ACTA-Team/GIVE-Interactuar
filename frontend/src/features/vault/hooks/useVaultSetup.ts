'use client';

import { useState, useCallback } from 'react';
import { useVault } from '@acta-team/acta-sdk';
import { buildSignTransaction } from '@/lib/acta/signTransaction';

export type VaultSetupStatus =
  | 'idle'
  | 'creating_vault'
  | 'authorizing_issuer'
  | 'success'
  | 'error';

/**
 * Hook for ACTA vault creation and issuer authorisation.
 *
 * Every method takes an explicit `contractId` so callers don't need
 * the smart-wallet session to be restored at hook-level (important for
 * the unified setup-wallet flow where the wallet was just created).
 */
export function useVaultSetup() {
  const { createVault, authorizeIssuer } = useVault();

  const [status, setStatus] = useState<VaultSetupStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  const handleCreateVault = useCallback(
    async (ownerContractId: string) => {
      setError(null);
      setStatus('creating_vault');

      try {
        const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet';
        const ownerDid = `did:pkh:stellar:${network}:${ownerContractId}`;
        const signTransaction = buildSignTransaction();

        const { txId } = await createVault({
          owner: ownerContractId,
          ownerDid,
          signTransaction,
        });

        setLastTxId(txId);
        setStatus('success');
        return txId;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error creando el vault';
        setError(normalizeError(message));
        setStatus('error');
        return null;
      }
    },
    [createVault],
  );

  const handleAuthorizeIssuer = useCallback(
    async (ownerContractId: string, issuerAddress?: string) => {
      setError(null);
      setStatus('authorizing_issuer');

      try {
        const signTransaction = buildSignTransaction();

        const { txId } = await authorizeIssuer({
          owner: ownerContractId,
          issuer: issuerAddress ?? ownerContractId,
          signTransaction,
        });

        setLastTxId(txId);
        setStatus('success');
        return txId;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error autorizando el emisor';
        setError(normalizeError(message));
        setStatus('error');
        return null;
      }
    },
    [authorizeIssuer],
  );

  /**
   * Convenience: run createVault + authorizeIssuer sequentially.
   * Returns true when both succeed, false otherwise.
   * "Already exists" errors are treated as success.
   */
  const setupVault = useCallback(
    async (ownerContractId: string): Promise<boolean> => {
      const vaultTx = await handleCreateVault(ownerContractId);
      if (vaultTx === null && !isAlreadyExistsError(error)) return false;

      const authTx = await handleAuthorizeIssuer(ownerContractId);
      if (authTx === null && !isAlreadyExistsError(error)) return false;

      setStatus('success');
      return true;
    },
    [handleCreateVault, handleAuthorizeIssuer, error],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setLastTxId(null);
  }, []);

  return {
    handleCreateVault,
    handleAuthorizeIssuer,
    setupVault,
    status,
    error,
    lastTxId,
    isLoading: status === 'creating_vault' || status === 'authorizing_issuer',
    reset,
  };
}

function normalizeError(message: string): string {
  if (
    message.includes('denied') ||
    message.includes('cancel') ||
    message.includes('NotAllowed')
  ) {
    return 'Firma cancelada por el usuario.';
  }
  if (
    message.includes('already exists') ||
    message.includes('already initialized')
  ) {
    return 'El vault ya existe para esta wallet.';
  }
  if (message.includes('authorized')) {
    return 'El emisor ya está autorizado en este vault.';
  }
  return message;
}

function isAlreadyExistsError(err: string | null): boolean {
  if (!err) return false;
  return (
    err.includes('ya existe') ||
    err.includes('already exists') ||
    err.includes('already initialized') ||
    err.includes('ya está autorizado')
  );
}
