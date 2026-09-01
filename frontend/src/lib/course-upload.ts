// Server-only module: no "use client" directive, and must not be imported
// from any file that has one.
//
// Upload-based counterpart to course-workbook.ts + course-detail.ts. Reads
// an uploaded .xlsx or .csv buffer instead of fetching from SharePoint —
// the underlying row-parsing (attendance-parser.ts, class-schedule.ts,
// attendance-rules.ts) is pure and source-agnostic, so it's reused as-is
// regardless of which format produced the rows. Nothing here is ever
// written to disk or a database; the buffer and the parsed result both
// live only for the duration of the request.
//
// Legacy binary .xls isn't supported — exceljs only reads OOXML .xlsx and
// CSV. If that's ever needed, it means swapping the read side for a
// format-agnostic library (e.g. SheetJS/xlsx), not extending this one.
import ExcelJS from 'exceljs';
import { Readable } from 'node:stream';
import { parseAttendanceSheet } from '@/lib/attendance-parser';
import { parseClassColumns } from '@/lib/class-schedule';
import {
  findAttendanceThreshold,
  isRulesSheetName,
  DEFAULT_ATTENDANCE_THRESHOLD,
} from '@/lib/attendance-rules';
import type { CourseDetail } from '@/lib/course-detail';

// exceljs represents a hyperlinked cell (any "correo" column that's a
// mailto: link, which the real templates always are) as
// { text, hyperlink } instead of a plain string, and rich-text cells as
// { richText: [...] } — Graph's range .values returns plain strings for
// both, so this normalizes exceljs's shapes to match before handing rows
// to the shared (Graph-shape-assuming) parsers.
function normalizeCellValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === 'object') {
    if ('text' in value) return (value as { text: unknown }).text;
    if ('richText' in value) {
      return (value as { richText: { text: string }[] }).richText
        .map((r) => r.text)
        .join('');
    }
  }
  return value;
}

function worksheetToRows(worksheet: ExcelJS.Worksheet): unknown[][] {
  const rows: unknown[][] = [];
  worksheet.eachRow({ includeEmpty: true }, (row) => {
    // row.values is 1-indexed with values[0] undefined — drop it to line up
    // with the 0-indexed rows[][] shape the shared parsers expect (the same
    // shape Graph's range .values already returns).
    const values = row.values as unknown[];
    rows.push(values.slice(1).map(normalizeCellValue));
  });
  return rows;
}

export interface ParsedCourseUpload extends CourseDetail {
  detectedCourseName: string | null;
}

// Column A holds "Curso" as a label in row 0 and the actual course name
// directly below it in row 1, col A — the rest of row 1 is the real
// column headers (Nombre, NumDocumento, ...). Confirmed against a real
// downloaded template; not the horizontal A/B layout the row-0 title
// pair uses for class markers.
function detectCourseName(rows: unknown[][]): string | null {
  const value = String(rows[1]?.[0] ?? '').trim();
  return value.length > 0 ? value : null;
}

// exceljs bundles its own (older) @types/node via fast-csv, whose Buffer
// type structurally mismatches this project's — a dependency-tree
// artifact, not a real type error. Applies to both load paths below.
type LegacyBuffer = never;

// Excel exports CSVs with the OS's regional "list separator", which is
// ";" (not ",") under Spanish/Latin American locales — including Colombia,
// where "," is the decimal separator. fast-csv defaults to ",", so a
// semicolon file silently parses as one giant column per row. Sniff the
// first line and pick whichever delimiter actually splits it into more
// than one field.
function detectCsvDelimiter(buffer: Buffer): string {
  const firstLine = buffer.toString('utf-8', 0, 2000).split(/\r?\n/)[0] ?? '';
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;
  return semicolonCount > commaCount ? ';' : ',';
}

// Excel's "CSV" export (as opposed to "CSV UTF-8") writes Windows-1252
// ("ANSI") under a Spanish/Latin American Windows locale, not UTF-8 — the
// same regional-defaults trap as the delimiter above. Reading those bytes
// as UTF-8 silently mangles every accented character (á é í ó ú ñ) into
// U+FFFD, which then corrupts student names/course names in the parsed
// roster and later crashes PDF generation (WinAnsi can't encode U+FFFD
// either). Detect invalid UTF-8 and re-decode as Windows-1252 instead —
// genuinely UTF-8 files (the common case) pass through untouched.
function normalizeCsvEncoding(buffer: Buffer): Buffer {
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    return buffer;
  } catch {
    const text = new TextDecoder('windows-1252').decode(buffer);
    return Buffer.from(text, 'utf-8');
  }
}

export async function parseUploadedCourse(
  buffer: Buffer,
  filename: string,
  courseNameOverride?: string,
): Promise<ParsedCourseUpload> {
  const isCsv = filename.toLowerCase().endsWith('.csv');
  const workbook = new ExcelJS.Workbook();

  let mainSheet: ExcelJS.Worksheet;
  if (isCsv) {
    const csvBuffer = normalizeCsvEncoding(buffer);
    // Readable.from([buffer]) — wrapping in an array makes the whole
    // buffer one chunk; Readable.from(buffer) directly would iterate it
    // byte-by-byte, since Buffer is itself iterable.
    mainSheet = await workbook.csv.read(
      Readable.from([csvBuffer]) as unknown as LegacyBuffer,
      { parserOptions: { delimiter: detectCsvDelimiter(csvBuffer) } },
    );
  } else {
    await workbook.xlsx.load(buffer as LegacyBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      throw new Error('El archivo no tiene ninguna hoja de cálculo.');
    }
    mainSheet = sheet;
  }

  const rows = worksheetToRows(mainSheet);
  const students = parseAttendanceSheet(rows);
  const classes = parseClassColumns(rows);

  // A CSV export has no "Reglas" sheet — a CSV is a single flat sheet by
  // definition — so it always falls back to the default threshold.
  const rulesSheet = isCsv
    ? undefined
    : workbook.worksheets.find((ws) => isRulesSheetName(ws.name));
  const attendanceThreshold = rulesSheet
    ? findAttendanceThreshold(worksheetToRows(rulesSheet))
    : DEFAULT_ATTENDANCE_THRESHOLD;

  const totalCells = students.length * classes.length;
  const presentCells = students.reduce(
    (sum, student) => sum + student.asistencia.filter((a) => a.asistio).length,
    0,
  );

  const detectedCourseName = detectCourseName(rows);

  return {
    folderName: courseNameOverride?.trim() || detectedCourseName || '',
    detectedCourseName,
    studentCount: students.length,
    attendanceRate: totalCells > 0 ? presentCells / totalCells : 0,
    attendanceThreshold,
    lastModifiedDateTime: new Date().toISOString(),
    classes,
    students,
  };
}
