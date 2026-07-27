import type { AttendanceRecord } from '@/lib/attendance-parser';
import type { ClassInfo } from '@/lib/class-schedule';

export interface StudentAttendance {
  attended: number;
  total: number;
  percent: number;
}

export function computeStudentAttendance(
  classes: ClassInfo[],
  student: AttendanceRecord,
): StudentAttendance {
  const closedIndices = classes
    .map((c, index) => ({ status: c.status, index }))
    .filter((c) => c.status === 'cerrada')
    .map((c) => c.index);
  const attended = closedIndices.filter(
    (i) => student.asistencia[i]?.asistio,
  ).length;
  const total = closedIndices.length;

  return { attended, total, percent: total > 0 ? (attended / total) * 100 : 0 };
}
