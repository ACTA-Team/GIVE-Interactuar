import { ImageResponse } from 'next/og';
import { getCachedCredential } from './getCredential';

export const alt = 'Credencial verificable — Interactuar';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}) {
  const { credentialId } = await params;
  const credential = await getCachedCredential(credentialId);

  const claims = (credential?.publicClaims ?? {}) as Record<string, unknown>;
  const holderName =
    (claims.holderName as string | undefined) ??
    (claims.name as string | undefined) ??
    (claims.fullName as string | undefined) ??
    (claims.entrepreneurName as string | undefined) ??
    'Interactuar';

  const subtitle =
    credential?.credentialType === 'course_completion'
      ? `Constancia de finalización — ${(claims.courseName as string | undefined) ?? ''}`
      : (credential?.title ?? 'Credencial verificable');

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px',
        backgroundColor: '#021442',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            backgroundColor: '#ea4e2f',
            display: 'flex',
          }}
        />
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
            color: '#ffffff',
            textTransform: 'uppercase',
          }}
        >
          Interactuar
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span
          style={{
            fontSize: 22,
            color: '#20a7d1',
            textTransform: 'uppercase',
            letterSpacing: 3,
          }}
        >
          Credencial verificable
        </span>
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.1,
          }}
        >
          {holderName}
        </span>
        <span style={{ fontSize: 30, color: '#c7d2e8' }}>{subtitle}</span>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: 24,
        }}
      >
        <span style={{ fontSize: 20, color: '#8fa3c9' }}>
          interactuar.org.co
        </span>
        <span style={{ fontSize: 20, color: '#8fa3c9' }}>
          Emitida en blockchain (Stellar)
        </span>
      </div>
    </div>,
    { ...size },
  );
}
