'use client';

import { useState, useCallback } from 'react';
import { useCredential } from '@acta-team/acta-sdk';
import { useWalletContext } from '@/lib/stellar/WalletContext';
import { useWalletKit } from '@/lib/stellar/useWalletKit';
import { buildVCPayload, generateVcId } from '@/lib/acta/vcPayloadBuilder';
import type { CredentialType } from '../types';
import { CREDENTIAL_TYPE_LABELS } from '../types';
import type { ImpactCredentialFormInput } from '../schemas/impactCredentialSchema';
import type { BehaviorCredentialFormInput } from '../schemas/behaviorCredentialSchema';
import type { ProfileCredentialFormInput } from '../schemas/profileCredentialSchema';
import type { MbaCredentialFormInput } from '../schemas/mbaCredentialSchema';

type FormData =
  | ImpactCredentialFormInput
  | BehaviorCredentialFormInput
  | ProfileCredentialFormInput
  | MbaCredentialFormInput;

export type IssuanceStatus =
  | 'idle'
  | 'connecting_wallet'
  | 'building_payload'
  | 'issuing'
  | 'success'
  | 'error';

export interface IssuanceResult {
  vcId: string;
  txId: string;
  issuerAddress: string;
  issuerDid: string;
}

export function useIssueCredential() {
  const { issue } = useCredential();
  const { walletAddress, connected, signTransaction } = useWalletContext();
  const { connectWithWalletKit } = useWalletKit();

  const [status, setStatus] = useState<IssuanceStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IssuanceResult | null>(null);

  const issueCredential = useCallback(
    async (params: {
      credentialType: CredentialType;
      formData: FormData;
      entrepreneurId: string;
      entrepreneurName: string;
      businessName: string;
    }) => {
      setError(null);
      setResult(null);

      try {
        let address = walletAddress;

        if (!connected || !address) {
          setStatus('connecting_wallet');
          address = await connectWithWalletKit();
        }

        const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet';
        const issuerDid = `did:pkh:stellar:${network}:${address}`;
        const holderDid = `did:pkh:stellar:${network}:${address}`;
        const vcId = generateVcId(params.credentialType, params.entrepreneurId);

        setStatus('building_payload');

        const vcPayload = buildVCPayload({
          credentialType: params.credentialType,
          formData: params.formData,
          entrepreneurId: params.entrepreneurId,
          entrepreneurName: params.entrepreneurName,
          businessName: params.businessName,
          issuerDid,
        });

        setStatus('issuing');

        const { txId } = await issue({
          owner: address,
          vcId,
          vcData: JSON.stringify(vcPayload),
          issuer: address,
          holder: holderDid,
          issuerDid,
          signTransaction,
        });

        const issuanceResult: IssuanceResult = {
          vcId,
          txId,
          issuerAddress: address,
          issuerDid,
        };

        setResult(issuanceResult);
        setStatus('success');

        try {
          await fetch('/api/credentials/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entrepreneurId: params.entrepreneurId,
              credentialType: params.credentialType,
              title: `${CREDENTIAL_TYPE_LABELS[params.credentialType]} — ${params.entrepreneurName}`,
              description: `Credencial emitida para ${params.businessName}`,
              actaVcId: vcId,
              issuerDid,
              publicClaims: vcPayload.credentialSubject,
            }),
          });
        } catch {
          // Non-blocking: credential was issued on-chain even if local persistence fails
        }

        return issuanceResult;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Error desconocido al emitir la credencial';

        if (message.includes('denied') || message.includes('cancel')) {
          setError('Transacción cancelada por el usuario.');
        } else if (message.includes('authorized')) {
          setError(
            'El emisor no está autorizado. Debes autorizar tu wallet en el vault primero.',
          );
        } else if (
          message.includes('Freighter') ||
          message.includes('wallet') ||
          message.includes('instalado') ||
          message.includes('WalletKit')
        ) {
          setError(
            'No se pudo conectar la wallet. Asegúrate de tener Freighter instalado.',
          );
        } else {
          setError(message);
        }

        setStatus('error');
        return null;
      }
    },
    [issue, walletAddress, connected, signTransaction, connectWithWalletKit],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
  }, []);

  return {
    issueCredential,
    status,
    error,
    result,
    reset,
    walletAddress,
    walletConnected: connected,
  };
}
