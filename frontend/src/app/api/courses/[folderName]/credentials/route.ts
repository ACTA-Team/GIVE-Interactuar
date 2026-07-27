import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import { createCredentialService } from '@/features/credentials/services/credentialService';

interface RouteParams {
  params: Promise<{ folderName: string }>;
}

// Lets the course detail page know which students already have a
// course_completion credential, so "Emitir" can render as "Ver credencial"
// instead of allowing a duplicate on-chain issuance.
export async function GET(_request: Request, { params }: RouteParams) {
  const { folderName: rawFolderName } = await params;
  const folderName = decodeURIComponent(rawFolderName);

  const supabase = await createServerSupabaseClient();
  const repo = createCredentialRepository(supabase);
  const service = createCredentialService(repo);

  const credentials =
    await service.listCourseCompletionByCourseName(folderName);

  return NextResponse.json({
    data: credentials
      .filter((c) => c.entrepreneurId)
      .map((c) => ({
        subjectId: c.entrepreneurId,
        publicId: c.publicId,
      })),
  });
}
