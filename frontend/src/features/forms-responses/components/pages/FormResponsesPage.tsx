 'use client';

import { useMemo, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';

type FormResponse = {
  id: string;
  submittedAt: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  fuente?: string | null;
  estado?: string | null;
  payload: Record<string, unknown>;
};

const MOCK_RESPONSES: FormResponse[] = [
  {
    id: '1',
    submittedAt: new Date().toISOString(),
    nombre: 'Ana Gómez',
    email: 'ana@example.com',
    telefono: '+57 300 123 4567',
    fuente: 'Formulario web',
    estado: 'Nuevo',
    payload: {
      proyecto: 'Emprendimiento gastronómico',
      ciudad: 'Medellín',
      comentario: 'Quiero recibir acompañamiento para formalizar mi negocio.',
    },
  },
  {
    id: '2',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    nombre: 'Carlos Ruiz',
    email: 'carlos@example.com',
    telefono: '+57 310 987 6543',
    fuente: 'Google Forms',
    estado: 'En revisión',
    payload: {
      proyecto: 'Servicios de reparación de bicicletas',
      ciudad: 'Bogotá',
      comentario: 'Busco financiación para ampliar mi taller.',
    },
  },
];

function baseParsed(dateString: string) {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const monthIdx = d.getMonth();
  const year = d.getFullYear();
  const hours24 = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');

  const monthsShort = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ] as const;

  const month = monthsShort[monthIdx] ?? '';

  const suffix = hours24 >= 12 ? 'p.m.' : 'a.m.';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  const hours = String(hours12).padStart(2, '0');

  return { day, month, year, hours, minutes, suffix };
}

function formatDate(dateString: string) {
  const { day, month, year } = baseParsed(dateString);
  return `${day} ${month} ${year}`;
}

function formatTime(dateString: string) {
  const { hours, minutes, suffix } = baseParsed(dateString);
  return `${hours}:${minutes} ${suffix}`;
}

function formatFull(dateString: string) {
  const { day, month, year, hours, minutes, suffix } = baseParsed(dateString);
  return `${day} ${month} ${year} - ${hours}:${minutes} ${suffix}`;
}

export function FormResponsesPage() {
  const [selected, setSelected] = useState<FormResponse | null>(null);

  const rows = useMemo(() => MOCK_RESPONSES, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Respuestas de formulario
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Visualiza cada respuesta con su hora de llegada y revisa el detalle
            completo en un panel lateral.
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold text-gray-800">
              Últimas respuestas
            </h2>
            <p className="text-xs text-gray-500">
              {rows.length} respuestas recibidas
            </p>
          </div>
        </div>

        <div className="px-4 py-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiempo de llegada</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>
                    <span className="block text-xs text-gray-500">
                      {formatDate(response.submittedAt)}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatTime(response.submittedAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">
                    {response.nombre}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {response.email}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {response.estado ?? 'Sin estado'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    Google Forms
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={selected?.id === response.id}>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSelected(response)}
                      >
                        Ver
                      </Button>
                      <DialogContent className="max-w-lg" showCloseButton>
                        <DialogHeader>
                          <DialogTitle>Detalle de respuesta</DialogTitle>
                          <DialogDescription>
                            Información completa enviada a través del formulario.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Nombre
                              </p>
                              <p className="mt-0.5 text-gray-900">
                                {response.nombre}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Email
                              </p>
                              <p className="mt-0.5 text-gray-900">
                                {response.email}
                              </p>
                            </div>
                            {response.telefono && (
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                  Teléfono
                                </p>
                                <p className="mt-0.5 text-gray-900">
                                  {response.telefono}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Tiempo de llegada
                              </p>
                              <p className="mt-0.5 text-gray-900">
                                {formatFull(response.submittedAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Estado
                              </p>
                              <p className="mt-0.5">
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                  {response.estado ?? 'Sin estado'}
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Fuente
                              </p>
                              <p className="mt-0.5 text-gray-900">Google Forms</p>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-4">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                              Campos del formulario
                            </p>
                            <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                              {Object.entries(response.payload).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex items-start justify-between gap-4"
                                  >
                                    <span className="text-xs font-medium text-gray-500">
                                      {key}
                                    </span>
                                    <span className="flex-1 text-right text-sm text-gray-900">
                                      {String(value)}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full sm:w-auto"
                              onClick={() => setSelected(null)}
                            >
                              Cerrar
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

