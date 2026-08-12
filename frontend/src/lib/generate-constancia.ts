import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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
    const text = fields[key];
    const position = FIELD_POSITIONS[key];
    const font = position.bold ? boldFont : regularFont;
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
