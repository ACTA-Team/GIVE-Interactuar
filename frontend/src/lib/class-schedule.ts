import { formatDate } from '@/lib/helpers/date';

export type ClassStatus = 'abierta' | 'cerrada';

export interface ClassInfo {
  number: number;
  columnIndex: number;
  status: ClassStatus;
  scheduledAt: string | null;
}

const TITLE_ROW_INDEX = 0;

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

// Detection lives entirely in the title row's self-describing markers now
// — the header row (row 2) is purely a human-readable label (a date, once
// the class has one) and is never parsed. This also keeps this function as
// the single source of truth for "which columns are class columns, in what
// order", which attendance-parser.ts reuses instead of re-deriving its own
// (previously separate, positionally-coupled) list from header text.
export function parseClassColumns(rows: unknown[][]): ClassInfo[] {
  const titleRow = rows[TITLE_ROW_INDEX] ?? [];

  const classes: ClassInfo[] = [];
  titleRow.forEach((cell, columnIndex) => {
    const decoded = decodeClassCell(cell);
    if (!decoded) return;
    classes.push({
      number: decoded.number,
      columnIndex,
      status: decoded.status,
      scheduledAt: decoded.scheduledAt,
    });
  });

  return classes.sort((a, b) => a.number - b.number);
}

// Human-readable text written to the header row (row 2) for a class column
// — a date once the class has one (matches Interactuar's institutional
// attendance system convention), falling back to "Clase N" only if
// somehow created without a date.
export function formatClassColumnHeader(
  number: number,
  scheduledAt: string | null,
): string {
  if (!scheduledAt) return `Clase ${number}`;
  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return `Clase ${number}`;
  return formatDate(date);
}
