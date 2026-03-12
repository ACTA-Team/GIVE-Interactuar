'use client';

import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/Button';
import { IconTrendingUp } from '@tabler/icons-react';
import {
  impactCredentialFormSchema,
  computeImpactDerivedFields,
  type ImpactCredentialFormInput,
} from '../../schemas/impactCredentialSchema';

interface ImpactCredentialFormProps {
  onSubmit: (data: ImpactCredentialFormInput) => void;
  onBack: () => void;
  defaultValues?: Partial<ImpactCredentialFormInput>;
}

const SECTORS = [
  'Alimentos y bebidas',
  'Comercio',
  'Manufactura',
  'Servicios',
  'Tecnología',
  'Agropecuario',
  'Textil y confecciones',
  'Artesanías',
  'Turismo',
  'Otro',
] as const;

export function ImpactCredentialForm({
  onSubmit,
  onBack,
  defaultValues,
}: ImpactCredentialFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ImpactCredentialFormInput>({
    resolver: zodResolver(impactCredentialFormSchema),
    defaultValues: {
      companyName: '',
      sector: '',
      yearsInOperation: 0,
      salesPreviousYear: 0,
      salesCurrentYear: 0,
      currentEmployees: 0,
      newJobsCreated: 0,
      newFormalJobsCreated: 0,
      businessTrend: 'stable',
      ...defaultValues,
    },
  });

  const salesPreviousYear = useWatch({ control, name: 'salesPreviousYear' });
  const salesCurrentYear = useWatch({ control, name: 'salesCurrentYear' });

  const derived = computeImpactDerivedFields({
    salesPreviousYear: salesPreviousYear || 0,
    salesCurrentYear: salesCurrentYear || 0,
    companyName: '',
    sector: '',
    yearsInOperation: 0,
    currentEmployees: 0,
    newJobsCreated: 0,
    newFormalJobsCreated: 0,
    businessTrend: 'stable',
  });

  const formatPercent = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
          <IconTrendingUp className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold">Credencial de Impacto</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Nombre de la empresa *</Label>
          <Input {...register('companyName')} placeholder="Ej: Tienda Verde" />
          {errors.companyName && (
            <p className="text-xs text-destructive">
              {errors.companyName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Sector *</Label>
          <Controller
            control={control}
            name="sector"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) => field.onChange(v ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.sector && (
            <p className="text-xs text-destructive">{errors.sector.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="yearsInOperation">Años en operación</Label>
          <Input
            type="number"
            {...register('yearsInOperation', { valueAsNumber: true })}
          />
          {errors.yearsInOperation && (
            <p className="text-xs text-destructive">
              {errors.yearsInOperation.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="salesPreviousYear">Ventas año anterior (COP)</Label>
          <Input
            type="number"
            {...register('salesPreviousYear', { valueAsNumber: true })}
          />
          {errors.salesPreviousYear && (
            <p className="text-xs text-destructive">
              {errors.salesPreviousYear.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="salesCurrentYear">Ventas año actual (COP)</Label>
          <Input
            type="number"
            {...register('salesCurrentYear', { valueAsNumber: true })}
          />
          {errors.salesCurrentYear && (
            <p className="text-xs text-destructive">
              {errors.salesCurrentYear.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Variación de ventas</Label>
        <div className="flex h-8 items-center rounded-lg bg-muted px-3 text-sm text-muted-foreground">
          {formatPercent(derived.salesVariationPercent)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="currentEmployees">Empleados actuales</Label>
          <Input
            type="number"
            {...register('currentEmployees', { valueAsNumber: true })}
          />
          {errors.currentEmployees && (
            <p className="text-xs text-destructive">
              {errors.currentEmployees.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newJobsCreated">Nuevos empleos</Label>
          <Input
            type="number"
            {...register('newJobsCreated', { valueAsNumber: true })}
          />
          {errors.newJobsCreated && (
            <p className="text-xs text-destructive">
              {errors.newJobsCreated.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newFormalJobsCreated">Empleos formales</Label>
          <Input
            type="number"
            {...register('newFormalJobsCreated', { valueAsNumber: true })}
          />
          {errors.newFormalJobsCreated && (
            <p className="text-xs text-destructive">
              {errors.newFormalJobsCreated.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Tendencia del negocio</Label>
          <Controller
            control={control}
            name="businessTrend"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) =>
                  field.onChange(v ?? 'stable')
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="growing">En crecimiento</SelectItem>
                  <SelectItem value="stable">Estable</SelectItem>
                  <SelectItem value="deteriorating">En deterioro</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">
          Período de evaluación (opcional)
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="assessmentPeriod.startDate">Fecha inicio</Label>
            <Input type="date" {...register('assessmentPeriod.startDate')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assessmentPeriod.endDate">Fecha fin</Label>
            <Input type="date" {...register('assessmentPeriod.endDate')} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          &larr; Atrás
        </Button>
        <Button
          type="submit"
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Generar Credencial &rarr;
        </Button>
      </div>
    </form>
  );
}
