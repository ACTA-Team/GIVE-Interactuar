'use client';

import { useTranslations } from 'next-intl';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CopyButton } from '@/components/ui/CopyButton';
import { QrCode } from 'lucide-react';

export function ClassQrDialog({
  classNumber,
  link,
}: {
  classNumber: number;
  link: string;
}) {
  const t = useTranslations('courses');

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon" aria-label={t('actions.showQr')}>
            <QrCode className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>{t('detail.classNumber', { number: classNumber })}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="rounded-lg bg-white p-4 ring-1 ring-foreground/10">
            <QRCodeCanvas
              value={link}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              includeMargin={false}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 rounded-md bg-muted px-2 py-1">
            <span className="truncate text-xs text-muted-foreground">
              {link}
            </span>
            <CopyButton text={link} className="shrink-0" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
