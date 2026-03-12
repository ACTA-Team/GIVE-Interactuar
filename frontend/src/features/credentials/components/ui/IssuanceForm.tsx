'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { IssuanceDraftSchema, type IssuanceDraftInput } from '../../schemas';

interface IssuanceFormProps {
  onSubmit: (data: IssuanceDraftInput) => void | Promise<void>;
  isLoading?: boolean;
}

// TODO: pass available entrepreneurs as props for a dropdown selector
// TODO: add multi-step wizard: 1. Select entrepreneur → 2. Configure VC → 3. Review + issue
export function IssuanceForm({
  onSubmit,
  isLoading = false,
}: IssuanceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IssuanceDraftInput>({
    resolver: zodResolver(IssuanceDraftSchema),
    defaultValues: { credentialType: 'impact' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ID del emprendedor
        </label>
        <input
          {...register('entrepreneurId')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="UUID del emprendedor"
        />
        {errors.entrepreneurId && (
          <p className="mt-1 text-xs text-red-600">
            {errors.entrepreneurId.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Tipo
        </label>
        <select
          {...register('credentialType')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="impact">Impacto</option>
          <option value="behavior">Comportamiento</option>
          <option value="profile">Perfil y Formalización</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Título
        </label>
        <input
          {...register('title')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Título de la credencial"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          {...register('description')}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Descripción opcional"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nota del operador
        </label>
        <textarea
          {...register('operatorNote')}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Observaciones internas (no se incluye en la credencial)"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        Emitir credencial
      </Button>
    </form>
  );
}
