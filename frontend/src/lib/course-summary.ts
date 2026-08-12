// Server-only module: no "use client" directive, and must not be imported
// from any file that has one. Type-only imports of `CourseSummary` from
// client code are fine — they're erased at compile time.
import type { FolderItem } from '@/lib/graph-sharepoint';
import { getCourseWorkbook } from '@/lib/course-workbook';
import { parseAttendanceSheet } from '@/lib/attendance-parser';
import { parseClassColumns } from '@/lib/class-schedule';

export interface CourseSummary {
  folderName: string;
  fileName: string;
  studentCount: number;
  classLabels: string[];
  attendanceRate: number;
  lastModifiedDateTime: string;
}

export async function getCourseSummary(
  folder: FolderItem,
): Promise<CourseSummary> {
  const { file, rows } = await getCourseWorkbook(folder.name);

  const records = parseAttendanceSheet(rows);
  const classes = parseClassColumns(rows);
  const classLabels = classes.map((c) => `Clase ${c.number}`);

  const totalCells = records.length * classLabels.length;
  const presentCells = records.reduce(
    (sum, record) => sum + record.asistencia.filter((a) => a.asistio).length,
    0,
  );

  return {
    folderName: folder.name,
    fileName: file.name,
    studentCount: records.length,
    classLabels,
    attendanceRate: totalCells > 0 ? presentCells / totalCells : 0,
    lastModifiedDateTime: file.lastModifiedDateTime,
  };
}
