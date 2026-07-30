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
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('credentials');
  const tc = useTranslations('common');
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 min-w-0">
      <div className="flex items-center gap-2 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
          <IconTrendingUp className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold">{t('forms.impactTitle')}</h3>
      </div>

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">{t('forms.companyName')}</Label>
          <Input
            {...register('companyName')}
            placeholder={t('forms.companyNamePlaceholder')}
          />
          {errors.companyName && (
            <p className="text-xs text-destructive">
              {errors.companyName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{t('forms.sector')}</Label>
          <Controller
            control={control}
            name="sector"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) => field.onChange(v ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('forms.select')} />
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

      <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="yearsInOperation">
            {t('forms.yearsInOperation')}
          </Label>
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
          <Label htmlFor="salesPreviousYear">{t('forms.salesPrevYear')}</Label>
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
          <Label htmlFor="salesCurrentYear">{t('forms.salesCurrYear')}</Label>
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
        <Label>{t('forms.salesVariation')}</Label>
        <div className="flex h-8 items-center rounded-lg bg-muted px-3 text-sm text-muted-foreground">
          {formatPercent(derived.salesVariationPercent)}
        </div>
      </div>

      <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="currentEmployees">
            {t('forms.currentEmployees')}
          </Label>
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
          <Label htmlFor="newJobsCreated">{t('forms.newJobsCreated')}</Label>
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
          <Label htmlFor="newFormalJobsCreated">{t('forms.formalJobs')}</Label>
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

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label>{t('forms.businessTrend')}</Label>
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
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="growing">{t('forms.growing')}</SelectItem>
                  <SelectItem value="stable">{t('forms.stable')}</SelectItem>
                  <SelectItem value="deteriorating">
                    {t('forms.inDeterioration')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">
          {t('forms.assessmentPeriod')}
        </Label>
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="assessmentPeriod.startDate">
              {t('forms.startDate')}
            </Label>
            <Input type="date" {...register('assessmentPeriod.startDate')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assessmentPeriod.endDate">
              {t('forms.endDate')}
            </Label>
            <Input type="date" {...register('assessmentPeriod.endDate')} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 max-md:flex-col max-md:items-stretch">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="max-md:w-full"
        >
          &larr; {tc('buttons.back')}
        </Button>
        <Button
          type="submit"
          className="bg-accent hover:bg-accent/90 text-accent-foreground max-md:w-full"
        >
          {t('issuance.generateCredential')} &rarr;
        </Button>
      </div>
    </form>
  );
}
