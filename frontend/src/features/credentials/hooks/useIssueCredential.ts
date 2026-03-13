'use client';

import { useState, useCallback } from 'react';
import { useCredential } from '@acta-team/acta-sdk';
import { buildSignTransaction } from '@/lib/acta/signTransaction';
import { buildVCPayload, generateVcId } from '@/lib/acta/vcPayloadBuilder';
import { useSmartWallet } from '@/hooks/useSmartWallet';
import type { CredentialType } from '../types';
import { CREDENTIAL_TYPE_LABELS } from '../types';
import type { ImpactCredentialFormInput } from '../schemas/impactCredentialSchema';
import type { BehaviorCredentialFormInput } from '../schemas/behaviorCredentialSchema';
import type { ProfileCredentialFormInput } from '../schemas/profileCredentialSchema';

type FormData =
  | ImpactCredentialFormInput
  | BehaviorCredentialFormInput
  | ProfileCredentialFormInput;

export type IssuanceStatus =
  | 'idle'
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
  const { wallet, contractId } = useSmartWallet();

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

      if (!wallet || !contractId) {
        setError('No hay wallet conectada. Reconectá tu passkey.');
        setStatus('error');
        return null;
      }

      try {
        const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet';
        const issuerDid = `did:pkh:stellar:${network}:${contractId}`;
        const holderDid = issuerDid;
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

        const signTransaction = buildSignTransaction();

        const { txId } = await issue({
          owner: contractId,
          vcId,
          vcData: JSON.stringify(vcPayload),
          issuer: contractId,
          holder: holderDid,
          issuerDid,
          signTransaction,
        });

        const issuanceResult: IssuanceResult = {
          vcId,
          txId,
          issuerAddress: contractId,
          issuerDid,
        };

        setResult(issuanceResult);
        setStatus('success');

        // Persist to Supabase (non-blocking)
        fetch('/api/credentials/store', {
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
        }).catch(() => {
          // Non-blocking: credential was issued on-chain even if local persistence fails
        });

        return issuanceResult;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Error desconocido al emitir la credencial';

        if (
          message.includes('denied') ||
          message.includes('cancel') ||
          message.includes('NotAllowed')
        ) {
          setError('Firma cancelada por el usuario.');
        } else if (message.includes('authorized')) {
          setError(
            'El emisor no está autorizado. Autorizá tu wallet en el vault primero.',
          );
        } else {
          setError(message);
        }

        setStatus('error');
        return null;
      }
    },
    [issue, wallet, contractId],
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
    walletAddress: contractId,
    walletConnected: !!wallet,
  };
}
