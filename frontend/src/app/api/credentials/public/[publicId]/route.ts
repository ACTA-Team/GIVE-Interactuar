import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import { notFound, serverError } from '@/lib/api/errors';
import { transformKeys } from '@/lib/api/transform';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createCredentialRepository(supabase);
    const data = await repo.findByPublicId(publicId);
    if (!data) return notFound('Credential not found');
    return Response.json({ data: transformKeys(data) });
  } catch (err) {
    console.error('[credentials/public/:publicId] Error:', err);
    return serverError();
  }
}
