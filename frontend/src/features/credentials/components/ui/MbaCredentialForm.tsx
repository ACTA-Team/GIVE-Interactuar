'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { IconSchool } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import {
  mbaCredentialFormSchema,
  type MbaCredentialFormInput,
} from '../../schemas/mbaCredentialSchema';

interface MbaCredentialFormProps {
  onSubmit: (data: MbaCredentialFormInput) => void;
  onBack: () => void;
  defaultValues?: Partial<MbaCredentialFormInput>;
}

export function MbaCredentialForm({
  onSubmit,
  onBack,
  defaultValues,
}: MbaCredentialFormProps) {
  const t = useTranslations();
  const tc = useTranslations('common');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MbaCredentialFormInput>({
    resolver: zodResolver(mbaCredentialFormSchema),
    defaultValues: {
      holderName: '',
      company: '',
      programName: 'MBA Empresarial',
      cohortYear: 2024,
      cohortLabel: 'Cohorte 2024',
      partnerName: 'Alianza Comfama',
      programLevel: 'Nivel 2',
      programGroup: 'G7 Centro',
      programDisplayTitle: 'MBA Empresarial · Cohorte 2024',
      programDisplaySubtitle: 'Aliado: Alianza Comfama · Nivel 2 · G7 Centro',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 min-w-0 w-full max-w-full overflow-x-hidden">
      <div className="flex items-center gap-2 pb-2 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
          <IconSchool className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold wrap-break-word">{t('credentials.forms.mbaTitle')}</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="holderName" className="block wrap-break-word">{t('credentials.forms.mbaHolderName')}</Label>
          <Input {...register('holderName')} readOnly className="min-w-0 w-full bg-muted/50" />
          {errors.holderName && (
            <p className="text-xs text-destructive">
              {errors.holderName.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="company" className="block wrap-break-word">{t('credentials.forms.mbaCompany')}</Label>
          <Input {...register('company')} readOnly className="min-w-0 w-full bg-muted/50" />
        </div>
      </div>

      <div className="space-y-1.5 min-w-0">
        <Label htmlFor="programDisplayTitle" className="block wrap-break-word">
          {t('credentials.forms.mbaProgramDisplayTitle')}
        </Label>
        <Input {...register('programDisplayTitle')} readOnly className="min-w-0 w-full bg-muted/50" />
      </div>

      <div className="space-y-1.5 min-w-0">
        <Label htmlFor="programDisplaySubtitle" className="block wrap-break-word">
          {t('credentials.forms.mbaProgramDisplaySubtitle')}
        </Label>
        <Input {...register('programDisplaySubtitle')} readOnly className="min-w-0 w-full bg-muted/50" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="programName" className="block wrap-break-word">{t('credentials.forms.mbaProgramName')}</Label>
          <Input {...register('programName')} readOnly className="min-w-0 w-full bg-muted/50" />
        </div>
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="cohortYear" className="block wrap-break-word">{t('credentials.forms.mbaCohortYear')}</Label>
          <Input
            type="number"
            {...register('cohortYear', { valueAsNumber: true })}
            readOnly
            className="min-w-0 w-full bg-muted/50"
          />
        </div>
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="cohortLabel" className="block wrap-break-word">{t('credentials.forms.mbaCohortLabel')}</Label>
          <Input {...register('cohortLabel')} readOnly className="min-w-0 w-full bg-muted/50" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="partnerName" className="block wrap-break-word">{t('credentials.forms.mbaPartnerName')}</Label>
          <Input {...register('partnerName')} readOnly className="min-w-0 w-full bg-muted/50" />
        </div>
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="programLevel" className="block wrap-break-word">{t('credentials.forms.mbaProgramLevel')}</Label>
          <Input {...register('programLevel')} readOnly className="min-w-0 w-full bg-muted/50" />
        </div>
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="programGroup" className="block wrap-break-word">{t('credentials.forms.mbaProgramGroup')}</Label>
          <Input {...register('programGroup')} readOnly className="min-w-0 w-full bg-muted/50" />
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
          {t('credentials.issuance.generateCredential')} &rarr;
        </Button>
      </div>
    </form>
  );
}
