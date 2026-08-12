export interface RequestCredentialEmailParams {
  to: string;
  studentName: string;
  courseName: string;
  publicId: string;
}

export async function requestCredentialEmail(
  params: RequestCredentialEmailParams,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/credentials/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return { ok: false, error: body?.error ?? 'Error al enviar el correo' };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Error de red al enviar el correo' };
  }
}
