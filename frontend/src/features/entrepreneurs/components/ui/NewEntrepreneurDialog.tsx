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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { BUSINESS_TYPES } from '../../types/stages';

export function NewEntrepreneurDialog() {
  const t = useTranslations('entrepreneurs');
  const tc = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');

  const handleCreate = () => {
    if (!name || !email || !phone || !businessName || !businessType) return;

    // TODO: wire to entrepreneur service
    console.log('Create entrepreneur', {
      name,
      email,
      phone,
      businessName,
      businessType,
    });

    setName('');
    setEmail('');
    setPhone('');
    setBusinessName('');
    setBusinessType('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('newEntrepreneur')}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('newDialog.title')}</DialogTitle>
          <DialogDescription>{t('newDialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-name">{t('newDialog.fullName')}</Label>
            <Input
              id="new-name"
              placeholder={t('newDialog.fullNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-email">{t('newDialog.email')}</Label>
            <Input
              id="new-email"
              type="email"
              placeholder={t('newDialog.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-phone">{t('newDialog.phone')}</Label>
            <Input
              id="new-phone"
              placeholder={t('newDialog.phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-business-name">
              {t('newDialog.businessName')}
            </Label>
            <Input
              id="new-business-name"
              placeholder={t('newDialog.businessNamePlaceholder')}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-business-type">
              {t('newDialog.businessType')}
            </Label>
            <Select
              value={businessType}
              onValueChange={(v: string | null) => setBusinessType(v ?? '')}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t('newDialog.businessTypePlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tc('buttons.cancel')}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              !name || !email || !phone || !businessName || !businessType
            }
          >
            {t('newDialog.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
