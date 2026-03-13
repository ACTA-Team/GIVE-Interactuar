'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, Banknote, GraduationCap } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useDashboardData } from '../../hooks/useDashboardData';
import { DashboardSkeleton } from '../DashboardSkeleton';

const COLORS = [
  '#002E5C',
  '#F15A24',
  '#ADD8E6',
  '#10B981',
  '#8B5CF6',
  '#F59E0B',
];

type PieChartId = 'partner' | 'interventionType' | 'gender' | 'level';

export function DashboardPage() {
  const t = useTranslations('dashboard');
  const [activePieCategory, setActivePieCategory] = useState<
    Partial<Record<PieChartId, string>>
  >({});

  const handlePieSelect = useCallback(
    (chartId: PieChartId, categoryName: string | undefined) => {
      setActivePieCategory((prev) => ({
        ...prev,
        [chartId]:
          prev[chartId] === categoryName
            ? undefined
            : (categoryName ?? undefined),
      }));
    },
    [],
  );

  const {
    metrics,
    isLoading,
    error,
    monthlyData,
    interventionTypeDistribution,
    partnerDistribution,
    municipalityDistribution,
    genderDistribution,
    levelDistribution,
    formatCurrency,
  } = useDashboardData();

  if (isLoading) {
    return <DashboardSkeleton />;
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

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.totalFinanciado')}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Banknote className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.totalFinanciado ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`relative overflow-hidden ${(metrics?.montoCarteraVencida ?? 0) > 0 ? 'border-destructive/50' : ''}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.montoCarteraVencida')}
            </CardTitle>
            <div
              className={`h-8 w-8 rounded-full ${(metrics?.montoCarteraVencida ?? 0) > 0 ? 'bg-destructive/10' : 'bg-muted'} flex items-center justify-center`}
            >
              <AlertTriangle
                className={`h-4 w-4 ${(metrics?.montoCarteraVencida ?? 0) > 0 ? 'text-destructive' : 'text-muted-foreground'}`}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${(metrics?.montoCarteraVencida ?? 0) > 0 ? 'text-destructive' : ''}`}
            >
              {formatCurrency(metrics?.montoCarteraVencida ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.empresariosEnFormacion')}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-[#10B981]/20 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-[#10B981]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.personasEnPrograma ?? 0}
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
            <CardTitle>{t('charts.partnerPie')}</CardTitle>
            <CardDescription>{t('charts.partnerPieDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={partnerDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={(sectorData, _index) =>
                      handlePieSelect('partner', sectorData?.name ?? undefined)
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    {partnerDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        opacity={
                          activePieCategory.partner == null ||
                          entry.name === activePieCategory.partner
                            ? 1
                            : 0.35
                        }
                        style={{ cursor: 'pointer' }}
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
                    formatter={(value) => [
                      t('charts.entrepreneursCount', { count: Number(value) }),
                    ]}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                    onClick={(payload) =>
                      handlePieSelect('partner', payload?.value ?? undefined)
                    }
                    formatter={(value) => (
                      <span
                        className={
                          activePieCategory.partner === value
                            ? 'font-semibold opacity-100'
                            : 'opacity-70'
                        }
                        style={{ cursor: 'pointer' }}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico grande: Distribución por tipo de intervención */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">
            {t('charts.interventionTypePie')}
          </CardTitle>
          <CardDescription className="text-base">
            {t('charts.interventionTypePieDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={interventionTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={120}
                  outerRadius={200}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={(sectorData, _index) =>
                    handlePieSelect(
                      'interventionType',
                      sectorData?.name ?? undefined,
                    )
                  }
                  style={{ cursor: 'pointer' }}
                >
                  {interventionTypeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      opacity={
                        activePieCategory.interventionType == null ||
                        entry.name === activePieCategory.interventionType
                          ? 1
                          : 0.35
                      }
                      style={{ cursor: 'pointer' }}
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
                    name,
                  ]}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ paddingLeft: '24px' }}
                  iconSize={14}
                  iconType="circle"
                  onClick={(payload) =>
                    handlePieSelect(
                      'interventionType',
                      payload?.value ?? undefined,
                    )
                  }
                  formatter={(value) => (
                    <span
                      className={
                        activePieCategory.interventionType === value
                          ? 'font-semibold opacity-100'
                          : 'opacity-70'
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos por género, etapas MBA y municipio */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.genderPie')}</CardTitle>
            <CardDescription>{t('charts.genderPieDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={(sectorData, _index) =>
                      handlePieSelect('gender', sectorData?.name ?? undefined)
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    {genderDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        opacity={
                          activePieCategory.gender == null ||
                          entry.name === activePieCategory.gender
                            ? 1
                            : 0.35
                        }
                        style={{ cursor: 'pointer' }}
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
                    formatter={(value) => [
                      t('charts.entrepreneursCount', { count: Number(value) }),
                    ]}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                    onClick={(payload) =>
                      handlePieSelect('gender', payload?.value ?? undefined)
                    }
                    formatter={(value) => (
                      <span
                        className={
                          activePieCategory.gender === value
                            ? 'font-semibold opacity-100'
                            : 'opacity-70'
                        }
                        style={{ cursor: 'pointer' }}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('charts.levelPie')}</CardTitle>
            <CardDescription>{t('charts.levelPieDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={levelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={(sectorData, _index) =>
                      handlePieSelect('level', sectorData?.name ?? undefined)
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    {levelDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        opacity={
                          activePieCategory.level == null ||
                          entry.name === activePieCategory.level
                            ? 1
                            : 0.35
                        }
                        style={{ cursor: 'pointer' }}
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
                    formatter={(value) => [
                      t('charts.entrepreneursCount', { count: Number(value) }),
                    ]}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                    onClick={(payload) =>
                      handlePieSelect('level', payload?.value ?? undefined)
                    }
                    formatter={(value) => (
                      <span
                        className={
                          activePieCategory.level === value
                            ? 'font-semibold opacity-100'
                            : 'opacity-70'
                        }
                        style={{ cursor: 'pointer' }}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('charts.municipalityPie')}</CardTitle>
            <CardDescription>{t('charts.municipalityPieDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={municipalityDistribution}
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value) => [
                      t('charts.entrepreneursCount', { count: Number(value) }),
                    ]}
                  />
                  <Bar dataKey="value" fill="#002E5C" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
