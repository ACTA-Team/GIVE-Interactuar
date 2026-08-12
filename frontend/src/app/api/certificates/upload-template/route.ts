import { NextResponse } from 'next/server';
import { uploadCourseTemplate } from '@/lib/supabase/storage';

// Called once per issuance batch (not once per student) — the review step
// uploads the blank PDF template right before issuing, gets back a storage
// key, and reuses that same key for every student's credential in the
// batch. Nothing else about the roster touches this endpoint.
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('template');

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Falta el archivo de plantilla PDF' },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${crypto.randomUUID()}.pdf`;

  try {
    await uploadCourseTemplate(key, buffer);
  } catch (err) {
    console.error('[certificates/upload-template] Error:', err);
    return NextResponse.json(
      { error: 'No se pudo guardar la plantilla' },
      { status: 500 },
    );
  }

  return NextResponse.json({ templatePath: key });
}
