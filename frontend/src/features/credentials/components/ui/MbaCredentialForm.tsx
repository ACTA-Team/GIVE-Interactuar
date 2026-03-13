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
  const t = useTranslations('credentials');
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
      programDisplaySubtitle:
        'Aliado: Alianza Comfama · Nivel 2 · G7 Centro',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
          <IconSchool className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold">{t('forms.mbaTitle')}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="holderName">{t('forms.mbaHolderName')}</Label>
          <Input {...register('holderName')} readOnly />
          {errors.holderName && (
            <p className="text-xs text-destructive">
              {errors.holderName.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">{t('forms.mbaCompany')}</Label>
          <Input {...register('company')} readOnly />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="programDisplayTitle">
          {t('forms.mbaProgramDisplayTitle')}
        </Label>
        <Input {...register('programDisplayTitle')} readOnly />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="programDisplaySubtitle">
          {t('forms.mbaProgramDisplaySubtitle')}
        </Label>
        <Input {...register('programDisplaySubtitle')} readOnly />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="programName">{t('forms.mbaProgramName')}</Label>
          <Input {...register('programName')} readOnly />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cohortYear">{t('forms.mbaCohortYear')}</Label>
          <Input type="number" {...register('cohortYear', { valueAsNumber: true })} readOnly />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cohortLabel">{t('forms.mbaCohortLabel')}</Label>
          <Input {...register('cohortLabel')} readOnly />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="partnerName">{t('forms.mbaPartnerName')}</Label>
          <Input {...register('partnerName')} readOnly />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="programLevel">{t('forms.mbaProgramLevel')}</Label>
          <Input {...register('programLevel')} readOnly />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="programGroup">{t('forms.mbaProgramGroup')}</Label>
          <Input {...register('programGroup')} readOnly />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          &larr; {tc('buttons.back')}
        </Button>
        <Button
          type="submit"
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {t('issuance.generateCredential')} &rarr;
        </Button>
      </div>
    </form>
  );
}

