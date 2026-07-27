'use client';

import { useState, useCallback } from 'react';
import { useCredential, useActaClient } from '@acta-team/credentials';
import { buildSignTransaction } from '@/lib/acta/signTransaction';
import { buildVCPayload, generateVcId } from '@/lib/acta/vcPayloadBuilder';
import { useSmartWallet } from '@/hooks/useSmartWallet';
import { CREDENTIAL_TYPE_LABELS } from '@/features/credentials/types';
import type { AttendanceRecord } from '@/lib/attendance-parser';

export type CourseCredentialStatus =
  | 'idle'
  | 'building_payload'
  | 'issuing'
  | 'success'
  | 'error';

export interface CourseCredentialResult {
  vcId: string;
  txId: string;
  issuerAddress: string;
  issuerDid: string;
  publicId: string | null;
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export interface IssueCourseCredentialParams {
  student: AttendanceRecord;
  courseName: string;
  classesAttended: number;
  classesTotal: number;
  attendancePercent: number;
  attendanceThreshold: number;
}

export function useIssueCourseCredential() {
  const { issue } = useCredential();
  const actaClient = useActaClient();
  const { wallet, contractId } = useSmartWallet();

  const [status, setStatus] = useState<CourseCredentialStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CourseCredentialResult | null>(null);

  const issueCourseCredential = useCallback(
    async (params: IssueCourseCredentialParams) => {
      setError(null);
      setResult(null);

      if (!wallet || !contractId) {
        setError('No hay wallet conectada. Reconectá tu passkey.');
        setStatus('error');
        return null;
      }

      try {
        const subjectId =
          params.student.cedula.trim() || normalize(params.student.correo);
        const vcId = generateVcId('course_completion', subjectId);
        const signTransaction = buildSignTransaction();

        setStatus('building_payload');

        // Resolves the wallet's registered did:stellar, registering one
        // on-chain (a separate signature prompt) the first time this
        // wallet issues a credential. Cached by the SDK on every call after.
        const identity = await actaClient.getOrCreateIssuerIdentity({
          controller: contractId,
          signTransaction,
        });
        const issuerDid = identity.did;

        const vcPayload = buildVCPayload({
          credentialType: 'course_completion',
          formData: {
            studentName: params.student.nombre,
            studentDocument: params.student.cedula,
            courseName: params.courseName,
            classesAttended: params.classesAttended,
            classesTotal: params.classesTotal,
            attendancePercent: params.attendancePercent,
            attendanceThreshold: params.attendanceThreshold,
            completedAt: new Date().toISOString(),
          },
          entrepreneurId: subjectId,
          entrepreneurName: params.student.nombre,
          businessName: params.courseName,
          issuerDid,
        });

        setStatus('issuing');

        const { txId } = await issue({
          owner: contractId,
          vcId,
          vcData: JSON.stringify(vcPayload),
          issuer: contractId,
          issuerDid,
          signTransaction,
        });

        const title = `${CREDENTIAL_TYPE_LABELS.course_completion} — ${params.student.nombre}`;

        const storeResponse = await fetch('/api/credentials/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credentialType: 'course_completion',
            title,
            description: `Emitido para ${params.student.nombre} — Curso: ${params.courseName}`,
            actaVcId: vcId,
            issuerDid,
            publicClaims: vcPayload.credentialSubject,
          }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null);

        const courseCredentialResult: CourseCredentialResult = {
          vcId,
          txId,
          issuerAddress: contractId,
          issuerDid,
          publicId: storeResponse?.data?.public_id ?? null,
        };

        setResult(courseCredentialResult);
        setStatus('success');

        return courseCredentialResult;
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
    issueCourseCredential,
    status,
    error,
    result,
    reset,
    walletConnected: !!wallet,
  };
}
