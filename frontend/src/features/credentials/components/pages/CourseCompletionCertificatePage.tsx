'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { Award } from 'lucide-react';
import type { Credential } from '../../types';

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

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
    studentDocument?: string;
    courseName?: string;
    classesAttended?: number;
    classesTotal?: number;
    attendancePercent?: number;
  };

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/credential/${credential.publicId}`
      : `/credential/${credential.publicId}`;

  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Award className="h-9 w-9 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Constancia de Finalización
        </h1>
        <p className="text-sm text-muted-foreground">
          Credencial verificable emitida en blockchain (Stellar).
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="h-1 w-full bg-primary" />
        <dl className="divide-y divide-border text-left">
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Estudiante
            </dt>
            <dd className="font-semibold text-primary">
              {claims.holderName ?? '—'}
            </dd>
          </div>
          {claims.studentDocument && (
            <div className="flex items-center justify-between px-5 py-4">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Documento
              </dt>
              <dd className="font-semibold text-foreground">
                {claims.studentDocument}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Curso
            </dt>
            <dd className="font-semibold text-foreground">
              {claims.courseName ?? '—'}
            </dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Asistencia
            </dt>
            <dd className="font-semibold text-foreground">
              {claims.classesAttended ?? '—'}/{claims.classesTotal ?? '—'} (
              {Math.round(claims.attendancePercent ?? 0)}%)
            </dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Emitida
            </dt>
            <dd className="font-semibold text-foreground">
              {formatDate(credential.issuedAt ?? undefined)}
            </dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Estado
            </dt>
            <dd className="font-semibold text-foreground">
              {STATUS_LABELS[credential.status]}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="rounded-lg bg-white p-3 ring-1 ring-foreground/10">
          <QRCodeCanvas
            value={shareUrl}
            size={140}
            bgColor="#ffffff"
            fgColor="#000000"
            includeMargin={false}
          />
        </div>
        {credential.issuerDid && (
          <p className="max-w-full truncate text-[10px] font-mono text-muted-foreground">
            {credential.issuerDid}
          </p>
        )}
        {credential.actaVcId && (
          <p className="max-w-full truncate text-[10px] font-mono text-muted-foreground">
            {credential.actaVcId}
          </p>
        )}
      </div>

      <p className="text-sm text-muted-foreground italic">
        Este documento certifica la finalización del curso y puede
        verificarse públicamente con este enlace.
      </p>
    </div>
  );
}
