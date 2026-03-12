'use client';

import { useState, useCallback } from 'react';
import { useVaultRead } from '@acta-team/acta-sdk';
import { useWalletContext } from '@/lib/stellar/WalletContext';

export type VerificationStatus =
  | 'idle'
  | 'verifying'
  | 'valid'
  | 'invalid'
  | 'error';

export interface VerificationResult {
  isValid: boolean;
  vcData: Record<string, unknown> | null;
  error: string | null;
}

export function useVerifyOnChain() {
  const { verifyVc } = useVaultRead();
  const { walletAddress } = useWalletContext();

  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [result, setResult] = useState<VerificationResult | null>(null);

  const verify = useCallback(
    async (actaVcId: string, ownerAddress?: string) => {
      const owner = ownerAddress ?? walletAddress;
      if (!owner) {
        setStatus('error');
        setResult({
          isValid: false,
          vcData: null,
          error: 'No wallet connected',
        });
        return null;
      }

      setStatus('verifying');
      setResult(null);

      try {
        const verification = await verifyVc({ owner, vcId: actaVcId });

        if (verification.isValid) {
          const vcData = JSON.parse(verification.vcData);
          const res = { isValid: true, vcData, error: null };
          setResult(res);
          setStatus('valid');
          return res;
        } else {
          const res: VerificationResult = {
            isValid: false,
            vcData: null,
            error: null,
          };
          setResult(res);
          setStatus('invalid');
          return res;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error verificando credencial';
        const res: VerificationResult = {
          isValid: false,
          vcData: null,
          error: message,
        };
        setResult(res);
        setStatus('error');
        return res;
      }
    },
    [verifyVc, walletAddress],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
  }, []);

  return { verify, status, result, reset };
}
