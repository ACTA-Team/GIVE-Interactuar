import { NextResponse } from 'next/server';
import { getCourseWorkbook } from '@/lib/course-workbook';
import { writeExcelRange } from '@/lib/graph-sharepoint';
import { columnIndexToLetter } from '@/lib/excel-utils';
import { parseClassColumns, encodeClassCell } from '@/lib/class-schedule';
import { getCourseDetail } from '@/lib/course-detail';

interface RouteParams {
  params: Promise<{ folderName: string }>;
}

// Real endpoint the course detail page depends on — appends a new "Clase N"
// column to the right of the existing ones, since the workbook is the only
// datastore. Not wrapped in elaborate error handling, matching the rest of
// the /api/courses surface.
export async function POST(request: Request, { params }: RouteParams) {
  const { folderName: rawFolderName } = await params;
  const folderName = decodeURIComponent(rawFolderName);
  const { scheduledAt } = (await request.json()) as { scheduledAt: string };

  const { file, sheetName, rows } = await getCourseWorkbook(folderName);
  const classes = parseClassColumns(rows);

  const newColumnIndex = (rows[1] ?? []).length;
  const newNumber =
    classes.length > 0 ? Math.max(...classes.map((c) => c.number)) + 1 : 1;
  const colLetter = columnIndexToLetter(newColumnIndex);

  await writeExcelRange(file.id, sheetName, `${colLetter}2`, [
    [`Clase ${newNumber}`],
  ]);
  await writeExcelRange(file.id, sheetName, `${colLetter}1`, [
    [encodeClassCell('abierta', scheduledAt)],
  ]);

  const course = await getCourseDetail(folderName);
  return NextResponse.json({ ok: true, course });
}
