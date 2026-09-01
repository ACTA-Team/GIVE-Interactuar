import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export function formatFechaLine(date: Date = new Date()): string {
  return `Dado en Medellín, Antioquia en el mes de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}

export interface ConstanciaFields {
  nombre: string;
  cedula: string;
  curso: string;
  fecha: string;
}

interface FieldPosition {
  xPercent: number;
  yPercent: number; // measured from the TOP of the page, like design tools
  fontSize: number;
  bold?: boolean;
}

// Estimated from the real template's visual layout (images/Constancias.pdf).
// Needs a visual pass to fine-tune once the blank version of the template
// is confirmed in place — these are a reasonable starting point, not
// pixel-measured.
const FIELD_POSITIONS: Record<keyof ConstanciaFields, FieldPosition> = {
  nombre: { xPercent: 50, yPercent: 37.5, fontSize: 18, bold: true },
  cedula: { xPercent: 50, yPercent: 46.0, fontSize: 11 },
  curso: { xPercent: 50, yPercent: 54.6, fontSize: 14, bold: true },
  fecha: { xPercent: 50, yPercent: 61.1, fontSize: 10 },
};

const TEXT_COLOR = rgb(2 / 255, 20 / 255, 66 / 255); // matches the app's navy brand color

// Combining diacritical marks (U+0300–U+036F) — stripped from an NFD-
// normalized string to fall back accented Latin letters to their plain
// ASCII form, e.g. "ó" (o + U+0301) -> "o".
const COMBINING_MARKS_RE = /[̀-ͯ]/g;

// Last line of defense against unencodable text — the standard fonts use
// WinAnsi, which throws on anything outside it (emoji, some scripts, and
// notably U+FFFD, the replacement character an upstream encoding bug can
// leave behind — see course-upload.ts's normalizeCsvEncoding). Rather
// than let that exception take down the whole request (and with it, the
// public credential page), degrade the text so the PDF still renders:
// first try stripping accents (turns a mangled "ó" back into a plain
// "o" — better than nothing when the accent itself is what didn't
// survive), then replace whatever's still unencodable character-by-character.
function sanitizeForFont(font: PDFFont, text: string): string {
  const tryEncode = (candidate: string): boolean => {
    try {
      font.encodeText(candidate);
      return true;
    } catch {
      return false;
    }
  };

  if (tryEncode(text)) return text;

  const stripped = text.normalize('NFD').replace(COMBINING_MARKS_RE, '');
  if (tryEncode(stripped)) return stripped;

  return Array.from(stripped)
    .map((char) => (tryEncode(char) ? char : '?'))
    .join('');
}

export async function generateConstanciaPdf(
  templateBytes: Buffer,
  fields: ConstanciaFields,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  if (!page) {
    throw new Error('Certificate template has no pages');
  }

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  (Object.keys(fields) as (keyof ConstanciaFields)[]).forEach((key) => {
    const position = FIELD_POSITIONS[key];
    const font = position.bold ? boldFont : regularFont;
    const text = sanitizeForFont(font, fields[key]);
    const textWidth = font.widthOfTextAtSize(text, position.fontSize);

    const x = (position.xPercent / 100) * pageWidth - textWidth / 2;
    const y = pageHeight - (position.yPercent / 100) * pageHeight;

    page.drawText(text, {
      x,
      y,
      size: position.fontSize,
      font,
      color: TEXT_COLOR,
    });
  });

  return pdfDoc.save();
}
