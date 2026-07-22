export interface AttendanceRecord {
  nombre: string;
  correo: string;
  empresa: string;
  telefono: string;
  asistencia: { clase: string; asistio: boolean }[];
}

const FIXED_COLUMNS = {
  nombre: 'nombre',
  correo: 'correo',
  empresa: 'empresa',
  telefono: 'telefono',
} as const;

function normalizeHeader(header: unknown): string {
  return String(header ?? '').trim();
}

function isRowEmpty(row: unknown[]): boolean {
  return row.every((cell) => String(cell ?? '').trim() === '');
}

// The real workbook has a title row above the header row
// (e.g. ["Curso", "Levantamiento de Capital", ...]), so headers live in row 1.
const HEADER_ROW_INDEX = 1;

export function parseAttendanceSheet(rows: unknown[][]): AttendanceRecord[] {
  const headerRow = rows[HEADER_ROW_INDEX] ?? [];
  const headers = headerRow.map(normalizeHeader);

  const fixedColumnIndex: Partial<Record<keyof typeof FIXED_COLUMNS, number>> =
    {};
  const classColumns: { clase: string; index: number }[] = [];

  headers.forEach((header, index) => {
    const key = header.toLowerCase();
    const fixedMatch = (
      Object.keys(FIXED_COLUMNS) as (keyof typeof FIXED_COLUMNS)[]
    ).find((field) => FIXED_COLUMNS[field] === key);

    if (fixedMatch) {
      fixedColumnIndex[fixedMatch] = index;
    } else if (key.startsWith('clase')) {
      classColumns.push({ clase: header, index });
    }
  });

  const dataRows = rows.slice(HEADER_ROW_INDEX + 1);

  const records: AttendanceRecord[] = [];
  for (const row of dataRows) {
    if (isRowEmpty(row)) break;

    records.push({
      nombre: String(row[fixedColumnIndex.nombre ?? -1] ?? '').trim(),
      correo: String(row[fixedColumnIndex.correo ?? -1] ?? '').trim(),
      empresa: String(row[fixedColumnIndex.empresa ?? -1] ?? '').trim(),
      telefono: String(row[fixedColumnIndex.telefono ?? -1] ?? '').trim(),
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
