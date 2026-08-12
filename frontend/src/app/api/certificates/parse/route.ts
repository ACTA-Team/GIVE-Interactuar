import { NextResponse } from 'next/server';
import { parseUploadedCourse } from '@/lib/course-upload';

// Stateless: parses the uploaded roster and returns it directly — nothing
// is written to Supabase or disk here. The parsed result only ever lives
// in the browser's React state until issuance (which persists the
// resulting *credentials*, never the roster) or "Limpiar información".
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('excel');
  const courseNameOverride = formData.get('courseName');

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Falta el archivo de Excel' },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const course = await parseUploadedCourse(
      buffer,
      file.name,
      typeof courseNameOverride === 'string' ? courseNameOverride : undefined,
    );
    return NextResponse.json({ ok: true, course });
  } catch (err) {
    console.error('[certificates/parse] Error:', err);
    const rawMessage = err instanceof Error ? err.message : String(err);
    // exceljs/jszip's "central directory" error means the buffer isn't a
    // real .xlsx (zip) file — most likely a legacy binary .xls saved with
    // an .xlsx extension. Surface something actionable instead of the raw
    // library message.
    const message = /central directory|end of data|not a zip/i.test(rawMessage)
      ? 'El archivo no es un .xlsx válido (¿es un .xls antiguo con la extensión cambiada?). Volvé a guardarlo en formato Excel (.xlsx) o subilo como .csv.'
      : rawMessage;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
