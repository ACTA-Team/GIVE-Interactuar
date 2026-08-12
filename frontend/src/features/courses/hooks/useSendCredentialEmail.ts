'use client';

import { useState, useCallback } from 'react';
import {
  requestCredentialEmail,
  type RequestCredentialEmailParams,
} from '../lib/requestCredentialEmail';

export type SendEmailStatus = 'idle' | 'sending' | 'sent' | 'error';

export function useSendCredentialEmail() {
  const [status, setStatus] = useState<SendEmailStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (params: RequestCredentialEmailParams) => {
    setStatus('sending');
    setError(null);

    const result = await requestCredentialEmail(params);

    if (result.ok) {
      setStatus('sent');
    } else {
      setStatus('error');
      setError(result.error ?? 'Error al enviar el correo');
    }

    return result.ok;
  }, []);

  return { send, status, error };
}
