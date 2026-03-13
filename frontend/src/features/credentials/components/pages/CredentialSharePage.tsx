'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toPng } from 'html-to-image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import type { Credential } from '@/features/credentials/types';
import Certificate from '../ui/Certificate';

interface CredentialSharePageProps {
  credential: Credential;
  holderName?: string;
  holderDocument?: string;
  issuedAtLabel?: string;
}

export function CredentialSharePage({
  credential,
  holderName,
  holderDocument,
  issuedAtLabel = '—',
}: CredentialSharePageProps) {
  const t = useTranslations('credentials');
  const tc = useTranslations('common');
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = useCallback(async () => {
    if (!certificateRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(certificateRef.current, {
        cacheBust: true,
        pixelRatio: 3,
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${credential.title || 'credencial'}.png`;
      link.click();
    } finally {
      setDownloading(false);
    }
  }, [credential.title]);

  const qrUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/credential/${credential.publicId}`
      : `/credential/${credential.publicId}`;

  const holderDid =
    (credential.metadata as { holderDid?: string })?.holderDid ??
    (credential.publicClaims as { holderDid?: string })?.holderDid ??
    undefined;

  const getStatusLabel = (status: Credential['status']) => {
    const labels: Record<Credential['status'], string> = {
      draft: tc('status.draft'),
      issued: tc('status.issued'),
      revoked: tc('status.revoked'),
      expired: tc('status.expired'),
      pending_endorsement: tc('status.pending'),
    };
    return labels[status];
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
      <Card className="overflow-hidden">
        <CardContent className="bg-white p-4 md:p-6 flex items-center justify-center">
          <div ref={certificateRef} className="w-full max-w-3xl">
            <Certificate
              holderName={holderName}
              holderDocument={holderDocument}
              qrUrl={qrUrl}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 pb-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t('share.title')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('share.description')}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('detail.credentialInfo')}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {credential.title}
            </p>
            {holderName && (
              <p className="text-sm text-muted-foreground">{holderName}</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              className="w-full"
              variant="default"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading
                ? t('share.downloadingImage')
                : t('share.downloadImage')}
            </Button>
          </div>

          {/* Credential technical details (from DB) */}
          <div className="mt-4 border-t pt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('detail.credentialInfo')}
            </p>
            <dl className="space-y-1 text-xs">
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">{t('share.issuer')}</dt>
                <dd className="text-right font-medium">Interactuar</dd>
              </div>
              {holderDid && (
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-muted-foreground">
                    {t('share.holderDid')}
                  </dt>
                  <dd className="font-mono text-right break-all">
                    {holderDid}
                  </dd>
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">
                  {t('share.typeLabel')}
                </dt>
                <dd className="text-right">
                  {credential.credentialType.toUpperCase()}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">
                  {t('share.statusLabel')}
                </dt>
                <dd className="text-right">
                  {getStatusLabel(credential.status)}
                </dd>
              </div>
              {credential.issuedAt && (
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-muted-foreground">
                    {t('share.issuedAtLabel')}
                  </dt>
                  <dd className="text-right">{issuedAtLabel}</dd>
                </div>
              )}
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
