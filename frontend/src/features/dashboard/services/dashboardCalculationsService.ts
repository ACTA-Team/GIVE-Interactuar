import type { DashboardEntrepreneur } from '@/features/entrepreneurs/types/stages';
import { STAGES } from '@/features/entrepreneurs/types/stages';

export type DistributionItem = { name: string; value: number };

/**
 * Formatea un número como moneda COP.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Agrupa empresarios por una clave y retorna la distribución.
 */
function groupBy(
  entrepreneurs: DashboardEntrepreneur[],
  getKey: (e: DashboardEntrepreneur) => string,
): DistributionItem[] {
  const counts = entrepreneurs.reduce<Record<string, number>>((acc, e) => {
    const key = getKey(e);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);
}

/**
 * Distribución por partner.
 */
export function computePartnerDistribution(
  entrepreneurs: DashboardEntrepreneur[],
  unknownLabel: string,
): DistributionItem[] {
  return groupBy(entrepreneurs, (e) => e.partner?.trim() || unknownLabel);
}

/**
 * Distribución por municipio.
 */
export function computeMunicipalityDistribution(
  entrepreneurs: DashboardEntrepreneur[],
  unknownLabel: string,
): DistributionItem[] {
  return groupBy(entrepreneurs, (e) => e.municipality?.trim() || unknownLabel);
}

/**
 * Normaliza el género a una clave interna.
 */
function normalizeGenderKey(value?: string): 'female' | 'male' | 'unknown' {
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
}

/**
 * Distribución por género.
 */
export function computeGenderDistribution(
  entrepreneurs: DashboardEntrepreneur[],
  labels: { female: string; male: string; unknown: string },
): DistributionItem[] {
  const counts = entrepreneurs.reduce<Record<string, number>>((acc, e) => {
    const key = normalizeGenderKey(e.gender);
    const label = labels[key];
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);
}

/**
 * Distribución por etapa MBA (level).
 */
export function computeLevelDistribution(
  entrepreneurs: DashboardEntrepreneur[],
  unknownLabel: string,
): DistributionItem[] {
  const getKey = (e: DashboardEntrepreneur) => {
    const raw = e.level?.trim();
    if (!raw) return unknownLabel;
    return raw.match(/^\d+$/) ? `Etapa ${raw}` : raw;
  };
  const items = groupBy(entrepreneurs, getKey);
  return items.sort((a, b) => {
    const numA = a.name.match(/Etapa (\d+)/)?.[1];
    const numB = b.name.match(/Etapa (\d+)/)?.[1];
    if (numA && numB) return parseInt(numA) - parseInt(numB);
    return a.name.localeCompare(b.name);
  });
}

/**
 * Distribución por etapa del proceso (currentStage).
 */
export function computeStageDistribution(
  entrepreneurs: DashboardEntrepreneur[],
  getStageName: (stageId: number) => string,
): DistributionItem[] {
  return STAGES.map((stage) => ({
    name: getStageName(stage.id),
    value: entrepreneurs.filter((e) => e.currentStage === stage.id).length,
    id: stage.id,
  }))
    .filter((s) => s.value > 0)
    .map(({ name, value }) => ({ name, value }));
}
