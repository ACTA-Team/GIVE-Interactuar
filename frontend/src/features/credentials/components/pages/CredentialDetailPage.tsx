'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/lib/helpers/date';
import {
  ArrowLeft,
  Link2,
  Clock,
  BarChart3,
  Activity,
  UserCheck,
  GraduationCap,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import type { Credential, CredentialType } from '../../types';

interface CredentialDetailPageProps {
  credential: Credential;
}

const STATUS_VARIANT: Record<
  Credential['status'],
  'default' | 'success' | 'warning' | 'danger' | 'info'
> = {
  draft: 'default',
  issued: 'success',
  revoked: 'danger',
  expired: 'warning',
  pending_endorsement: 'info',
};

const TYPE_ICON: Record<CredentialType, typeof BarChart3> = {
  impact: BarChart3,
  behavior: Activity,
  profile: UserCheck,
  mba: GraduationCap,
};

const TYPE_COLOR: Record<CredentialType, string> = {
  impact: 'bg-blue-500/10 text-blue-600',
  behavior: 'bg-amber-500/10 text-amber-600',
  profile: 'bg-violet-500/10 text-violet-600',
  mba: 'bg-emerald-500/10 text-emerald-600',
};

function CopyButton({ text }: { text: string }) {
  const tc = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
    >
      {copied ? (
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? tc('buttons.copied') : tc('buttons.copy')}
    </button>
  );
}

function ClaimsGrid({
  claims,
  getClaimLabel,
  formatClaimValue,
}: {
  claims: Record<string, unknown>;
  getClaimLabel: (key: string) => string;
  formatClaimValue: (key: string, value: unknown) => string;
}) {
  const t = useTranslations('credentials');
  const entries = Object.entries(claims).filter(
    ([key]) =>
      key !== '@context' &&
      key !== 'type' &&
      key !== 'issuer' &&
      key !== 'validFrom' &&
      key !== 'id',
  );

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        {t('detail.noDataAvailable')}
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-lg border bg-muted/30 px-3 py-2.5">
          <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            {getClaimLabel(key)}
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground wrap-break-word">
            {formatClaimValue(key, value)}
          </dd>
        </div>
      ))}
    </div>
  );
}

