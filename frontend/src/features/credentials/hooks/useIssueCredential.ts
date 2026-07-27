'use client';

import { useState, useCallback } from 'react';
import { useCredential, useActaClient } from '@acta-team/credentials';
import { buildSignTransaction } from '@/lib/acta/signTransaction';
import { buildVCPayload, generateVcId } from '@/lib/acta/vcPayloadBuilder';
import {
  ACTA_ISSUANCE_SIMULATED,
  simulateIssuerIdentity,
  simulateIssueTx,
} from '@/lib/acta/simulateIssuance';
import { useSmartWallet } from '@/hooks/useSmartWallet';
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
  const actaClient = useActaClient();
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
        const vcId = generateVcId(params.credentialType, params.entrepreneurId);
        const signTransaction = buildSignTransaction();

        setStatus('building_payload');

        // Resolves the wallet's registered did:stellar, registering one
        // on-chain (a separate signature prompt) the first time this
        // wallet issues a credential. Cached by the SDK on every call after.
        const identity = ACTA_ISSUANCE_SIMULATED
          ? simulateIssuerIdentity(contractId)
          : await actaClient.getOrCreateIssuerIdentity({
              controller: contractId,
              signTransaction,
            });
        const issuerDid = identity.did;

        const vcPayload = buildVCPayload({
          credentialType: params.credentialType,
          formData: params.formData,
          entrepreneurId: params.entrepreneurId,
          entrepreneurName: params.entrepreneurName,
          businessName: params.businessName,
          issuerDid,
        });

        setStatus('issuing');

        const { txId } = ACTA_ISSUANCE_SIMULATED
          ? simulateIssueTx()
          : await issue({
              owner: contractId,
              vcId,
              vcData: JSON.stringify(vcPayload),
              issuer: contractId,
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
            metadata: ACTA_ISSUANCE_SIMULATED
              ? { simulated: true, simTxId: txId }
              : undefined,
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
    [issue, actaClient, wallet, contractId],
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
