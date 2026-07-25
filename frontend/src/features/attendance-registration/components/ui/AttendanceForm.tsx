'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { UserCheck } from 'lucide-react';
import {
  useSubmitAttendance,
  type AttendanceFormValues,
} from '../../hooks/useSubmitAttendance';

export function AttendanceForm({
  folderName,
  classNumber,
  onSuccess,
}: {
  folderName: string;
  classNumber: string;
  onSuccess: () => void;
}) {
  const [values, setValues] = useState<AttendanceFormValues>({
    nombre: '',
    correo: '',
    cedula: '',
  });
  const { mutate, isPending, error } = useSubmitAttendance(
    folderName,
    classNumber,
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutate(values, { onSuccess });
  };

  const isValid =
    values.nombre.trim() && values.correo.trim() && values.cedula.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input
          id="nombre"
          placeholder="Ej. María Elena Rodríguez"
          value={values.nombre}
          onChange={(e) => setValues((v) => ({ ...v, nombre: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="correo">Correo electrónico</Label>
        <Input
          id="correo"
          type="email"
          placeholder="ejemplo@correo.com"
          value={values.correo}
          onChange={(e) => setValues((v) => ({ ...v, correo: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cedula">Número de identificación (cédula)</Label>
        <Input
          id="cedula"
          placeholder="1.023.456.789"
          value={values.cedula}
          onChange={(e) => setValues((v) => ({ ...v, cedula: e.target.value }))}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <Button
        type="submit"
        className="w-full rounded-full"
        size="lg"
        disabled={!isValid || isPending}
      >
        <UserCheck className="h-4 w-4" />
        {isPending ? 'Confirmando...' : 'Confirmar asistencia'}
      </Button>
    </form>
  );
}
