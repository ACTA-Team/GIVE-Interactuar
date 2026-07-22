export type ClassStatus = 'abierta' | 'cerrada';

export interface ClassInfo {
  number: number;
  columnIndex: number;
  status: ClassStatus;
  scheduledAt: string | null;
}

// Title row (row 0) doubles as class metadata storage: under each "Clase N"
// column it holds "<status>|<scheduledAt-or-empty>", e.g. "Abierta|2026-07-22T08:00".
const TITLE_ROW_INDEX = 0;
const HEADER_ROW_INDEX = 1;

export function encodeClassCell(
  status: ClassStatus,
  scheduledAt: string | null,
): string {
  const label = status === 'abierta' ? 'Abierta' : 'Cerrada';
  return `${label}|${scheduledAt ?? ''}`;
}

function decodeClassCell(cell: unknown): {
  status: ClassStatus;
  scheduledAt: string | null;
} {
  const raw = String(cell ?? '').trim();
  const [statusPart, datePart] = raw.split('|');
  const status: ClassStatus =
    statusPart?.trim().toLowerCase() === 'abierta' ? 'abierta' : 'cerrada';
  const scheduledAt = datePart?.trim() ? datePart.trim() : null;
  return { status, scheduledAt };
}

export function parseClassColumns(rows: unknown[][]): ClassInfo[] {
  const titleRow = rows[TITLE_ROW_INDEX] ?? [];
  const headerRow = rows[HEADER_ROW_INDEX] ?? [];

  const classes: ClassInfo[] = [];
  let sequentialNumber = 0;

  headerRow.forEach((header, columnIndex) => {
    const headerText = String(header ?? '').trim();
    if (!headerText.toLowerCase().startsWith('clase')) return;

    sequentialNumber += 1;
    const match = headerText.match(/clase\s*(\d+)/i);
    const number = match ? Number(match[1]) : sequentialNumber;

    const { status, scheduledAt } = decodeClassCell(titleRow[columnIndex]);

    classes.push({ number, columnIndex, status, scheduledAt });
  });

  return classes;
}
