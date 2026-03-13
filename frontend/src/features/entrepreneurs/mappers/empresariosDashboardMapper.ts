import type { DashboardEntrepreneur } from '../types/stages';

export type EmpresarioRow = {
  id: string;
  name: string;
  gender: string | null;
  company: string | null;
  sector: string | null;
  active_credit: string | null;
  delinquent: string | null;
  created_at: string;
};

const normalizeYesNo = (value: string | null): boolean => {
  if (!value) return false;
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  return normalized === 'si' || normalized === 'sí' || normalized === 'yes';
};

export function mapEmpresarioToDashboardEntrepreneur(
  row: EmpresarioRow,
): DashboardEntrepreneur {
  const hasFunding = normalizeYesNo(row.active_credit);
  const isDelinquent = normalizeYesNo(row.delinquent);

  return {
    id: row.id,
    name: row.name?.trim() || row.company?.trim() || 'Empresario',
    gender: row.gender ?? undefined,
    email: '',
    phone: '',
    businessName: row.company ?? '',
    businessType: row.sector ?? '',
    currentStage: hasFunding ? 5 : 0,
    stages: [],
    badges: [],
    hasFunding,
    // We don't have real funding amount/date in the dataset
    fundingAmount: undefined,
    fundingDate: undefined,
    isDelinquent,
    delinquentDays: undefined,
    createdAt: row.created_at,
    // No advisor info in the dataset yet, keep a placeholder
    advisorId: 'advisor-1',
  };
}
