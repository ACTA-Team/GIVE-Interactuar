import type {
  IssueCourseCredentialInput,
  IssueCourseCredentialOutcome,
} from './issueCourseCredentialCore';

export async function requestIssueCourseCredential(
  params: IssueCourseCredentialInput,
): Promise<IssueCourseCredentialOutcome> {
  const res = await fetch('/api/certificates/issue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(body?.error ?? 'Error al emitir la credencial');
  }

  return body as IssueCourseCredentialOutcome;
}
