'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, List } from 'lucide-react';
import type { useBatchIssueCourseCredentials } from '@/features/courses/hooks/useBatchIssueCourseCredentials';
import { ACTA_ISSUANCE_SIMULATED } from '@/lib/acta/simulateIssuance';

export function SuccessStep({
  batch,
  onViewStudents,
}: {
  batch: ReturnType<typeof useBatchIssueCourseCredentials>;
  onViewStudents: () => void;
}) {
  const t = useTranslations('certificados');

  const succeeded = batch.items.filter((i) => i.status === 'success').length;
  const failed = batch.items.filter((i) => i.status === 'error').length;
  const emailsSent = batch.items.filter((i) => i.emailStatus === 'sent').length;
  const emailsFailed = batch.items.filter(
    (i) => i.emailStatus === 'error',
  ).length;

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {t('success.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('success.summary', { succeeded, failed })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('success.emailSummary', {
            sent: emailsSent,
            failed: emailsFailed,
          })}
        </p>
        {ACTA_ISSUANCE_SIMULATED && (
          <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            {t('success.simulatedNote')}
          </p>
        )}
        <Button onClick={onViewStudents} className="mt-2">
          <List className="mr-2 h-4 w-4" />
          {t('success.viewStudents')}
        </Button>
      </CardContent>
    </Card>
  );
}
