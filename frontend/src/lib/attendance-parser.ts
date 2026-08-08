import { parseClassColumns } from './class-schedule';

export interface AttendanceRecord {
  nombre: string;
  correo: string;
  empresa: string;
  telefono: string;
  cedula: string;
  asistencia: { clase: string; asistio: boolean }[];
}

export type FixedField =
  | 'nombre'
  | 'correo'
  | 'empresa'
  | 'telefono'
  | 'cedula';

// A field can be labeled differently across course sheets (e.g. someone
// renamed "Cédula" to "NumDocumento") — match on any known alias.
const FIXED_COLUMNS: Record<FixedField, string[]> = {
  nombre: ['nombre'],
  correo: ['correo'],
  empresa: ['empresa'],
  telefono: ['telefono'],
  cedula: ['cedula', 'numdocumento', 'documento', 'identificacion'],
};

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeHeader(header: unknown): string {
  return String(header ?? '').trim();
}

export function isRowEmpty(row: unknown[]): boolean {
  return row.every((cell) => String(cell ?? '').trim() === '');
}

// The real workbook has a title row above the header row
// (e.g. ["Curso", "Levantamiento de Capital", ...]), so headers live in row 1.
export const HEADER_ROW_INDEX = 1;

export interface HeaderColumns {
  fixed: Partial<Record<FixedField, number>>;
  classColumns: { clase: string; index: number }[];
}

export function parseHeaderColumns(rows: unknown[][]): HeaderColumns {
  const headerRow = rows[HEADER_ROW_INDEX] ?? [];
  const headers = headerRow.map(normalizeHeader);

  const fixed: Partial<Record<FixedField, number>> = {};

  headers.forEach((header, index) => {
    const key = stripDiacritics(header.toLowerCase());
    const fixedMatch = (Object.keys(FIXED_COLUMNS) as FixedField[]).find(
      (field) => FIXED_COLUMNS[field].includes(key),
    );
    if (fixedMatch) fixed[fixedMatch] = index;
  });

  // Same column set/order as class-schedule.ts's parseClassColumns (which
  // reads the row-1 markers, not this header text) — kept in sync by
  // construction instead of by two independent filters agreeing by luck.
  const classColumns = parseClassColumns(rows).map(({ number, columnIndex }) => ({
    clase: headers[columnIndex] || `Clase ${number}`,
    index: columnIndex,
  }));

  return { fixed, classColumns };
}

export function parseAttendanceSheet(rows: unknown[][]): AttendanceRecord[] {
  const { fixed, classColumns } = parseHeaderColumns(rows);
  const dataRows = rows.slice(HEADER_ROW_INDEX + 1);

  const records: AttendanceRecord[] = [];
  for (const row of dataRows) {
    if (isRowEmpty(row)) break;

    records.push({
      nombre: String(row[fixed.nombre ?? -1] ?? '').trim(),
      correo: String(row[fixed.correo ?? -1] ?? '').trim(),
      empresa: String(row[fixed.empresa ?? -1] ?? '').trim(),
      telefono: String(row[fixed.telefono ?? -1] ?? '').trim(),
      cedula: String(row[fixed.cedula ?? -1] ?? '').trim(),
      asistencia: classColumns.map(({ clase, index }) => ({
        clase,
        // Empty cells cover both "absent" and "class not held yet" —
        // the sheet has no way to tell those apart.
        asistio:
          String(row[index] ?? '')
            .trim()
            .toLowerCase() === 'x',
      })),
    });
  }

  return records;
}
