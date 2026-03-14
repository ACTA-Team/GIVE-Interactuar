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
import { IconShieldCheck } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
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

const CREDIT_SEGMENT_KEYS = [
  'microcredit',
  'individual',
  'solidary',
  'communal',
] as const;

function ToggleField({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const tc = useTranslations('common');
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
        {tc('toggle.yes')}
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
        {tc('toggle.no')}
      </button>
    </div>
  );
}

export function BehaviorCredentialForm({
  onSubmit,
  onBack,
  defaultValues,
}: BehaviorCredentialFormProps) {
  const t = useTranslations('credentials');
  const tc = useTranslations('common');
  const {
    register,
    control,
    handleSubmit,
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

  const averageSales = useWatch({ control, name: 'averageSales' });
  const costsAndExpenses = useWatch({ control, name: 'costsAndExpenses' });
  const assets = useWatch({ control, name: 'assets' });
  const liabilities = useWatch({ control, name: 'liabilities' });
  const activeCreditExists = useWatch({ control, name: 'activeCredit.exists' });
  const financialTrend = useWatch({ control, name: 'financialTrend' });

  const derived = computeBehaviorDerivedFields({
    averageSales: averageSales || 0,
    costsAndExpenses: costsAndExpenses || 0,
    assets: assets || 0,
    liabilities: liabilities || 0,
    financialTrend: financialTrend || 'stable',
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 min-w-0">
      <div className="flex items-center gap-2 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          <IconShieldCheck className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold">{t('forms.behaviorTitle')}</h3>
      </div>

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="creditSegmentStart">{t('forms.segmentStart')}</Label>
          <Controller
            control={control}
            name="creditSegmentStart"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) => field.onChange(v ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_SEGMENT_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`forms.creditSegments.${key}`)}
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
          <Label htmlFor="creditSegmentEnd">{t('forms.segmentEnd')}</Label>
          <Controller
            control={control}
            name="creditSegmentEnd"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) => field.onChange(v ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_SEGMENT_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`forms.creditSegments.${key}`)}
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

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label>{t('forms.activeCredit')}</Label>
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
          <Label htmlFor="averageSales">{t('forms.monthlySales')}</Label>
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
        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4 rounded-lg border border-border bg-muted/30 p-3">
          <div className="space-y-1.5">
            <Label>{t('forms.amount')}</Label>
            <Input
              type="number"
              {...register('activeCredit.amount', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('forms.currency')}</Label>
            <Input {...register('activeCredit.currency')} placeholder="COP" />
          </div>
          <div className="space-y-1.5">
            <Label>{t('forms.creditStatus')}</Label>
            <Controller
              control={control}
              name="activeCredit.status"
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  onValueChange={(v: string | null) => field.onChange(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('forms.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">
                      {t('forms.creditCurrent')}
                    </SelectItem>
                    <SelectItem value="late">
                      {t('forms.creditLate')}
                    </SelectItem>
                    <SelectItem value="restructured">
                      {t('forms.creditRestructured')}
                    </SelectItem>
                    <SelectItem value="closed">
                      {t('forms.creditClosed')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="costsAndExpenses">{t('forms.monthlyCosts')}</Label>
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
          <Label>{t('forms.estimatedMargin')}</Label>
          <div className="flex h-8 items-center rounded-lg bg-muted px-3 text-sm text-muted-foreground">
            {formatPercent(derived.estimatedOperatingMargin)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="assets">{t('forms.totalAssets')}</Label>
          <Input
            type="number"
            {...register('assets', { valueAsNumber: true })}
          />
          {errors.assets && (
            <p className="text-xs text-destructive">{errors.assets.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="liabilities">{t('forms.totalLiabilities')}</Label>
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

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label>{t('forms.liabilitiesRatio')}</Label>
          <div className="flex h-8 items-center rounded-lg bg-muted px-3 text-sm text-muted-foreground">
            {formatRatio(derived.liabilitiesToAssetsRatio)}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t('forms.businessStability')}</Label>
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
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">{t('forms.stable')}</SelectItem>
                  <SelectItem value="seasonal">
                    {t('forms.seasonal')}
                  </SelectItem>
                  <SelectItem value="volatile">
                    {t('forms.volatile')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label>{t('forms.registryValidation')}</Label>
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
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="validated">
                    {t('forms.validated')}
                  </SelectItem>
                  <SelectItem value="partially_validated">
                    {t('forms.partiallyValidated')}
                  </SelectItem>
                  <SelectItem value="not_validated">
                    {t('forms.notValidated')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newJobs">{t('forms.newJobs')}</Label>
          <Input
            type="number"
            {...register('newJobs', { valueAsNumber: true })}
          />
          {errors.newJobs && (
            <p className="text-xs text-destructive">{errors.newJobs.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label>{t('forms.incomeStability')}</Label>
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
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t('forms.high')}</SelectItem>
                  <SelectItem value="medium">{t('forms.medium')}</SelectItem>
                  <SelectItem value="low">{t('forms.low')}</SelectItem>
                  <SelectItem value="volatile">
                    {t('forms.volatile')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t('forms.financialTrend')}</Label>
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
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="improving">
                    {t('forms.improving')}
                  </SelectItem>
                  <SelectItem value="stable">{t('forms.stable')}</SelectItem>
                  <SelectItem value="deteriorating">
                    {t('forms.deteriorating')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
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
