'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted transition-colors',
        className,
      )}
    >
      {copied ? (
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? t('buttons.copied') : t('buttons.copy')}
    </button>
  );
}
