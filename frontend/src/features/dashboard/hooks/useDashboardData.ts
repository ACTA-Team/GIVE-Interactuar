'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useDashboardEntrepreneurs } from '@/features/entrepreneurs/hooks/useDashboardEntrepreneurs';
import { useDashboardMetrics } from './useDashboardMetrics';
import { useEscuelaInterventionType } from './useEscuelaInterventionType';
import type { DashboardMetrics } from './useDashboardMetrics';
import {
  formatCurrency,
  computePartnerDistribution,
  computeMunicipalityDistribution,
  computeGenderDistribution,
  computeLevelDistribution,
} from '../services/dashboardCalculationsService';
import type { DistributionItem } from '../services/dashboardCalculationsService';

export type MonthlyDataItem = {
  month: string;
  empresarios: number;
  financiados: number;
};

export type DashboardData = {
  entrepreneurs: ReturnType<typeof useDashboardEntrepreneurs>['data'];
  metrics: DashboardMetrics | undefined;
  isLoading: boolean;
  error: Error | null;
  totalEntrepreneurs: number;
  fundedCount: number;
  monthlyData: MonthlyDataItem[];
  interventionTypeDistribution: DistributionItem[];
  partnerDistribution: DistributionItem[];
  municipalityDistribution: DistributionItem[];
  genderDistribution: DistributionItem[];
  levelDistribution: DistributionItem[];
  formatCurrency: typeof formatCurrency;
};

export function useDashboardData(): DashboardData {
  const t = useTranslations('dashboard');
  const {
    data: entrepreneurs = [],
    isLoading: entrepreneursLoading,
    error: entrepreneursError,
  } = useDashboardEntrepreneurs();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: interventionTypeDistribution = [], isLoading: escuelaLoading } =
    useEscuelaInterventionType();

  const isLoading = entrepreneursLoading || metricsLoading || escuelaLoading;
  const error = entrepreneursError ?? null;

  const totalEntrepreneurs = entrepreneurs.length;
  const fundedCount = entrepreneurs.filter((e) => e.hasFunding).length;

  const monthlyData = useMemo<MonthlyDataItem[]>(
    () => [
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
    ],
    [t, totalEntrepreneurs, fundedCount],
  );

  const partnerDistribution = useMemo(
    () => computePartnerDistribution(entrepreneurs, t('charts.unknown')),
    [entrepreneurs, t],
  );

  const municipalityDistribution = useMemo(
    () => computeMunicipalityDistribution(entrepreneurs, t('charts.unknown')),
    [entrepreneurs, t],
  );

  const genderDistribution = useMemo(
    () =>
      computeGenderDistribution(entrepreneurs, {
        female: t('stats.female'),
        male: t('stats.male'),
        unknown: t('charts.unknown'),
      }),
    [entrepreneurs, t],
  );

  const levelDistribution = useMemo(
    () => computeLevelDistribution(entrepreneurs, t('charts.unknown')),
    [entrepreneurs, t],
  );

  return {
    entrepreneurs,
    metrics,
    isLoading,
    error,
    totalEntrepreneurs,
    fundedCount,
    monthlyData,
    interventionTypeDistribution,
    partnerDistribution,
    municipalityDistribution,
    genderDistribution,
    levelDistribution,
    formatCurrency,
  };
}
