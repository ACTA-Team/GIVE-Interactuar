// Server-only module: uses the Resend secret key, never import from a
// "use client" file.
import { Resend } from 'resend';

export interface SendCredentialEmailParams {
  to: string;
  studentName: string;
  courseName: string;
  credentialUrl: string;
}

function buildEmailHtml({
  studentName,
  courseName,
  credentialUrl,
}: SendCredentialEmailParams): string {
  return `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; background:#f1f3ea; padding: 32px 16px;">
    <div style="max-width: 480px; margin: 0 auto; background:#ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e5d8;">
      <div style="background:#021442; padding: 24px 32px;">
        <span style="color:#ffffff; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Interactuar</span>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color:#1f2b23; margin: 0 0 16px;">Hola ${studentName},</p>
        <p style="font-size: 15px; color:#4b5b4f; line-height: 1.6; margin: 0 0 24px;">
          Completaste satisfactoriamente el curso <strong>${courseName}</strong>.
          Ya puedes ver y compartir tu constancia verificable:
        </p>
        <a href="${credentialUrl}" style="display:inline-block; background:#021442; color:#ffffff; text-decoration:none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
          Ver mi constancia
        </a>
        <p style="font-size: 12px; color:#7c8877; margin: 24px 0 0; word-break: break-all;">
          ${credentialUrl}
        </p>
      </div>
    </div>
  </div>`;
}

export async function sendCredentialEmail(
  params: SendCredentialEmailParams,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY no está configurada');
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: `Tu constancia de finalización — ${params.courseName}`,
    html: buildEmailHtml(params),
  });

  if (error) {
    throw new Error(error.message);
  }
}
