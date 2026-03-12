'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setLocale } from '@/i18n/actions';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { cn } from '@/lib/utils';

const LOCALE_LABELS: Record<Locale, string> = {
  es: 'ES',
  en: 'EN',
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations('common');

  const handleChange = (locale: Locale) => {
    if (locale === currentLocale) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-lg bg-muted p-0.5',
        className,
      )}
      role="radiogroup"
      aria-label={t('language')}
    >
      {locales.map((locale) => (
        <button
          key={locale}
          role="radio"
          aria-checked={locale === currentLocale}
          onClick={() => handleChange(locale)}
          disabled={isPending}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-semibold transition-all',
            locale === currentLocale
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
            isPending && 'opacity-50 cursor-wait',
          )}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
