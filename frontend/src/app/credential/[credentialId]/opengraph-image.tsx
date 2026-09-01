import { ImageResponse } from 'next/og';
import { getCachedCredential } from './getCredential';

// Next.js wires this up as the route's og:image automatically (file
// convention — no manual metadata.openGraph.images needed). Without an
// og:image, LinkedIn's share-offsite dialog can't build a link preview
// card and instead falls back to its raw "attach media yourself" post
// composer, which is what surfaced as "toca montar el archivo, sale un
// mensaje de error" — LinkedIn choking on a linked page with no image to
// scrape, not an error in this app's own upload flow.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface RouteParams {
  params: Promise<{ credentialId: string }>;
}

function extractHolderName(
  claims: Record<string, unknown>,
): string | undefined {
  return (
    (claims['holderName'] as string | undefined) ??
    (claims['name'] as string | undefined) ??
    (claims['fullName'] as string | undefined) ??
    (claims['entrepreneurName'] as string | undefined)
  );
}

export default async function OpengraphImage({ params }: RouteParams) {
  const { credentialId } = await params;
  const credential = await getCachedCredential(credentialId);

  const claims = credential?.publicClaims ?? {};
  const holderName = extractHolderName(claims) ?? 'Interactuar';
  const subtitle =
    credential?.credentialType === 'course_completion'
      ? ((claims['courseName'] as string | undefined) ?? 'Curso completado')
      : (credential?.title ?? 'Credencial verificable');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#021442',
          color: '#ffffff',
          padding: 80,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            letterSpacing: 4,
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: 28,
          }}
        >
          Interactuar · Credencial verificable
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          {holderName}
        </div>
        <div style={{ display: 'flex', fontSize: 32, opacity: 0.85 }}>
          {subtitle}
        </div>
      </div>
    ),
    { ...size },
  );
}
