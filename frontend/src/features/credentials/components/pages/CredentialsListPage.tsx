'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Activity,
  UserCheck,
  BarChart3,
  Link2,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

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
  const [filterType, setFilterType] = useState<
    'all' | 'impact' | 'behavior' | 'profile'
  >('all');
  const [fundingFilter, setFundingFilter] = useState<
    'all' | 'funded' | 'not-funded' | 'delinquent'
  >('all');
  const [onChainFilter, setOnChainFilter] = useState<
    'all' | 'with' | 'without'
  >('all');
  const [hasCredentialsFilter, setHasCredentialsFilter] = useState<
    'all' | 'with' | 'without'
  >('all');
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
        filterType === 'all' ||
        (filterType === 'impact' && c.impactCount > 0) ||
        (filterType === 'behavior' && c.behaviorCount > 0) ||
        (filterType === 'profile' && c.profileCount > 0);

      const matchesFunding =
        fundingFilter === 'all' ||
        (fundingFilter === 'funded' && c.hasFunding) ||
        (fundingFilter === 'not-funded' && !c.hasFunding) ||
        (fundingFilter === 'delinquent' && c.isDelinquent);

      const matchesOnChain =
        onChainFilter === 'all' ||
        (onChainFilter === 'with' && c.hasOnChain) ||
        (onChainFilter === 'without' && !c.hasOnChain);

      const matchesHasCredentials =
        hasCredentialsFilter === 'all' ||
        (hasCredentialsFilter === 'with' && c.totalCredentials > 0) ||
        (hasCredentialsFilter === 'without' && c.totalCredentials === 0);

      return (
        matchesSearch &&
        matchesType &&
        matchesFunding &&
        matchesOnChain &&
        matchesHasCredentials
      );
    });
  }, [
    clients,
    search,
    filterType,
    fundingFilter,
    onChainFilter,
    hasCredentialsFilter,
  ]);

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
  const handleFilterType = (
    value: 'all' | 'impact' | 'behavior' | 'profile',
  ) => {
    setFilterType(value);
    setPage(1);
  };
  const handleFundingFilter = (
    value: 'all' | 'funded' | 'not-funded' | 'delinquent',
  ) => {
    setFundingFilter(value);
    setPage(1);
  };
  const handleOnChainFilter = (value: 'all' | 'with' | 'without') => {
    setOnChainFilter(value);
    setPage(1);
  };
  const handleHasCredentialsFilter = (value: 'all' | 'with' | 'without') => {
    setHasCredentialsFilter(value);
    setPage(1);
  };

  const totalImpact = clients.reduce((acc, c) => acc + c.impactCount, 0);
  const totalBehavior = clients.reduce((acc, c) => acc + c.behaviorCount, 0);
  const totalProfile = clients.reduce((acc, c) => acc + c.profileCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t('vault.title')}
        </h1>
        <p className="text-muted-foreground mt-0.5">{t('vault.subtitle')}</p>
      </div>

      {/* Stats by type */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <BarChart3 className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{totalImpact}</p>
              <p className="text-xs text-muted-foreground">
                {t('vault.impact')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
              <Activity className="h-4.5 w-4.5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{totalBehavior}</p>
              <p className="text-xs text-muted-foreground">
                {t('vault.behavior')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
              <UserCheck className="h-4.5 w-4.5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{totalProfile}</p>
              <p className="text-xs text-muted-foreground">
                {t('vault.profile')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="shadow-sm">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('vault.searchPlaceholder')}
                className="pl-9"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select
                value={filterType}
                onValueChange={(value) =>
                  handleFilterType(
                    (value ?? 'all') as
                      | 'all'
                      | 'impact'
                      | 'behavior'
                      | 'profile',
                  )
                }
                items={{
                  all: t('vault.allTypes'),
                  impact: t('vault.impact'),
                  behavior: t('vault.behavior'),
                  profile: t('vault.profile'),
                }}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder={t('vault.filterByType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('vault.allTypes')}</SelectItem>
                  <SelectItem value="impact">{t('vault.impact')}</SelectItem>
                  <SelectItem value="behavior">
                    {t('vault.behavior')}
                  </SelectItem>
                  <SelectItem value="profile">{t('vault.profile')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={fundingFilter}
                onValueChange={(value) =>
                  handleFundingFilter(
                    (value ?? 'all') as
                      | 'all'
                      | 'funded'
                      | 'not-funded'
                      | 'delinquent',
                  )
                }
                items={{
                  all: t('vault.fundingAny'),
                  funded: t('vault.fundingFunded'),
                  'not-funded': t('vault.fundingNotFunded'),
                  delinquent: t('vault.fundingDelinquent'),
                }}
              >
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder={t('vault.filterByFundingStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('vault.fundingAny')}</SelectItem>
                  <SelectItem value="funded">
                    {t('vault.fundingFunded')}
                  </SelectItem>
                  <SelectItem value="not-funded">
                    {t('vault.fundingNotFunded')}
                  </SelectItem>
                  <SelectItem value="delinquent">
                    {t('vault.fundingDelinquent')}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={onChainFilter}
                onValueChange={(value) =>
                  handleOnChainFilter(
                    (value ?? 'all') as 'all' | 'with' | 'without',
                  )
                }
                items={{
                  all: t('vault.onChainAny'),
                  with: t('vault.onChainWith'),
                  without: t('vault.onChainWithout'),
                }}
              >
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder={t('vault.filterByOnChain')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('vault.onChainAny')}</SelectItem>
                  <SelectItem value="with">{t('vault.onChainWith')}</SelectItem>
                  <SelectItem value="without">
                    {t('vault.onChainWithout')}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={hasCredentialsFilter}
                onValueChange={(value) =>
                  handleHasCredentialsFilter(
                    (value ?? 'all') as 'all' | 'with' | 'without',
                  )
                }
                items={{
                  all: t('vault.hasCredentialsAny'),
                  with: t('vault.hasCredentialsWith'),
                  without: t('vault.hasCredentialsWithout'),
                }}
              >
                <SelectTrigger className="w-[210px]">
                  <SelectValue
                    placeholder={t('vault.filterByCredentialPresence')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('vault.hasCredentialsAny')}
                  </SelectItem>
                  <SelectItem value="with">
                    {t('vault.hasCredentialsWith')}
                  </SelectItem>
                  <SelectItem value="without">
                    {t('vault.hasCredentialsWithout')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              className="group"
            >
              <Card className="h-full shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20">
                <CardContent className="pt-5 pb-4 space-y-4">
                  {/* Client identity */}
                  <div className="flex items-start gap-3">
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
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
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
                        </div>

                        {/* On-chain indicator */}
                        {client.hasOnChain && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600">
                            <Link2 className="h-3 w-3" />
                            {t('vault.onChainCredentials')}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        {t('vault.noCredentialsIssued')}
                      </p>
                    )}

                    {/* Flags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {client.hasFunding && (
                        <Badge variant="info" className="gap-1 text-[10px]">
                          <DollarSign className="h-3 w-3" />
                          {t('vault.funded')}
                        </Badge>
                      )}
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
