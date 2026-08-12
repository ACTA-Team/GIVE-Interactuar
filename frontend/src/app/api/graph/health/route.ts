import { NextResponse } from 'next/server';
import { getGraphClient } from '@/lib/graph';

// Dev-only verification route — not part of the product surface.
// Visit /api/graph/health to confirm the Graph connection works end-to-end.
export async function GET() {
  const siteId = process.env.MS_SITE_ID;
  if (!siteId) {
    return NextResponse.json(
      { ok: false, error: 'Missing MS_SITE_ID env var' },
      { status: 500 },
    );
  }

  try {
    const client = getGraphClient();
    const result = await client
      .api(`/sites/${siteId}/drive/root/children`)
      .get();

    const items = (result?.value ?? []).map(
      (item: { name?: string }) => item.name,
    );

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    // Surface the raw Graph error (status + message) as-is — this route is
    // for manual debugging, where 401 vs 403 vs 404 mean different things.
    const statusCode =
      typeof err === 'object' && err !== null && 'statusCode' in err
        ? Number((err as { statusCode: unknown }).statusCode) || 500
        : 500;

    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : err },
      { status: statusCode },
    );
  }
}
