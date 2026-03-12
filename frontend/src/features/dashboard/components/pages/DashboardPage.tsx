'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  AlertTriangle,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { STAGES } from '@/features/entrepreneurs/types/stages';
import { useDashboardEntrepreneurs } from '@/features/entrepreneurs/hooks/useDashboardEntrepreneurs';

type SortField = 'name' | 'stage' | 'delinquent';
type SortDirection = 'asc' | 'desc';

export function DashboardPage() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const { data: entrepreneurs = [], isLoading, error } = useDashboardEntrepreneurs();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('delinquent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleFilterStage = (value: string | null) =>
    setFilterStage(value ?? 'all');
  const handleFilterStatus = (value: string | null) =>
    setFilterStatus(value ?? 'all');

  const totalEntrepreneurs = entrepreneurs.length;
  const delinquentCount = entrepreneurs.filter((e) => e.isDelinquent).length;
  const fundedCount = entrepreneurs.filter((e) => e.hasFunding).length;
  const inTraining = entrepreneurs.filter(
    (e) => e.currentStage >= 1 && e.currentStage <= 3,
  ).length;

  const stageDistribution = STAGES.map((stage) => ({
    name: t(`stages.${stage.id}`),
    value: entrepreneurs.filter((e) => e.currentStage === stage.id).length,
    id: stage.id,
  })).filter((s) => s.value > 0);

  const monthlyData = [
    { month: t('months.jan'), empresarios: 45, financiados: 12 },
    { month: t('months.feb'), empresarios: 52, financiados: 15 },
    { month: t('months.mar'), empresarios: 61, financiados: 18 },
    { month: t('months.apr'), empresarios: 67, financiados: 22 },
    { month: t('months.may'), empresarios: 78, financiados: 28 },
    {
      month: t('months.jun'),
      empresarios: totalEntrepreneurs,
      financiados: fundedCount,
    },
  ];

  const COLORS = [
    '#002E5C',
    '#F15A24',
    '#ADD8E6',
    '#10B981',
    '#8B5CF6',
    '#F59E0B',
  ];

  const filteredAndSortedEntrepreneurs = useMemo(() => {
    const filtered = entrepreneurs.filter((e) => {
      const matchesStage =
        filterStage === 'all' || e.currentStage === parseInt(filterStage);
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'delinquent' && e.isDelinquent) ||
        (filterStatus === 'funded' && e.hasFunding) ||
        (filterStatus === 'not-funded' && !e.hasFunding);
      return matchesStage && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'stage':
          comparison = a.currentStage - b.currentStage;
          break;
        case 'delinquent':
          comparison = (a.isDelinquent ? 1 : 0) - (b.isDelinquent ? 1 : 0);
          if (comparison === 0) {
            comparison = (a.delinquentDays || 0) - (b.delinquentDays || 0);
          }
          break;
        // funding removed from dashboard sorting
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [entrepreneurs, sortField, sortDirection, filterStage, filterStatus]);

  const normalizeGender = (value?: string) => {
    if (!value) return 'unknown';
    const normalized = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

    if (
      normalized === 'f' ||
      normalized === 'femenino' ||
      normalized === 'mujer'
    ) {
      return 'female';
    }
    if (
      normalized === 'm' ||
      normalized === 'masculino' ||
      normalized === 'hombre'
    ) {
      return 'male';
    }
    return 'unknown';
  };

  const femaleCount = entrepreneurs.filter(
    (e) => normalizeGender(e.gender) === 'female',
  ).length;
  const maleCount = entrepreneurs.filter(
    (e) => normalizeGender(e.gender) === 'male',
  ).length;

  const topEntrepreneurs = filteredAndSortedEntrepreneurs.slice(0, 10);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedEntrepreneurs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedEntrepreneurs.map((e) => e.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkCertify = (stageId: number) => {
    // TODO: wire to certify service
    console.log('Bulk certify', Array.from(selectedIds), 'stage', stageId);
    setSelectedIds(new Set());
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">{t('error')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('welcome')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.totalEntrepreneurs')}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEntrepreneurs}</div>
            <div className="flex items-center gap-1 mt-1 text-sm text-success">
              <ArrowUpRight className="h-4 w-4" />
              <span>{t('stats.thisMonth')}</span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
            <div className="h-full bg-primary" style={{ width: '75%' }} />
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.inTraining')}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-[#ADD8E6]/30 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inTraining}</div>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <span>{t('stats.stages1to3')}</span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ADD8E6]/40">
            <div
              className="h-full bg-[#ADD8E6]"
              style={{
                width: `${(inTraining / totalEntrepreneurs) * 100}%`,
              }}
            />
          </div>
        </Card>

        <Card
          className={`relative overflow-hidden ${delinquentCount > 0 ? 'border-destructive/50' : ''}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.delinquent')}
            </CardTitle>
            <div
              className={`h-8 w-8 rounded-full ${delinquentCount > 0 ? 'bg-destructive/10' : 'bg-muted'} flex items-center justify-center`}
            >
              <AlertTriangle
                className={`h-4 w-4 ${delinquentCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${delinquentCount > 0 ? 'text-destructive' : ''}`}
            >
              {delinquentCount}
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm">
              {delinquentCount > 0 ? (
                <span className="text-destructive flex items-center gap-1">
                  <ArrowDownRight className="h-4 w-4" />
                  {t('stats.needsAttention')}
                </span>
              ) : (
                <span className="text-success flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('stats.allUpToDate')}
                </span>
              )}
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-destructive/20">
            <div
              className="h-full bg-destructive"
              style={{
                width: `${(delinquentCount / Math.max(fundedCount, 1)) * 100}%`,
              }}
            />
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.genderDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t('stats.female')}
                </span>
                <span className="font-semibold">
                  {femaleCount} / {totalEntrepreneurs}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('stats.male')}</span>
                <span className="font-semibold">
                  {maleCount} / {totalEntrepreneurs}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.growthTrend')}</CardTitle>
            <CardDescription>{t('charts.growthTrendDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient
                      id="colorEmpresarios"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#002E5C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#002E5C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorFinanciados"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#F15A24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F15A24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="empresarios"
                    name={t('charts.entrepreneurs')}
                    stroke="#002E5C"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEmpresarios)"
                  />
                  <Area
                    type="monotone"
                    dataKey="financiados"
                    name={t('charts.funded')}
                    stroke="#F15A24"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorFinanciados)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('charts.stageDistribution')}</CardTitle>
            <CardDescription>
              {t('charts.stageDistributionDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stageDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value, name) => [
                      t('charts.entrepreneursCount', { count: Number(value) }),
                      `${name}`,
                    ]}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sortable Table - Top 10 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{t('table.title')}</CardTitle>
              <CardDescription>{t('table.top10Description')}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={filterStage} onValueChange={handleFilterStage}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t('filters.stage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all')}</SelectItem>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id.toString()}>
                      {t('table.stageLabel', { id: stage.id })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={handleFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t('filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('filters.allStatuses')}
                  </SelectItem>
                  <SelectItem value="delinquent">
                    {t('filters.delinquent')}
                  </SelectItem>
                  <SelectItem value="funded">{t('filters.funded')}</SelectItem>
                  <SelectItem value="not-funded">
                    {t('filters.notFunded')}
                  </SelectItem>
                </SelectContent>
              </Select>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {tc('selected', { count: selectedIds.size })}
                  </span>
                  <Select
                    onValueChange={(value: string | null) =>
                      value && handleBulkCertify(parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <Shield className="h-4 w-4 mr-2" />
                      <SelectValue placeholder={t('table.certifyStage')} />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id.toString()}>
                          {t('table.stageWithName', {
                            id: stage.id,
                            name: t(`stages.${stage.id}`),
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        selectedIds.size ===
                          filteredAndSortedEntrepreneurs.length &&
                        filteredAndSortedEntrepreneurs.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('name')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {t('table.entrepreneur')}
                      {sortField === 'name' && (
                        <span className="text-primary">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead>{t('table.business')}</TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('stage')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {t('table.stage')}
                      {sortField === 'stage' && (
                        <span className="text-primary">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('delinquent')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {t('table.status')}
                      {sortField === 'delinquent' && (
                        <span className="text-primary">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </TableHead>
                  {/* Funding column removed from dashboard table */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {topEntrepreneurs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <p className="text-muted-foreground">
                        {t('table.noResults')}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  topEntrepreneurs.map((entrepreneur) => {
                    const currentStage = STAGES.find(
                      (s) => s.id === entrepreneur.currentStage,
                    );
                    return (
                      <TableRow
                        key={entrepreneur.id}
                        className={
                          selectedIds.has(entrepreneur.id) ? 'bg-primary/5' : ''
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(entrepreneur.id)}
                            onCheckedChange={() =>
                              handleSelect(entrepreneur.id)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                              {entrepreneur.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{entrepreneur.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {entrepreneur.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {entrepreneur.businessName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entrepreneur.businessType}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {entrepreneur.currentStage}: {currentStage?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {entrepreneur.isDelinquent ? (
                            <Badge variant="danger" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {t('table.delinquent', {
                                days: entrepreneur.delinquentDays ?? 0,
                              })}
                            </Badge>
                          ) : entrepreneur.hasFunding ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {t('table.upToDate')}
                            </Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="text-muted-foreground"
                            >
                              {t('table.notFunded')}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <p>
              {tc('showing', {
                count: topEntrepreneurs.length,
                total: entrepreneurs.length,
              })}
            </p>
            <Link href="/dashboard/entrepreneurs">
              <Button variant="link" className="gap-1 p-0">
                {tc('buttons.viewAll')}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
