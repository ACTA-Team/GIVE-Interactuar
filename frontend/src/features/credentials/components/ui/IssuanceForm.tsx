'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('credentials');
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
          {t('issuanceForm.entrepreneurId')}
        </label>
        <input
          {...register('entrepreneurId')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder={t('issuanceForm.entrepreneurIdPlaceholder')}
        />
        {errors.entrepreneurId && (
          <p className="mt-1 text-xs text-red-600">
            {errors.entrepreneurId.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('issuanceForm.type')}
        </label>
        <select
          {...register('credentialType')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="impact">{t('issuanceForm.impactOption')}</option>
          <option value="behavior">{t('issuanceForm.behaviorOption')}</option>
          <option value="profile">{t('issuanceForm.profileOption')}</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('issuanceForm.titleLabel')}
        </label>
        <input
          {...register('title')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder={t('issuanceForm.titlePlaceholder')}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('issuanceForm.description')}
        </label>
        <textarea
          {...register('description')}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder={t('issuanceForm.descriptionPlaceholder')}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('issuanceForm.operatorNote')}
        </label>
        <textarea
          {...register('operatorNote')}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder={t('issuanceForm.operatorNotePlaceholder')}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {t('issuanceForm.submit')}
      </Button>
    </form>
  );
}
