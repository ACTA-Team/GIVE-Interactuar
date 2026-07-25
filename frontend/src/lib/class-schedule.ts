export type ClassStatus = 'abierta' | 'cerrada';

export interface ClassInfo {
  number: number;
  columnIndex: number;
  status: ClassStatus;
  scheduledAt: string | null;
}

const TITLE_ROW_INDEX = 0;
const HEADER_ROW_INDEX = 1;

// The title row (row 0) doubles as class metadata storage. Each marker cell
// embeds its own class number ("Clase 5|Abierta|2026-07-22T08:00") instead
// of relying on sitting in the same column as the "Clase 5" header — a
// professor reordering/renaming columns by hand in Excel moves a cell's own
// value with it, but there's no guarantee a *different* cell in another row
// stays aligned to the same column index. Scanning the whole row for a
// self-describing marker survives that kind of manual reordering; strict
// positional pairing doesn't.
export function encodeClassCell(
  classNumber: number,
  status: ClassStatus,
  scheduledAt: string | null,
): string {
  const label = status === 'abierta' ? 'Abierta' : 'Cerrada';
  return `Clase ${classNumber}|${label}|${scheduledAt ?? ''}`;
}

function decodeClassCell(
  cell: unknown,
): { number: number; status: ClassStatus; scheduledAt: string | null } | null {
  const raw = String(cell ?? '').trim();
  const match = raw.match(/^clase\s*(\d+)\s*\|([^|]*)\|(.*)$/i);
  if (!match) return null;

  const status: ClassStatus =
    match[2].trim().toLowerCase() === 'abierta' ? 'abierta' : 'cerrada';
  const scheduledAt = match[3].trim() ? match[3].trim() : null;

  return { number: Number(match[1]), status, scheduledAt };
}

export function parseClassColumns(rows: unknown[][]): ClassInfo[] {
  const titleRow = rows[TITLE_ROW_INDEX] ?? [];
  const headerRow = rows[HEADER_ROW_INDEX] ?? [];

  const statusByNumber = new Map<
    number,
    { status: ClassStatus; scheduledAt: string | null }
  >();
  titleRow.forEach((cell) => {
    const decoded = decodeClassCell(cell);
    if (decoded) statusByNumber.set(decoded.number, decoded);
  });

  const classes: ClassInfo[] = [];
  let sequentialNumber = 0;

  headerRow.forEach((header, columnIndex) => {
    const headerText = String(header ?? '').trim();
    if (!headerText.toLowerCase().startsWith('clase')) return;

    sequentialNumber += 1;
    const match = headerText.match(/clase\s*(\d+)/i);
    const number = match ? Number(match[1]) : sequentialNumber;

    const found = statusByNumber.get(number);
    classes.push({
      number,
      columnIndex,
      status: found?.status ?? 'cerrada',
      scheduledAt: found?.scheduledAt ?? null,
    });
  });

  return classes;
}
