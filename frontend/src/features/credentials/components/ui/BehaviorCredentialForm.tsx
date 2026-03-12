'use client';

import { useForm, Controller } from 'react-hook-form';
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
import { IconShieldCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  behaviorCredentialFormSchema,
  computeBehaviorDerivedFields,
  type BehaviorCredentialFormInput,
} from '../../schemas/behaviorCredentialSchema';

interface BehaviorCredentialFormProps {
  onSubmit: (data: BehaviorCredentialFormInput) => void;
  onBack: () => void;
  defaultValues?: Partial<BehaviorCredentialFormInput>;
}

const CREDIT_SEGMENTS = [
  'Microcrédito',
  'Crédito individual',
  'Grupo solidario',
  'Banca comunal',
] as const;

function ToggleField({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-0">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'flex-1 rounded-l-lg border px-4 py-2 text-sm font-medium transition-colors',
          value
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-card text-muted-foreground hover:bg-muted',
        )}
      >
        Sí
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'flex-1 rounded-r-lg border border-l-0 px-4 py-2 text-sm font-medium transition-colors',
          !value
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-card text-muted-foreground hover:bg-muted',
        )}
      >
        No
      </button>
    </div>
  );
}

export function BehaviorCredentialForm({
  onSubmit,
  onBack,
  defaultValues,
}: BehaviorCredentialFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BehaviorCredentialFormInput>({
    resolver: zodResolver(behaviorCredentialFormSchema),
    defaultValues: {
      activeCredit: { exists: false },
      monthlyIncomeStability: 'medium',
      registryValidation: 'not_validated',
      commercialStability: 'stable',
      financialTrend: 'stable',
      newJobs: 0,
      averageSales: 0,
      costsAndExpenses: 0,
      assets: 0,
      liabilities: 0,
      ...defaultValues,
    },
  });

  const averageSales = watch('averageSales');
  const costsAndExpenses = watch('costsAndExpenses');
  const assets = watch('assets');
  const liabilities = watch('liabilities');
  const activeCreditExists = watch('activeCredit.exists');

  const derived = computeBehaviorDerivedFields({
    averageSales: averageSales || 0,
    costsAndExpenses: costsAndExpenses || 0,
    assets: assets || 0,
    liabilities: liabilities || 0,
    financialTrend: watch('financialTrend') || 'stable',
    creditSegmentStart: '',
    creditSegmentEnd: '',
    monthlyIncomeStability: 'medium',
    registryValidation: 'not_validated',
    newJobs: 0,
    commercialStability: 'stable',
  });

  const formatPercent = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

  const formatRatio = (n: number) => n.toFixed(2);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          <IconShieldCheck className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold">
          Credencial de Comportamiento
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="creditSegmentStart">Segmento inicio</Label>
          <Controller
            control={control}
            name="creditSegmentStart"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) => field.onChange(v ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_SEGMENTS.map((seg) => (
                    <SelectItem key={seg} value={seg}>
                      {seg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.creditSegmentStart && (
            <p className="text-xs text-destructive">
              {errors.creditSegmentStart.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="creditSegmentEnd">Segmento final</Label>
          <Controller
            control={control}
            name="creditSegmentEnd"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) => field.onChange(v ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_SEGMENTS.map((seg) => (
                    <SelectItem key={seg} value={seg}>
                      {seg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.creditSegmentEnd && (
            <p className="text-xs text-destructive">
              {errors.creditSegmentEnd.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Crédito vigente</Label>
          <Controller
            control={control}
            name="activeCredit.exists"
            render={({ field }) => (
              <ToggleField
                value={field.value ?? false}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="averageSales">Ventas mensuales (COP) *</Label>
          <Input
            type="number"
            {...register('averageSales', { valueAsNumber: true })}
          />
          {errors.averageSales && (
            <p className="text-xs text-destructive">
              {errors.averageSales.message}
            </p>
          )}
        </div>
      </div>

      {activeCreditExists && (
        <div className="grid grid-cols-3 gap-4 rounded-lg border border-border bg-muted/30 p-3">
          <div className="space-y-1.5">
            <Label>Monto</Label>
            <Input
              type="number"
              {...register('activeCredit.amount', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Moneda</Label>
            <Input {...register('activeCredit.currency')} placeholder="COP" />
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Controller
              control={control}
              name="activeCredit.status"
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  onValueChange={(v: string | null) => field.onChange(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Al día</SelectItem>
                    <SelectItem value="late">Mora</SelectItem>
                    <SelectItem value="restructured">Reestructurado</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="costsAndExpenses">Costos mensuales (COP) *</Label>
          <Input
            type="number"
            {...register('costsAndExpenses', { valueAsNumber: true })}
          />
          {errors.costsAndExpenses && (
            <p className="text-xs text-destructive">
              {errors.costsAndExpenses.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Margen operativo estimado</Label>
          <div className="flex h-8 items-center rounded-lg bg-muted px-3 text-sm text-muted-foreground">
            {formatPercent(derived.estimatedOperatingMargin)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="assets">Activos totales (COP)</Label>
          <Input
            type="number"
            {...register('assets', { valueAsNumber: true })}
          />
          {errors.assets && (
            <p className="text-xs text-destructive">{errors.assets.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="liabilities">Pasivos totales (COP)</Label>
          <Input
            type="number"
            {...register('liabilities', { valueAsNumber: true })}
          />
          {errors.liabilities && (
            <p className="text-xs text-destructive">
              {errors.liabilities.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Relación pasivos/activos</Label>
          <div className="flex h-8 items-center rounded-lg bg-muted px-3 text-sm text-muted-foreground">
            {formatRatio(derived.liabilitiesToAssetsRatio)}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Estabilidad del negocio</Label>
          <Controller
            control={control}
            name="commercialStability"
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
                  <SelectItem value="stable">Estable</SelectItem>
                  <SelectItem value="seasonal">Estacional</SelectItem>
                  <SelectItem value="volatile">Volátil</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Validación de registro</Label>
          <Controller
            control={control}
            name="registryValidation"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) =>
                  field.onChange(v ?? 'not_validated')
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="validated">Validado</SelectItem>
                  <SelectItem value="partially_validated">
                    Parcialmente validado
                  </SelectItem>
                  <SelectItem value="not_validated">No validado</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newJobs">Nuevos empleos</Label>
          <Input
            type="number"
            {...register('newJobs', { valueAsNumber: true })}
          />
          {errors.newJobs && (
            <p className="text-xs text-destructive">{errors.newJobs.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Estabilidad de ingresos</Label>
          <Controller
            control={control}
            name="monthlyIncomeStability"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) =>
                  field.onChange(v ?? 'medium')
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="volatile">Volátil</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Tendencia financiera</Label>
          <Controller
            control={control}
            name="financialTrend"
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
                  <SelectItem value="improving">Mejorando</SelectItem>
                  <SelectItem value="stable">Estable</SelectItem>
                  <SelectItem value="deteriorating">Deteriorándose</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
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
