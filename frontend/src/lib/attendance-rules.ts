// Server-only module: no "use client" directive, and must not be imported
// from any file that has one.
import { listWorksheetNames, getWorksheetData } from '@/lib/graph-sharepoint';

export const DEFAULT_ATTENDANCE_THRESHOLD = 80;

const RULES_SHEET_NAME = 'reglas';
const MIN_ATTENDANCE_LABEL = 'asistencia minima';

function normalize(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function toNumber(value: unknown): number | null {
  const num = Number(String(value ?? '').trim());
  return Number.isFinite(num) ? num : null;
}

// Optional per-course override: a "Reglas" worksheet with a cell that reads
// "Asistencia Minima" somewhere near a numeric value. Position isn't
// strictly specified (label/value could be same-row-next-column or
// one-row-below), so the scan tolerates both rather than assuming an exact
// cell address — this is internal config, not something worth being brittle
// about.
//
// Pure — no Graph dependency — so it's shared between the SharePoint-backed
// path (below) and the upload-based path (course-upload.ts), which each
// resolve `rows` for the "Reglas" sheet differently but scan them the same
// way.
export function findAttendanceThreshold(rows: unknown[][]): number {
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (normalize(rows[r][c]) !== MIN_ATTENDANCE_LABEL) continue;

      const sameRowNext = toNumber(rows[r][c + 1]);
      if (sameRowNext !== null) return sameRowNext;

      const rowBelow = toNumber(rows[r + 1]?.[c]);
      if (rowBelow !== null) return rowBelow;
    }
  }

  return DEFAULT_ATTENDANCE_THRESHOLD;
}

export function isRulesSheetName(name: string): boolean {
  return normalize(name) === RULES_SHEET_NAME;
}

export async function getAttendanceThreshold(fileId: string): Promise<number> {
  const sheetNames = await listWorksheetNames(fileId);
  const rulesSheet = sheetNames.find(isRulesSheetName);
  if (!rulesSheet) return DEFAULT_ATTENDANCE_THRESHOLD;

  const rows = await getWorksheetData(fileId, rulesSheet);
  return findAttendanceThreshold(rows);
}
