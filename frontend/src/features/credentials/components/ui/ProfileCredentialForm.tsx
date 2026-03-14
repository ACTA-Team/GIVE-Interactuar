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
import { IconIdBadge2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
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

export function ProfileCredentialForm({
  onSubmit,
  onBack,
  defaultValues,
}: ProfileCredentialFormProps) {
  const t = useTranslations('credentials');
  const tc = useTranslations('common');
  const {
    register,
    control,
    handleSubmit,
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

  const formalizedBusiness = useWatch({ control, name: 'formalizedBusiness' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 min-w-0">
      <div className="flex items-center gap-2 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <IconIdBadge2 className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold">{t('forms.profileTitle')}</h3>
      </div>

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label>{t('forms.identityValidated')}</Label>
          <Controller
            control={control}
            name="identityValidated"
            render={({ field }) => (
              <ToggleField value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t('forms.educationLevel')}</Label>
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
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t('forms.educationNone')}
                  </SelectItem>
                  <SelectItem value="primary">
                    {t('forms.educationPrimary')}
                  </SelectItem>
                  <SelectItem value="secondary">
                    {t('forms.educationSecondary')}
                  </SelectItem>
                  <SelectItem value="technical">
                    {t('forms.educationTechnical')}
                  </SelectItem>
                  <SelectItem value="undergraduate">
                    {t('forms.educationUndergrad')}
                  </SelectItem>
                  <SelectItem value="postgraduate">
                    {t('forms.educationPostgrad')}
                  </SelectItem>
                  <SelectItem value="other">
                    {t('forms.educationOther')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="municipality">{t('forms.municipality')}</Label>
          <Input
            {...register('municipality')}
            placeholder={t('forms.municipalityPlaceholder')}
          />
          {errors.municipality && (
            <p className="text-xs text-destructive">
              {errors.municipality.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{t('forms.zone')}</Label>
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
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urban">{t('forms.zoneUrban')}</SelectItem>
                  <SelectItem value="rural">{t('forms.zoneRural')}</SelectItem>
                  <SelectItem value="periurban">
                    {t('forms.zonePeriurban')}
                  </SelectItem>
                  <SelectItem value="other">{t('forms.zoneOther')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label>{t('forms.mainHouseholdProvider')}</Label>
          <Controller
            control={control}
            name="mainHouseholdProvider"
            render={({ field }) => (
              <ToggleField value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="householdIncome">{t('forms.householdIncome')}</Label>
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

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label>{t('forms.formalizedBusiness')}</Label>
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
            <Label htmlFor="nit">{t('forms.nit')}</Label>
            <Input
              {...register('nit')}
              placeholder={t('forms.nitPlaceholder')}
            />
          </div>
        )}
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
          <Label>{t('forms.companySize')}</Label>
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
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="micro">{t('forms.micro')}</SelectItem>
                  <SelectItem value="small">{t('forms.small')}</SelectItem>
                  <SelectItem value="medium">
                    {t('forms.mediumSize')}
                  </SelectItem>
                  <SelectItem value="large">{t('forms.large')}</SelectItem>
                  <SelectItem value="unknown">{t('forms.unknown')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t('forms.internetAccess')}</Label>
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
        <p className="text-sm font-medium">{t('forms.socialSecurity')}</p>
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label>{t('forms.hasSocialSecurity')}</Label>
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
            <Label>{t('forms.hasPension')}</Label>
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
        <p className="text-sm font-medium">
          {t('forms.employmentFormalization')}
        </p>
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label>{t('forms.formalJobsCount')}</Label>
            <Input
              type="number"
              {...register('employmentFormalization.formalizedJobsCount', {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('forms.informalJobsCount')}</Label>
            <Input
              type="number"
              {...register('employmentFormalization.informalJobsCount', {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label>{t('forms.traceabilityLevel')}</Label>
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
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t('forms.levelHigh')}</SelectItem>
                  <SelectItem value="medium">
                    {t('forms.levelMedium')}
                  </SelectItem>
                  <SelectItem value="low">{t('forms.levelLow')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t('forms.formalizationLevel')}</Label>
          <Controller
            control={control}
            name="formalizationLevel"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v: string | null) => field.onChange(v ?? 'low')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t('forms.levelHigh')}</SelectItem>
                  <SelectItem value="medium">
                    {t('forms.levelMedium')}
                  </SelectItem>
                  <SelectItem value="low">{t('forms.levelLow')}</SelectItem>
                  <SelectItem value="none">{t('forms.levelNone')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t('forms.stabilitySignal')}</Label>
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
                  <SelectValue placeholder={t('forms.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strong">
                    {t('forms.signalStrong')}
                  </SelectItem>
                  <SelectItem value="moderate">
                    {t('forms.signalModerate')}
                  </SelectItem>
                  <SelectItem value="weak">{t('forms.signalWeak')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 max-md:flex-col max-md:items-stretch">
        <Button type="button" variant="outline" onClick={onBack} className="max-md:w-full">
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
