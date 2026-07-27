'use client';

import { useState, useCallback } from 'react';
import { useCredential, useActaClient } from '@acta-team/credentials';
import { useSmartWallet } from '@/hooks/useSmartWallet';
import type { AttendanceRecord } from '@/lib/attendance-parser';
import {
  issueCourseCredentialCore,
  type IssueCourseCredentialOutcome,
} from '../lib/issueCourseCredentialCore';

export type CourseCredentialStatus =
  | 'idle'
  | 'building_payload'
  | 'issuing'
  | 'success'
  | 'error';

export type CourseCredentialResult = IssueCourseCredentialOutcome;

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
        setStatus('issuing');

        const courseCredentialResult = await issueCourseCredentialCore(
          params,
          { contractId, actaClient, issue },
        );

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
