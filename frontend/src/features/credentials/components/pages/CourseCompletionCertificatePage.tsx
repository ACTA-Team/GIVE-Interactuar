'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/helpers/date';
import type { Credential } from '../../types';
import { LinkedInShareButton } from '../ui/LinkedInShareButton';

const STATUS_LABELS: Record<Credential['status'], string> = {
  draft: 'Borrador',
  issued: 'Emitida',
  revoked: 'Revocada',
  expired: 'Expirada',
  pending_endorsement: 'Pendiente',
};

export function CourseCompletionCertificatePage({
  credential,
}: {
  credential: Credential;
}) {
  const claims = credential.publicClaims as {
    holderName?: string;
    courseName?: string;
  };

  const isSimulated = credential.metadata?.simulated === true;

  const pdfUrl = `/api/credentials/${credential.publicId}/constancia`;
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/credential/${credential.publicId}`
      : `/credential/${credential.publicId}`;

  const issuedDateLabel = credential.issuedAt
    ? formatDate(credential.issuedAt)
    : '—';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start max-lg:grid-cols-1 max-md:gap-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <iframe
            src={pdfUrl}
            title={`Constancia — ${claims.holderName ?? ''}`}
            className="h-[70vh] w-full border-0 md:h-[600px]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 pb-6 space-y-4 max-md:pt-4 max-md:pb-4 max-md:px-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground max-md:text-base">
              Compartir credencial
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Descarga la constancia en PDF para compartirla por correo,
              redes sociales o mensajería.
            </p>
            {isSimulated && (
              <p className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                Simulada — pendiente de emisión real en blockchain
              </p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Información de la credencial
            </p>
            <p className="text-sm font-semibold text-foreground">
              {credential.title}
            </p>
            {claims.holderName && (
              <p className="text-sm text-muted-foreground">
                {claims.holderName}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full"
              variant="default"
              render={<a href={`${pdfUrl}?download=1`} />}
            >
              Descargar PDF
            </Button>
            <LinkedInShareButton url={shareUrl} />
          </div>

          <div className="mt-4 border-t pt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Información de la credencial
            </p>
            <dl className="space-y-1 text-xs">
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Emisor</dt>
                <dd className="text-right font-medium">Interactuar</dd>
              </div>
              {credential.issuerDid && (
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-muted-foreground">DID del emisor</dt>
                  <dd className="font-mono text-right break-all">
                    {credential.issuerDid}
                  </dd>
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Tipo de credencial</dt>
                <dd className="text-right">
                  {credential.credentialType.toUpperCase()}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Estado</dt>
                <dd className="text-right">
                  {STATUS_LABELS[credential.status]}
                </dd>
              </div>
              {credential.issuedAt && (
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-muted-foreground">Fecha de emisión</dt>
                  <dd className="text-right">{issuedDateLabel}</dd>
                </div>
              )}
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
