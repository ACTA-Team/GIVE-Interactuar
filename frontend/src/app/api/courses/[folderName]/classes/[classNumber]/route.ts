import { NextResponse } from 'next/server';
import { getCourseWorkbook } from '@/lib/course-workbook';
import { writeExcelRange } from '@/lib/graph-sharepoint';
import { columnIndexToLetter } from '@/lib/excel-utils';
import {
  parseClassColumns,
  encodeClassCell,
  type ClassStatus,
} from '@/lib/class-schedule';
import { getCourseDetail } from '@/lib/course-detail';

interface RouteParams {
  params: Promise<{ folderName: string; classNumber: string }>;
}

// Toggles a single class's open/closed status in place — same "workbook is
// the only datastore" constraint as the create-class route.
export async function PATCH(request: Request, { params }: RouteParams) {
  const { folderName: rawFolderName, classNumber } = await params;
  const folderName = decodeURIComponent(rawFolderName);
  const { status } = (await request.json()) as { status: ClassStatus };

  const { file, sheetName, rows } = await getCourseWorkbook(folderName);
  const classes = parseClassColumns(rows);

  const target = classes.find((c) => c.number === Number(classNumber));
  if (!target) {
    return NextResponse.json(
      { ok: false, error: `Class ${classNumber} not found` },
      { status: 404 },
    );
  }

  const colLetter = columnIndexToLetter(target.columnIndex);
  await writeExcelRange(file.id, sheetName, `${colLetter}1`, [
    [encodeClassCell(status, target.scheduledAt)],
  ]);

  const course = await getCourseDetail(folderName);
  return NextResponse.json({ ok: true, course });
}
