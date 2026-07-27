'use client';

import { useTranslations } from 'next-intl';
import type { AttendanceRecord } from '@/lib/attendance-parser';
import type { ClassInfo } from '@/lib/class-schedule';
import { computeStudentAttendance } from '../../lib/computeAttendance';
import { IssueCredentialButton } from './IssueCredentialButton';

export function StudentRow({
  folderName,
  student,
  classes,
  attendanceThreshold,
  existingPublicId,
  onIssued,
}: {
  folderName: string;
  student: AttendanceRecord;
  classes: ClassInfo[];
  attendanceThreshold: number;
  existingPublicId?: string;
  onIssued?: () => void;
}) {
  const t = useTranslations('courses');

  const { attended: attendedClosed, total: closedTotal } =
    computeStudentAttendance(classes, student);

  return (
    <div className="flex flex-col gap-2 border-b py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-foreground">{student.nombre}</p>
        <p className="text-xs text-muted-foreground">
          {student.cedula || student.correo}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('students.attendanceSummary', {
            attended: attendedClosed,
            total: closedTotal,
          })}
        </p>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <IssueCredentialButton
          student={student}
          courseName={folderName}
          classesAttended={attendedClosed}
          classesTotal={closedTotal}
          attendanceThreshold={attendanceThreshold}
          existingPublicId={existingPublicId}
          onIssued={onIssued}
        />
      </div>
    </div>
  );
}
