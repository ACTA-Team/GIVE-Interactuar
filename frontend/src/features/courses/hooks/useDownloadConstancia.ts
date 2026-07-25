'use client';

import { useMutation } from '@tanstack/react-query';

interface DownloadConstanciaInput {
  nombre: string;
  cedula: string;
  correo: string;
}

export function useDownloadConstancia(folderName: string) {
  return useMutation({
    mutationFn: async ({ nombre, cedula, correo }: DownloadConstanciaInput) => {
      const response = await fetch(
        `/api/courses/${encodeURIComponent(folderName)}/constancia`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cedula, correo }),
        },
      );

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? 'No se pudo generar la constancia');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `constancia-${nombre}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    },
  });
}
