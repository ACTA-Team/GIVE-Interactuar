'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { Lock, LockOpen } from 'lucide-react';
import type { ClassInfo } from '@/lib/class-schedule';
import { ROUTES } from '@/lib/constants/routes';
import { useToggleClassStatus } from '../../hooks/useToggleClassStatus';
import { ClassQrDialog } from './ClassQrDialog';

function formatScheduledAt(scheduledAt: string | null, locale: string): string | null {
  if (!scheduledAt) return null;
  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function ClassRow({
  folderName,
  classInfo,
}: {
  folderName: string;
  classInfo: ClassInfo;
}) {
  const t = useTranslations('courses');
  const locale = useLocale();
  const { mutate, isPending } = useToggleClassStatus(folderName);

  const isOpen = classInfo.status === 'abierta';
  const formattedDate = formatScheduledAt(classInfo.scheduledAt, locale);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const link = `${origin}${ROUTES.asistencia(folderName, classInfo.number)}`;

  const handleToggle = () => {
    mutate({
      classNumber: classInfo.number,
      status: isOpen ? 'cerrada' : 'abierta',
    });
  };

  return (
    <div className="flex flex-col gap-3 border-b py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border font-semibold text-foreground">
          {String(classInfo.number).padStart(2, '0')}
        </div>
        <div>
          <p className="font-medium text-foreground">
            {t('detail.classNumber', { number: classInfo.number })}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formattedDate ?? t('detail.noDate')}</span>
            <Badge variant={isOpen ? 'success' : 'secondary'}>
              {isOpen ? t('status.open') : t('status.closed')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <CopyButton text={link} />
        <ClassQrDialog classNumber={classInfo.number} link={link} />
        <Button
          variant={isOpen ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggle}
          disabled={isPending}
        >
          {isOpen ? (
            <Lock className="mr-1.5 h-3.5 w-3.5" />
          ) : (
            <LockOpen className="mr-1.5 h-3.5 w-3.5" />
          )}
          {isOpen ? t('actions.closeClass') : t('actions.openClass')}
        </Button>
      </div>
    </div>
  );
}
