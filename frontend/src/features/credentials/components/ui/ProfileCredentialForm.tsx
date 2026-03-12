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
import { IconIdBadge2 } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  profileCredentialFormSchema,
  type ProfileCredentialFormInput,
} from '../../schemas/profileCredentialSchema';

interface ProfileCredentialFormProps {
  onSubmit: (data: ProfileCredentialFormInput) => void;
  onBack: () => void;
  defaultValues?: Partial<ProfileCredentialFormInput>;
}

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

export function ProfileCredentialForm({
  onSubmit,
  onBack,
  defaultValues,
}: ProfileCredentialFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileCredentialFormInput>({
    resolver: zodResolver(profileCredentialFormSchema),
    defaultValues: {
      identityValidated: false,
      educationLevel: 'secondary',
      municipality: '',
      zone: 'urban',
      mainHouseholdProvider: false,
      householdIncome: 0,
      formalizedBusiness: false,
      nit: null,
      yearsInOperation: 0,
      companySize: 'micro',
      internetAccess: false,
      employmentFormalization: { formalizedJobsCount: 0 },
      traceabilityLevel: 'medium',
      formalizationLevel: 'low',
      applicantStabilitySignal: 'moderate',
      ...defaultValues,
    },
  });

  const formalizedBusiness = watch('formalizedBusiness');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <IconIdBadge2 className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold">
          Credencial de Perfil y Formalización
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Identidad validada</Label>
          <Controller
            control={control}
            name="identityValidated"
            render={({ field }) => (
              <ToggleField value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Nivel educativo</Label>
          <Controller
            control={control}
            name="educationLevel"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) =>
                  field.onChange(v ?? 'secondary')
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  <SelectItem value="primary">Primaria</SelectItem>
                  <SelectItem value="secondary">Secundaria</SelectItem>
                  <SelectItem value="technical">Técnico</SelectItem>
                  <SelectItem value="undergraduate">
                    Universitario
                  </SelectItem>
                  <SelectItem value="postgraduate">Posgrado</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="municipality">Municipio *</Label>
          <Input
            {...register('municipality')}
            placeholder="Ej: Medellín"
          />
          {errors.municipality && (
            <p className="text-xs text-destructive">
              {errors.municipality.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Zona</Label>
          <Controller
            control={control}
            name="zone"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) =>
                  field.onChange(v ?? 'urban')
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urban">Urbano</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                  <SelectItem value="periurban">Periurbano</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Proveedor principal del hogar</Label>
          <Controller
            control={control}
            name="mainHouseholdProvider"
            render={({ field }) => (
              <ToggleField value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="householdIncome">Ingreso del hogar (COP)</Label>
          <Input
            type="number"
            {...register('householdIncome', { valueAsNumber: true })}
          />
          {errors.householdIncome && (
            <p className="text-xs text-destructive">
              {errors.householdIncome.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Negocio formalizado</Label>
          <Controller
            control={control}
            name="formalizedBusiness"
            render={({ field }) => (
              <ToggleField value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {formalizedBusiness && (
          <div className="space-y-1.5">
            <Label htmlFor="nit">NIT</Label>
            <Input
              {...register('nit')}
              placeholder="Ej: 900123456-7"
            />
          </div>
        )}
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
          <Label>Tamaño de empresa</Label>
          <Controller
            control={control}
            name="companySize"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) =>
                  field.onChange(v ?? 'micro')
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="micro">Micro</SelectItem>
                  <SelectItem value="small">Pequeña</SelectItem>
                  <SelectItem value="medium">Mediana</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                  <SelectItem value="unknown">Desconocido</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Acceso a internet</Label>
          <Controller
            control={control}
            name="internetAccess"
            render={({ field }) => (
              <ToggleField value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm font-medium">Seguridad social (opcional)</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Tiene seguridad social</Label>
            <Controller
              control={control}
              name="socialSecurityCoverage.hasSocialSecurity"
              render={({ field }) => (
                <ToggleField
                  value={field.value ?? false}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tiene pensión</Label>
            <Controller
              control={control}
              name="socialSecurityCoverage.hasPension"
              render={({ field }) => (
                <ToggleField
                  value={field.value ?? false}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm font-medium">Formalización del empleo</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Empleos formales</Label>
            <Input
              type="number"
              {...register('employmentFormalization.formalizedJobsCount', {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Empleos informales</Label>
            <Input
              type="number"
              {...register('employmentFormalization.informalJobsCount', {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Nivel de trazabilidad</Label>
          <Controller
            control={control}
            name="traceabilityLevel"
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
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="low">Bajo</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Nivel de formalización</Label>
          <Controller
            control={control}
            name="formalizationLevel"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) =>
                  field.onChange(v ?? 'low')
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="low">Bajo</SelectItem>
                  <SelectItem value="none">Ninguno</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Señal de estabilidad</Label>
          <Controller
            control={control}
            name="applicantStabilitySignal"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) =>
                  field.onChange(v ?? 'moderate')
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strong">Fuerte</SelectItem>
                  <SelectItem value="moderate">Moderada</SelectItem>
                  <SelectItem value="weak">Débil</SelectItem>
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
        <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          Generar Credencial &rarr;
        </Button>
      </div>
    </form>
  );
}
