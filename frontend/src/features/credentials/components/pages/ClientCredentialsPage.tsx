'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/helpers/date';
import {
  ArrowLeft,
  Plus,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  Briefcase,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Activity,
  UserCheck,
  Link2,
  ExternalLink,
  FileWarning,
  Clock,
} from 'lucide-react';
import type { Credential, CredentialType } from '../../types';

interface ClientInfo {
  id: string;
  name: string;
  businessName: string;
  businessType: string;
  email: string;
  phone: string;
  currentStage: number;
  hasFunding: boolean;
  fundingAmount?: number;
  isDelinquent: boolean;
  delinquentDays?: number;
}

interface ClientCredentialsPageProps {
  client: ClientInfo;
  credentials: Credential[];
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
};

const TYPE_COLOR: Record<CredentialType, string> = {
  impact: 'bg-blue-500/10 text-blue-600',
  behavior: 'bg-amber-500/10 text-amber-600',
  profile: 'bg-violet-500/10 text-violet-600',
};

function CredentialRow({ credential }: { credential: Credential }) {
  const tc = useTranslations('common');
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

  return (
    <Link href={ROUTES.credentials.detail(credential.id)} className="group">
      <div className="flex items-start gap-4 rounded-lg border p-4 bg-card transition-all hover:shadow-md hover:border-primary/20">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TYPE_COLOR[credential.credentialType]}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {credential.title}
              </p>
              {credential.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {credential.description}
                </p>
              )}
            </div>
            <Badge
              variant={STATUS_VARIANT[credential.status]}
              className="shrink-0"
            >
              {getStatusLabel(credential.status)}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="capitalize">
              {tc(`credentialTypes.${credential.credentialType}`)}
            </span>

            {credential.issuedAt && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(credential.issuedAt)}
              </span>
            )}

            {credential.actaVcId && (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Link2 className="h-3 w-3" />
                On-chain
              </span>
            )}

            {credential.publicId && (
              <span className="font-mono text-[10px] text-muted-foreground/60 truncate max-w-[180px]">
                {credential.publicId}
              </span>
            )}
          </div>

          {/* Public claims preview */}
          {credential.publicClaims &&
            Object.keys(credential.publicClaims).length > 0 && (
              <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(credential.publicClaims)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-muted-foreground">{key}:</span>{' '}
                      <span className="font-medium text-foreground">
                        {String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
        </div>

        <ExternalLink className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0 mt-1" />
      </div>
    </Link>
  );
}

const CREDENTIAL_TYPES: CredentialType[] = ['impact', 'behavior', 'profile'];

export function ClientCredentialsPage({
  client,
  credentials,
}: ClientCredentialsPageProps) {
  const t = useTranslations('credentials');
  const tc = useTranslations('common');

  const groupedCredentials = CREDENTIAL_TYPES.map((type) => ({
    type,
    label: tc(`credentialTypes.${type}`),
    description: tc(`credentialTypeDescriptions.${type}`),
    items: credentials.filter((c) => c.credentialType === type),
  }));

  const impactCount = credentials.filter(
    (c) => c.credentialType === 'impact',
  ).length;
  const behaviorCount = credentials.filter(
    (c) => c.credentialType === 'behavior',
  ).length;
  const profileCount = credentials.filter(
    (c) => c.credentialType === 'profile',
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href={ROUTES.credentials.list}>
            <button className="mt-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {client.name}
            </h1>
            <p className="text-muted-foreground mt-0.5">
              {t('client.vaultSubtitle')}
            </p>
          </div>
        </div>
        <Link href={ROUTES.credentials.new}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('client.issueCredential')}
          </Button>
        </Link>
      </div>

      {/* Client info card */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
              {client.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{client.businessName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{client.businessType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{client.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {client.hasFunding && (
                  <Badge variant="info" className="gap-1">
                    <DollarSign className="h-3 w-3" />
                    {t('vault.funded')}
                    {client.fundingAmount
                      ? ` — $${client.fundingAmount.toLocaleString('es-CO')}`
                      : ''}
                  </Badge>
                )}
                {client.isDelinquent && (
                  <Badge variant="danger" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {t('client.inDelinquency')}
                    {client.delinquentDays
                      ? ` ${t('client.delinquencyDays', { days: client.delinquentDays })}`
                      : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats by type */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <BarChart3 className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{impactCount}</p>
              <p className="text-xs text-muted-foreground">
                {t('vault.impact')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
              <Activity className="h-4.5 w-4.5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{behaviorCount}</p>
              <p className="text-xs text-muted-foreground">
                {t('vault.behavior')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
              <UserCheck className="h-4.5 w-4.5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{profileCount}</p>
              <p className="text-xs text-muted-foreground">
                {t('vault.profile')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credential sections by type */}
      {groupedCredentials.map(({ type, label, description, items }) => {
        const Icon = TYPE_ICON[type];
        return (
          <section key={type} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {label}
                  </h2>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              {items.length > 0 && (
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {items.length}
                </Badge>
              )}
            </div>

            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((credential) => (
                  <CredentialRow key={credential.id} credential={credential} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <FileWarning className="h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('client.noCredentialsOfType')}
                  </p>
                  <Link href={ROUTES.credentials.new} className="mt-3">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      {t('client.issueType', { type: label })}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>
        );
      })}
    </div>
  );
}
