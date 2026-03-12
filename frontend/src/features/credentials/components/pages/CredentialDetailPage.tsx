'use client';

import { useState } from 'react';
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
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import type { Credential, CredentialType } from '../../types';
import { CREDENTIAL_TYPE_LABELS } from '../../types';

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

const STATUS_LABEL: Record<Credential['status'], string> = {
  draft: 'Borrador',
  issued: 'Emitida',
  revoked: 'Revocada',
  expired: 'Expirada',
  pending_endorsement: 'Pendiente',
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

const CLAIM_LABELS: Record<string, string> = {
  id: 'ID del sujeto',
  companyName: 'Empresa',
  sector: 'Sector',
  yearsInOperation: 'Años en operación',
  salesPreviousYear: 'Ventas año anterior (COP)',
  salesCurrentYear: 'Ventas año actual (COP)',
  salesVariationPercent: 'Variación de ventas (%)',
  currentEmployees: 'Empleados actuales',
  newJobsCreated: 'Nuevos empleos',
  newFormalJobsCreated: 'Empleos formales nuevos',
  businessTrend: 'Tendencia del negocio',
  assessmentPeriod: 'Período de evaluación',
  creditSegmentStart: 'Segmento crediticio inicial',
  creditSegmentEnd: 'Segmento crediticio final',
  activeCredit: 'Crédito activo',
  averageSales: 'Ventas promedio',
  costsAndExpenses: 'Costos y gastos',
  assets: 'Activos',
  liabilities: 'Pasivos',
  estimatedOperatingMargin: 'Margen operativo estimado',
  liabilitiesToAssetsRatio: 'Ratio pasivos/activos',
  monthlyIncomeStability: 'Estabilidad ingreso mensual',
  registryValidation: 'Validación de registro',
  newJobs: 'Nuevos empleos',
  estimatedOperationalCapacity: 'Capacidad operativa estimada',
  leverageLevel: 'Nivel de apalancamiento',
  commercialStability: 'Estabilidad comercial',
  financialTrend: 'Tendencia financiera',
  paymentCapacitySignal: 'Señal de capacidad de pago',
  identityValidated: 'Identidad validada',
  educationLevel: 'Nivel educativo',
  municipality: 'Municipio',
  zone: 'Zona',
  mainHouseholdProvider: 'Proveedor principal del hogar',
  householdIncome: 'Ingreso del hogar',
  formalizedBusiness: 'Negocio formalizado',
  nit: 'NIT',
  legalForm: 'Forma jurídica',
  companySize: 'Tamaño de empresa',
  internetAccess: 'Acceso a internet',
  socialSecurityCoverage: 'Cobertura seguridad social',
  employmentFormalization: 'Formalización laboral',
  traceabilityLevel: 'Nivel de trazabilidad',
  formalizationLevel: 'Nivel de formalización',
  applicantStabilitySignal: 'Señal de estabilidad del solicitante',
};

function formatClaimValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
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
    if (key.includes('Percent') || key.includes('Ratio') || key.includes('Margin')) {
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
  const trendLabels: Record<string, string> = {
    growing: 'En crecimiento',
    stable: 'Estable',
    deteriorating: 'En deterioro',
  };
  if (trendLabels[String(value)]) return trendLabels[String(value)];
  return String(value);
}

function CopyButton({ text }: { text: string }) {
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
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

function ClaimsGrid({ claims }: { claims: Record<string, unknown> }) {
  const entries = Object.entries(claims).filter(
    ([key]) =>
      key !== '@context' && key !== 'type' && key !== 'issuer' && key !== 'validFrom',
  );

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Sin datos disponibles
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-lg border bg-muted/30 px-3 py-2.5">
          <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            {CLAIM_LABELS[key] ?? key}
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground wrap-break-word">
            {formatClaimValue(key, value)}
          </dd>
        </div>
      ))}
    </div>
  );
}

export function CredentialDetailPage({ credential }: CredentialDetailPageProps) {
  const Icon = TYPE_ICON[credential.credentialType];

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
          {STATUS_LABEL[credential.status]}
        </Badge>
      </div>

      {/* Credential metadata */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-muted-foreground" />
            Información de la Credencial
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Tipo
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {CREDENTIAL_TYPE_LABELS[credential.credentialType]}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Estado
              </p>
              <div className="mt-0.5">
                <Badge variant={STATUS_VARIANT[credential.status]}>
                  {STATUS_LABEL[credential.status]}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Public ID
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
                  Emisor DID
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
                  ACTA VC ID
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
            Fechas
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Creada
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {formatDateTime(credential.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Emitida
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {credential.issuedAt ? formatDateTime(credential.issuedAt) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Expira
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {credential.expiresAt ? formatDateTime(credential.expiresAt) : '—'}
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
                Datos de la Credencial
              </h2>
              <ClaimsGrid claims={credential.publicClaims} />
            </CardContent>
          </Card>
        )}
    </div>
  );
}
