'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Activity,
  UserCheck,
  BarChart3,
  GraduationCap,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import {
  CREDENTIAL_TYPE_CONFIG,
  CREDENTIAL_TYPE_IDS,
  type CredentialTypeId,
} from '../../constants/credential-type-badges';

export interface VaultClientSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  currentStage: number;
  hasFunding: boolean;
  fundingAmount?: number;
  isDelinquent: boolean;
  delinquentDays?: number;
  totalCredentials: number;
  issuedCredentials: number;
  impactCount: number;
  behaviorCount: number;
  profileCount: number;
  hasOnChain: boolean;
  mbaCount?: number;
}

interface CredentialsListPageProps {
  clients: VaultClientSummary[];
  /** Hide internal pagination when parent handles it (e.g. server-side) */
  hidePagination?: boolean;
}

export function CredentialsListPage({
  clients,
  hidePagination = false,
}: CredentialsListPageProps) {
  const t = useTranslations('credentials');
  const tc = useTranslations('common');
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<CredentialTypeId[]>([]);
  const [fundingFilter, setFundingFilter] = useState<'all' | 'funded'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.businessName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some((type) => {
          if (type === 'impact') return c.impactCount > 0;
          if (type === 'mba') return (c.mbaCount ?? 0) > 0;
          if (type === 'behavior') return c.behaviorCount > 0;
          if (type === 'profile') return c.profileCount > 0;
          return false;
        });

      const matchesFunding =
        fundingFilter === 'all' || (fundingFilter === 'funded' && c.hasFunding);

      const matchesVerified = !verifiedOnly || (verifiedOnly && c.hasOnChain);

      return matchesSearch && matchesType && matchesFunding && matchesVerified;
    });
  }, [clients, search, selectedTypes, fundingFilter, verifiedOnly]);

  const totalPages = filtered.length
    ? Math.ceil(filtered.length / pageSize)
    : 1;
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const toggleTypeFilter = (type: CredentialTypeId) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
    setPage(1);
  };
  const totalImpact = clients.reduce((acc, c) => acc + c.impactCount, 0);
  const totalBehavior = clients.reduce((acc, c) => acc + c.behaviorCount, 0);
  const totalProfile = clients.reduce((acc, c) => acc + c.profileCount, 0);
  const totalMba = clients.reduce((acc, c) => acc + (c.mbaCount ?? 0), 0);

  return (
    <div className="space-y-6 max-md:space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground max-md:text-xl">
          {t('vault.title')}
        </h1>
        <p className="text-muted-foreground mt-0.5 max-md:text-sm">{t('vault.subtitle')}</p>
      </div>

      {/* Credential type badges (insignias) – multi-select filter */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-sm:grid-cols-1 max-sm:gap-3">
        {CREDENTIAL_TYPE_IDS.map((typeId) => {
          const config = CREDENTIAL_TYPE_CONFIG[typeId];
          const total =
            typeId === 'impact'
              ? totalImpact
              : typeId === 'mba'
                ? totalMba
                : typeId === 'behavior'
                  ? totalBehavior
                  : totalProfile;
          const isSelected = selectedTypes.includes(typeId);
          return (
            <label
              key={typeId}
              className={`
                relative flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-4 text-left
                transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.99]
                focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2
                ${isSelected ? config.activeClasses : config.colorClasses}
              `}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleTypeFilter(typeId)}
                className="absolute right-3 top-3 shrink-0 border-2 border-foreground/40 data-[checked]:border-primary"
                aria-label={t(`vault.${config.labelKey}`)}
              />
              <div
                className={`
                  flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                  ${isSelected ? 'bg-white shadow-sm' : 'bg-transparent'}
                `}
              >
                {config.icon}
              </div>
              <div className="min-w-0 flex-1 pr-6">
                <p className="text-2xl font-bold tabular-nums">{total}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {t(`vault.${config.labelKey}`)}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Search & Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4 max-md:p-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center max-md:gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('vault.searchPlaceholder')}
                className="pl-9"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setVerifiedOnly((prev) => !prev);
                setPage(1);
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                verifiedOnly
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                  : 'border-border bg-background text-muted-foreground hover:border-emerald-400'
              }`}
              aria-pressed={verifiedOnly}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('vault.onlyVerified')}
            </button>

            <button
              type="button"
              onClick={() => {
                setFundingFilter((prev) =>
                  prev === 'funded' ? 'all' : 'funded',
                );
                setPage(1);
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                fundingFilter === 'funded'
                  ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200'
                  : 'border-border bg-background text-muted-foreground hover:border-sky-400'
              }`}
              aria-pressed={fundingFilter === 'funded'}
            >
              <DollarSign className="h-3.5 w-3.5" />
              {t('vault.fundingFunded')}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Client cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <Card className="shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {search.trim()
                    ? t('vault.noClientsFound')
                    : t('vault.noClientsRegistered')}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          (hidePagination ? filtered : pageItems).map((client) => (
            <Link
              key={client.id}
              href={ROUTES.credentials.client(client.id)}
              className="group min-w-0"
            >
              <Card className="h-full min-w-0 overflow-hidden shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20">
                <CardContent className="pt-5 pb-4 space-y-4 min-w-0">
                  {/* Client identity */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {client.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {client.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {client.businessName}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                        {client.businessType}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>

                  {/* Divider */}
                  <div className="border-t" />

                  {/* Credential summary */}
                  <div className="space-y-2.5">
                    {client.totalCredentials > 0 ? (
                      <>
                        {/* Total credentials */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {t('vault.credentialsLabel')}
                          </span>
                          <Badge variant="success" className="gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            {client.totalCredentials}
                          </Badge>
                        </div>

                        {/* By type */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {client.impactCount > 0 && (
                            <Badge variant="info" className="gap-1 text-[10px]">
                              <BarChart3 className="h-3 w-3" />
                              {client.impactCount}{' '}
                              {t('vault.impact').toLowerCase()}
                            </Badge>
                          )}
                          {client.behaviorCount > 0 && (
                            <Badge
                              variant="warning"
                              className="gap-1 text-[10px]"
                            >
                              <Activity className="h-3 w-3" />
                              {client.behaviorCount}{' '}
                              {t('vault.behavior').toLowerCase()}
                            </Badge>
                          )}
                          {client.profileCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="gap-1 text-[10px]"
                            >
                              <UserCheck className="h-3 w-3" />
                              {client.profileCount}{' '}
                              {t('vault.profile').toLowerCase()}
                            </Badge>
                          )}
                          {(client.mbaCount ?? 0) > 0 && (
                            <Badge
                              variant="warning"
                              className="gap-1 text-[10px] bg-orange-50 text-orange-600 border-transparent"
                            >
                              <GraduationCap className="h-3 w-3" />
                              {client.mbaCount} MBA
                            </Badge>
                          )}
                        </div>

                        {/* Verified credentials and funding indicators */}
                        <div className="flex flex-wrap gap-1.5">
                          {client.hasOnChain && (
                            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                              <ShieldCheck className="h-3 w-3" />
                              {t('vault.verifiedCredentials')}
                            </div>
                          )}
                          {client.hasFunding && (
                            <div className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                              <DollarSign className="h-3 w-3" />
                              {t('vault.fundingFunded')}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        {t('vault.noCredentialsIssued')}
                      </p>
                    )}

                    {/* Flags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {client.isDelinquent && (
                        <Badge variant="danger" className="gap-1 text-[10px]">
                          <AlertTriangle className="h-3 w-3" />
                          {t('vault.delinquent')}
                          {client.delinquentDays
                            ? ` ${client.delinquentDays}d`
                            : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {!hidePagination && filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          showingLabel={tc('showing', {
            count: pageItems.length,
            total: filtered.length,
          })}
        />
      )}
    </div>
  );
}
