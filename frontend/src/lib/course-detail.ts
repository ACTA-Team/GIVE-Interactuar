// Server-only module: no "use client" directive, and must not be imported
// from any file that has one. Type-only imports of `CourseDetail`/`ClassInfo`
// from client code are fine — they're erased at compile time.
import { getCourseWorkbook } from '@/lib/course-workbook';
import {
  parseAttendanceSheet,
  type AttendanceRecord,
} from '@/lib/attendance-parser';
import { parseClassColumns, type ClassInfo } from '@/lib/class-schedule';
import { getAttendanceThreshold } from '@/lib/attendance-rules';

export interface CourseDetail {
  folderName: string;
  studentCount: number;
  attendanceRate: number;
  attendanceThreshold: number;
  lastModifiedDateTime: string;
  classes: ClassInfo[];
  students: AttendanceRecord[];
}

export async function getCourseDetail(
  folderName: string,
): Promise<CourseDetail> {
  const { file, rows } = await getCourseWorkbook(folderName);

  const records = parseAttendanceSheet(rows);
  const classes = parseClassColumns(rows);
  const attendanceThreshold = await getAttendanceThreshold(file.id);

  const totalCells = records.length * classes.length;
  const presentCells = records.reduce(
    (sum, record) => sum + record.asistencia.filter((a) => a.asistio).length,
    0,
  );

  return {
    folderName,
    studentCount: records.length,
    attendanceRate: totalCells > 0 ? presentCells / totalCells : 0,
    attendanceThreshold,
    lastModifiedDateTime: file.lastModifiedDateTime,
    classes,
    students: records,
  };
}
