'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useCreateClass } from '../../hooks/useCreateClass';

export function NewClassDialog({ folderName }: { folderName: string }) {
  const t = useTranslations('courses');
  const tc = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const { mutate, isPending } = useCreateClass(folderName);

  const handleCreate = () => {
    if (!scheduledAt) return;

    mutate(scheduledAt, {
      onSuccess: () => {
        setScheduledAt('');
        setIsOpen(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('detail.newSession')}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{t('newClassDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('newClassDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-class-date">
              {t('newClassDialog.dateLabel')}
            </Label>
            <Input
              id="new-class-date"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tc('buttons.cancel')}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!scheduledAt || isPending}
          >
            {t('newClassDialog.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
