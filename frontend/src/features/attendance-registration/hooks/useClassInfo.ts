'use client';

import { useQuery } from '@tanstack/react-query';

export interface ClassInfoResponse {
  ok: true;
  courseName: string;
  classNumber: number;
  scheduledAt: string | null;
  status: 'abierta' | 'cerrada';
}

export function useClassInfo(folderName: string, classNumber: string) {
  return useQuery<ClassInfoResponse>({
    queryKey: ['asistencia', folderName, classNumber],
    queryFn: async () => {
      const response = await fetch(
        `/api/asistencia/${encodeURIComponent(folderName)}/${classNumber}`,
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? 'No se pudo cargar la sesión');
      }
      return response.json();
    },
  });
}
