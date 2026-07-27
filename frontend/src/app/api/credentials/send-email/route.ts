import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendCredentialEmail } from '@/lib/email/resend';

const SendEmailSchema = z.object({
  to: z.string().email(),
  studentName: z.string().min(1),
  courseName: z.string().min(1),
  publicId: z.string().min(1),
});

// The student's email only ever lives in the SharePoint roster, not in the
// stored credential (publicClaims is publicly readable — we don't want an
// email address sitting in a public share page or its OG metadata). So this
// route is called right after issuance, while the caller still has the
// roster record in hand, instead of looking anything up from the credential.
export async function POST(request: Request) {
  const parsed = SendEmailSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { to, studentName, courseName, publicId } = parsed.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const credentialUrl = `${appUrl}/credential/${publicId}`;

  try {
    await sendCredentialEmail({ to, studentName, courseName, credentialUrl });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[credentials/send-email] Error:', err);
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'No se pudo enviar el correo', details: message },
      { status: 502 },
    );
  }
}
