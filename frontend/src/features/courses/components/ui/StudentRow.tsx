'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Download, Loader2 } from 'lucide-react';
import type { AttendanceRecord } from '@/lib/attendance-parser';
import type { ClassInfo } from '@/lib/class-schedule';
import { useDownloadConstancia } from '../../hooks/useDownloadConstancia';
import { computeStudentAttendance } from '../../lib/computeAttendance';
import { IssueCredentialButton } from './IssueCredentialButton';

export function StudentRow({
  folderName,
  student,
  classes,
  attendanceThreshold,
}: {
  folderName: string;
  student: AttendanceRecord;
  classes: ClassInfo[];
  attendanceThreshold: number;
}) {
  const t = useTranslations('courses');
  const { mutate, isPending, error } = useDownloadConstancia(folderName);

  const { attended: attendedClosed, total: closedTotal } =
    computeStudentAttendance(classes, student);

  const handleDownload = () => {
    mutate({
      nombre: student.nombre,
      cedula: student.cedula,
      correo: student.correo,
    });
  };

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
        {error && (
          <p className="mt-1 text-xs text-destructive">{error.message}</p>
        )}
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="mr-1.5 h-3.5 w-3.5" />
          )}
          {t('students.download')}
        </Button>
        <IssueCredentialButton
          student={student}
          courseName={folderName}
          classesAttended={attendedClosed}
          classesTotal={closedTotal}
          attendanceThreshold={attendanceThreshold}
        />
      </div>
    </div>
  );
}
