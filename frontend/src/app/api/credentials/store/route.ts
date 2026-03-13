import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const StoreCredentialSchema = z.object({
  entrepreneurId: z.string().min(1),
  credentialType: z.enum(['impact', 'behavior', 'profile', 'mba']),
  title: z.string().min(1),
  description: z.string().optional(),
  actaVcId: z.string().min(1),
  issuerDid: z.string().min(1),
  publicClaims: z.record(z.unknown()).optional(),
  createdBy: z.string().optional(),
});

/**
 * POST /api/credentials/store
 *
 * Persists a credential record to Supabase after successful ACTA on-chain issuance.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = StoreCredentialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      entrepreneurId,
      credentialType,
      title,
      description,
      actaVcId,
      issuerDid,
      publicClaims,
      createdBy,
    } = parsed.data;

    const supabase = await createServerSupabaseClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('credentials')
      .insert({
        entrepreneur_id: entrepreneurId,
        credential_type: credentialType,
        status: 'issued',
        title,
        description: description ?? null,
        acta_vc_id: actaVcId,
        issuer_did: issuerDid,
        issued_at: new Date().toISOString(),
        public_claims: publicClaims ?? {},
        metadata: {},
        created_by: createdBy,
      })
      .select('id, public_id')
      .single();

    if (error) {
      console.error('[credentials/store] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al guardar credencial', details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[credentials/store] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
