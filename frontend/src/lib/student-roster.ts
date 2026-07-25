// Server-only module: no "use client" directive, and must not be imported
// from any file that has one.
import { writeExcelRange, readExcelRange } from '@/lib/graph-sharepoint';
import { getCourseWorkbook } from '@/lib/course-workbook';
import { parseClassColumns } from '@/lib/class-schedule';
import {
  parseHeaderColumns,
  isRowEmpty,
  HEADER_ROW_INDEX,
} from '@/lib/attendance-parser';
import { columnIndexToLetter } from '@/lib/excel-utils';

export interface AttendanceSubmission {
  nombre: string;
  correo: string;
  cedula: string;
}

export type RegisterAttendanceResult =
  | { status: 'ok' }
  | { status: 'class-not-found' }
  | { status: 'class-closed' };

function normalizeForMatch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function findRowByColumn(
  dataRows: unknown[][],
  columnIndex: number,
  key: string,
): number | null {
  if (!key) return null;
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (isRowEmpty(row)) break;
    if (normalizeForMatch(String(row[columnIndex] ?? '')) === key) {
      return i;
    }
  }
  return null;
}

const MAX_APPEND_RETRIES = 5;

// Data rows start right after the header row in the full `rows` array
// returned by usedRange.
const DATA_ROW_OFFSET = HEADER_ROW_INDEX + 1;

export async function registerAttendance(
  folderName: string,
  classNumber: number,
  submission: AttendanceSubmission,
): Promise<RegisterAttendanceResult> {
  const { file, sheetName, rows } = await getCourseWorkbook(folderName);

  const classes = parseClassColumns(rows);
  const targetClass = classes.find((c) => c.number === classNumber);
  if (!targetClass) {
    return { status: 'class-not-found' };
  }
  if (targetClass.status !== 'abierta') {
    return { status: 'class-closed' };
  }

  let { fixed } = parseHeaderColumns(rows);
  const originalHeaderLength = (rows[HEADER_ROW_INDEX] ?? []).length;

  // Bootstrap the "Cédula" column the first time this feature touches a
  // course sheet that predates it.
  if (fixed.cedula === undefined) {
    const newColumnIndex = originalHeaderLength;
    const colLetter = columnIndexToLetter(newColumnIndex);
    await writeExcelRange(file.id, sheetName, `${colLetter}2`, [['Cédula']]);
    fixed = { ...fixed, cedula: newColumnIndex };
  }

  const dataRows = rows.slice(DATA_ROW_OFFSET);
  const cedulaKey = submission.cedula.trim();
  const correoKey = normalizeForMatch(submission.correo);
  const nombreKey = normalizeForMatch(submission.nombre);

  const matchedRowArrayIndex =
    findRowByColumn(dataRows, fixed.cedula ?? -1, cedulaKey) ??
    findRowByColumn(dataRows, fixed.correo ?? -1, correoKey) ??
    findRowByColumn(dataRows, fixed.nombre ?? -1, nombreKey);

  const classColLetter = columnIndexToLetter(targetClass.columnIndex);

  if (matchedRowArrayIndex !== null) {
    const spreadsheetRow = DATA_ROW_OFFSET + matchedRowArrayIndex + 1;
    const row = dataRows[matchedRowArrayIndex];

    await writeExcelRange(
      file.id,
      sheetName,
      `${classColLetter}${spreadsheetRow}`,
      [['x']],
    );

    const existingCedula = String(row[fixed.cedula ?? -1] ?? '').trim();
    if (!existingCedula && cedulaKey) {
      const cedulaColLetter = columnIndexToLetter(fixed.cedula as number);
      await writeExcelRange(
        file.id,
        sheetName,
        `${cedulaColLetter}${spreadsheetRow}`,
        [[cedulaKey]],
      );
    }

    return { status: 'ok' };
  }

  // No match — append a new row, verifying right before writing that the
  // candidate row is still empty. This guards against a second submission
  // landing on the same row between our initial read and this write.
  const totalColumns = Math.max(originalHeaderLength, (fixed.cedula ?? 0) + 1);
  const lastColLetter = columnIndexToLetter(totalColumns - 1);

  let candidateArrayIndex = DATA_ROW_OFFSET + dataRows.length;
  for (let attempt = 0; attempt < MAX_APPEND_RETRIES; attempt++) {
    const spreadsheetRow = candidateArrayIndex + 1;
    const check = await readExcelRange(
      file.id,
      sheetName,
      `A${spreadsheetRow}:${lastColLetter}${spreadsheetRow}`,
    );
    const rowIsEmpty = !check[0] || isRowEmpty(check[0]);

    if (rowIsEmpty) {
      await writeExcelRange(
        file.id,
        sheetName,
        `${columnIndexToLetter(fixed.nombre as number)}${spreadsheetRow}`,
        [[submission.nombre.trim()]],
      );
      await writeExcelRange(
        file.id,
        sheetName,
        `${columnIndexToLetter(fixed.correo as number)}${spreadsheetRow}`,
        [[submission.correo.trim()]],
      );
      await writeExcelRange(
        file.id,
        sheetName,
        `${columnIndexToLetter(fixed.cedula as number)}${spreadsheetRow}`,
        [[cedulaKey]],
      );
      await writeExcelRange(
        file.id,
        sheetName,
        `${classColLetter}${spreadsheetRow}`,
        [['x']],
      );
      return { status: 'ok' };
    }

    candidateArrayIndex += 1;
  }

  throw new Error(
    `Could not find an empty row to append attendance for "${folderName}" after ${MAX_APPEND_RETRIES} attempts`,
  );
}
