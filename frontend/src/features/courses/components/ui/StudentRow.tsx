'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Download, Loader2 } from 'lucide-react';
import type { AttendanceRecord } from '@/lib/attendance-parser';
import type { ClassInfo } from '@/lib/class-schedule';
import { useDownloadConstancia } from '../../hooks/useDownloadConstancia';

export function StudentRow({
  folderName,
  student,
  classes,
}: {
  folderName: string;
  student: AttendanceRecord;
  classes: ClassInfo[];
}) {
  const t = useTranslations('courses');
  const { mutate, isPending, error } = useDownloadConstancia(folderName);

  const closedIndices = classes
    .map((c, index) => ({ status: c.status, index }))
    .filter((c) => c.status === 'cerrada')
    .map((c) => c.index);
  const attendedClosed = closedIndices.filter(
    (i) => student.asistencia[i]?.asistio,
  ).length;

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
            total: closedIndices.length,
          })}
        </p>
        {error && (
          <p className="mt-1 text-xs text-destructive">{error.message}</p>
        )}
      </div>

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
    </div>
  );
}
