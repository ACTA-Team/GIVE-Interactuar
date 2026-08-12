import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import { createCredentialService } from '@/features/credentials/services/credentialService';
import { getCourseTemplatePdf } from '@/lib/course-template';
import { getCourseTemplate } from '@/lib/supabase/storage';
import {
  generateConstanciaPdf,
  formatFechaLine,
} from '@/lib/generate-constancia';

interface RouteParams {
  params: Promise<{ publicId: string }>;
}

interface CourseCompletionClaims {
  holderName?: string;
  studentDocument?: string;
  courseName?: string;
  completedAt?: string;
}

// Public endpoint backing the PDF preview/download on /credential/[id].
// Renders the same per-course template used by the professor dashboard's
// "Descargar constancia" button, but stamped from the credential's stored
// claims (a snapshot at issuance time) instead of live SharePoint data —
// the credential is already the proof that eligibility was met.
export async function GET(request: Request, { params }: RouteParams) {
  const { publicId } = await params;
  const download = new URL(request.url).searchParams.get('download') === '1';

  const supabase = await createServerSupabaseClient();
  const repo = createCredentialRepository(supabase);
  const service = createCredentialService(repo);

  const credential = await service.getByPublicId(publicId);

  if (!credential || credential.credentialType !== 'course_completion') {
    return NextResponse.json(
      { error: 'Credencial no encontrada' },
      { status: 404 },
    );
  }

  const claims = credential.publicClaims as CourseCompletionClaims;

  if (!claims.holderName || !claims.courseName) {
    return NextResponse.json(
      { error: 'La credencial no tiene los datos necesarios' },
      { status: 422 },
    );
  }

  const templatePath = (credential.metadata as { templatePath?: string })
    ?.templatePath;

  let templateBytes: Buffer;
  try {
    // Upload-based flow: template stored in Supabase Storage at issuance.
    // Older SharePoint-based flow: no templatePath on the credential —
    // fall back to the live course-folder lookup, unchanged.
    templateBytes = templatePath
      ? await getCourseTemplate(templatePath)
      : (await getCourseTemplatePdf(claims.courseName)).bytes;
  } catch {
    return NextResponse.json(
      { error: 'No se encontró la plantilla de constancia para este curso' },
      { status: 404 },
    );
  }

  const fecha = formatFechaLine(
    new Date(claims.completedAt ?? credential.issuedAt ?? Date.now()),
  );

  const pdfBytes = await generateConstanciaPdf(templateBytes, {
    nombre: claims.holderName,
    cedula: claims.studentDocument ?? '',
    curso: claims.courseName,
    fecha,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="constancia-${claims.holderName}.pdf"`,
    },
  });
}
