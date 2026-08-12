'use client';

import { useMutation } from '@tanstack/react-query';

export interface AttendanceFormValues {
  nombre: string;
  correo: string;
  cedula: string;
}

export function useSubmitAttendance(folderName: string, classNumber: string) {
  return useMutation({
    mutationFn: async (values: AttendanceFormValues) => {
      const response = await fetch(
        `/api/asistencia/${encodeURIComponent(folderName)}/${classNumber}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? 'No se pudo registrar tu asistencia');
      }
      return response.json() as Promise<{ ok: true }>;
    },
  });
}
