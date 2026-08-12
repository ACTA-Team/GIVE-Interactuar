import type { AttendanceRecord } from '@/lib/attendance-parser';

function normalizeValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Same rule used when a credential is first issued (see
// issueCourseCredentialCore.ts) and stored as `entrepreneur_id` — reused
// here to look up whether a student already has one, without needing a
// real entrepreneur record.
export function computeStudentSubjectId(
  student: Pick<AttendanceRecord, 'cedula' | 'correo'>,
): string {
  return student.cedula.trim() || normalizeValue(student.correo);
}

// Cédula is the only roster field guaranteed unique per person — correo can
// be shared (family members, test data, typos) and would silently collide
// subjectIds across different students. Credential issuance requires it.
export function studentHasDocument(
  student: Pick<AttendanceRecord, 'cedula'>,
): boolean {
  return student.cedula.trim().length > 0;
}
