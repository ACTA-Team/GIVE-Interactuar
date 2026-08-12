'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ClipboardList } from 'lucide-react';
import { useClassInfo } from '../../hooks/useClassInfo';
import { AttendanceForm } from '../ui/AttendanceForm';
import { AttendanceSuccess } from '../ui/AttendanceSuccess';

function formatScheduledDate(scheduledAt: string | null): string {
  if (!scheduledAt) return 'Sin fecha programada';
  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return 'Sin fecha programada';
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function AttendanceRegistrationPage({
  folderName,
  classNumber,
}: {
  folderName: string;
  classNumber: string;
}) {
  const { data, isLoading, error } = useClassInfo(folderName, classNumber);
  const [confirmedAt, setConfirmedAt] = useState<Date | null>(null);

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary">
      <header className="flex items-center border-b bg-background px-6 py-4">
        <Image
          src="/assets/interactuar/interactuar-logo.svg"
          alt="Interactuar"
          width={140}
          height={44}
        />
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          {isLoading && (
            <p className="text-center text-sm text-muted-foreground">
              Cargando sesión...
            </p>
          )}

          {!isLoading && error && (
            <div className="rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10">
              <p className="font-medium text-foreground">
                No pudimos encontrar esta sesión.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Verifica que el enlace sea correcto.
              </p>
            </div>
          )}

          {!isLoading && data && confirmedAt && (
            <AttendanceSuccess
              courseName={data.courseName}
              classNumber={String(data.classNumber)}
              confirmedAt={confirmedAt}
            />
          )}

          {!isLoading && data && !confirmedAt && data.status === 'cerrada' && (
            <div className="rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10">
              <p className="font-medium text-foreground">
                Esta sesión ya no acepta registros de asistencia.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Contacta a tu profesor si crees que esto es un error.
              </p>
            </div>
          )}

          {!isLoading && data && !confirmedAt && data.status === 'abierta' && (
            <>
              <div className="space-y-4 rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  Registro de Asistencia
                </h1>
                <div className="grid grid-cols-3 gap-2 border-t pt-4 text-left">
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      Curso
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {data.courseName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      Sesión
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      Clase {data.classNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      Fecha
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatScheduledDate(data.scheduledAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
                <AttendanceForm
                  folderName={folderName}
                  classNumber={classNumber}
                  onSuccess={() => setConfirmedAt(new Date())}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t bg-background px-6 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Corporación Interactuar. Todos los derechos
        reservados.
      </footer>
    </div>
  );
}
