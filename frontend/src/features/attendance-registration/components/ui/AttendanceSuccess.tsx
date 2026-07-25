import { BadgeCheck } from 'lucide-react';

export function AttendanceSuccess({
  courseName,
  classNumber,
  confirmedAt,
}: {
  courseName: string;
  classNumber: string;
  confirmedAt: Date;
}) {
  const fecha = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(confirmedAt);
  const hora = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(confirmedAt);

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <BadgeCheck className="h-9 w-9 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Registro exitoso
        </h1>
        <p className="text-sm text-muted-foreground">
          Tu asistencia ha sido verificada y registrada correctamente.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="h-1 w-full bg-primary" />
        <dl className="divide-y divide-border text-left">
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Curso
            </dt>
            <dd className="font-semibold text-primary">{courseName}</dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Sesión
            </dt>
            <dd className="font-semibold text-foreground">
              Clase {classNumber}
            </dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Fecha
              </dt>
              <dd className="font-semibold text-foreground">{fecha}</dd>
            </div>
            <div className="text-right">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Hora
              </dt>
              <dd className="font-semibold text-foreground">{hora}</dd>
            </div>
          </div>
        </dl>
      </div>

      <p className="text-sm text-muted-foreground italic">
        Este registro forma parte del historial de asistencia del curso.
      </p>
    </div>
  );
}