export function CredentialDetailPage({
  credential,
}: CredentialDetailPageProps) {
  const tc = useTranslations('common');
  const t = useTranslations('credentials');
  const Icon = TYPE_ICON[credential.credentialType];

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

  const claimLabels = t.raw('claimLabels') as Record<string, string>;
  const getClaimLabel = (key: string) => claimLabels[key] ?? key;

  const formatClaimValue = (key: string, value: unknown): string => {
    if (key === 'id') return '—';
    if (value === null || value === undefined) return '—';
    if (key === 'activeCredit' && typeof value === 'object' && value !== null) {
      const v = value as { exists?: boolean | null };
      if (v.exists === true) {
        return t('forms.creditCurrent');
      }
      if (v.exists === false) {
        return t('forms.notValidated');
      }
      return String(value);
    }
    if (typeof value === 'boolean')
      return value ? t('booleanYes') : t('booleanNo');
    if (typeof value === 'number') {
      if (
        key.includes('sales') ||
        key.includes('Sales') ||
        key.includes('assets') ||
        key.includes('liabilities') ||
        key.includes('costs') ||
        key.includes('Income') ||
        key.includes('income')
      ) {
        return `$${value.toLocaleString('es-CO')}`;
      }
      if (
        key.includes('Percent') ||
        key.includes('Ratio') ||
        key.includes('Margin')
      ) {
        return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
      }
      return value.toLocaleString('es-CO');
    }
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;
      if ('startDate' in obj && 'endDate' in obj) {
        const fmt = (d: unknown) => {
          try {
            return new Intl.DateTimeFormat('es-CO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }).format(new Date(String(d)));
          } catch {
            return String(d);
          }
        };
        return `${fmt(obj.startDate)} — ${fmt(obj.endDate)}`;
      }
      return JSON.stringify(value);
    }
    if (typeof value === 'string') {
      const v = value as string;

      if (key === 'registryValidation') {
        const map: Record<string, string> = {
          validated: t('forms.validated'),
          partially_validated: t('forms.partiallyValidated'),
          not_validated: t('forms.notValidated'),
        };
        if (map[v]) return map[v];
      }

      if (key === 'monthlyIncomeStability') {
        const map: Record<string, string> = {
          high: t('forms.high'),
          medium: t('forms.medium'),
          low: t('forms.low'),
          volatile: t('forms.volatile'),
        };
        if (map[v]) return map[v];
      }

      if (key === 'commercialStability') {
        const map: Record<string, string> = {
          stable: t('forms.stable'),
          seasonal: t('forms.seasonal'),
          volatile: t('forms.volatile'),
        };
        if (map[v]) return map[v];
      }

      if (key === 'financialTrend') {
        const map: Record<string, string> = {
          improving: t('forms.improving'),
          stable: t('forms.stable'),
          deteriorating: t('forms.deteriorating'),
        };
        if (map[v]) return map[v];
      }

      if (
        key === 'estimatedOperationalCapacity' ||
        key === 'paymentCapacitySignal'
      ) {
        const map: Record<string, string> = {
          strong: t('forms.signalStrong'),
          moderate: t('forms.signalModerate'),
          weak: t('forms.signalWeak'),
          acceptable: t('forms.signalModerate'),
          critical: t('forms.signalWeak'),
        };
        if (map[v]) return map[v];
      }

      if (key === 'leverageLevel') {
        const map: Record<string, string> = {
          low: t('forms.levelLow'),
          moderate: t('forms.levelMedium'),
          high: t('forms.levelHigh'),
        };
        if (map[v]) return map[v];
      }

      if (key === 'traceabilityLevel' || key === 'formalizationLevel') {
        const map: Record<string, string> = {
          high: t('forms.levelHigh'),
          medium: t('forms.levelMedium'),
          low: t('forms.levelLow'),
          none: t('forms.levelNone'),
        };
        if (map[v]) return map[v];
      }

      if (key === 'applicantStabilitySignal') {
        const map: Record<string, string> = {
          strong: t('forms.signalStrong'),
          moderate: t('forms.signalModerate'),
          weak: t('forms.signalWeak'),
        };
        if (map[v]) return map[v];
      }

      if (key === 'creditSegmentStart' || key === 'creditSegmentEnd') {
        const map: Record<string, string> = {
          microcredit: t('forms.creditSegments.microcredit'),
          individual: t('forms.creditSegments.individual'),
          solidary: t('forms.creditSegments.solidary'),
          communal: t('forms.creditSegments.communal'),
        };
        if (map[v]) return map[v];
      }
    }

    const trendLabels: Record<string, string> = {
      growing: t('trendLabels.growing'),
      stable: t('trendLabels.stable'),
      deteriorating: t('trendLabels.deteriorating'),
    };
    if (trendLabels[String(value)]) return trendLabels[String(value)];
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href={ROUTES.credentials.client(credential.entrepreneurId)}>
            <button className="mt-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${TYPE_COLOR[credential.credentialType]}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {credential.title}
              </h1>
            </div>
            {credential.description && (
              <p className="text-muted-foreground mt-1 ml-10">
                {credential.description}
              </p>
            )}
          </div>
        </div>
        <Badge
          variant={STATUS_VARIANT[credential.status]}
          className="shrink-0 text-sm px-3 py-1"
        >
          {getStatusLabel(credential.status)}
        </Badge>
      </div>

      {/* Credential metadata */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-muted-foreground" />
            {t('detail.credentialInfo')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                {t('detail.type')}
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {tc(`credentialTypes.${credential.credentialType}`)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                {t('detail.status')}
              </p>
              <div className="mt-0.5">
                <Badge variant={STATUS_VARIANT[credential.status]}>
                  {getStatusLabel(credential.status)}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                {t('detail.publicId')}
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                <p className="text-sm font-mono text-foreground truncate">
                  {credential.publicId}
                </p>
                <CopyButton text={credential.publicId} />
              </div>
            </div>
            {credential.issuerDid && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  {t('detail.issuerDid')}
                </p>
                <div className="mt-0.5 flex items-center gap-1">
                  <p className="text-sm font-mono text-foreground truncate">
                    {credential.issuerDid}
                  </p>
                  <CopyButton text={credential.issuerDid} />
                </div>
              </div>
            )}
            {credential.actaVcId && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  {t('detail.actaVcId')}
                </p>
                <div className="mt-0.5 flex items-center gap-1">
                  <p className="text-sm font-mono text-foreground truncate">
                    {credential.actaVcId}
                  </p>
                  <CopyButton text={credential.actaVcId} />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            {t('detail.dates')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                {t('detail.created')}
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {formatDateTime(credential.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                {t('detail.issued')}
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {credential.issuedAt
                  ? formatDateTime(credential.issuedAt)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                {t('detail.expires')}
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {credential.expiresAt
                  ? formatDateTime(credential.expiresAt)
                  : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credential claims data */}
      {credential.publicClaims &&
        Object.keys(credential.publicClaims).length > 0 && (
          <Card>
            <CardContent className="pt-5 pb-5">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {t('detail.credentialData')}
              </h2>
              <ClaimsGrid
                claims={credential.publicClaims}
                getClaimLabel={getClaimLabel}
                formatClaimValue={formatClaimValue}
              />
            </CardContent>
          </Card>
        )}
    </div>
  );
}
