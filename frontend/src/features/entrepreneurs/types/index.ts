export interface Entrepreneur {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string | null;
  phone: string | null;
  municipality: string | null;
  department: string | null;
  country: string;
  active: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  // optional enrichments (joined queries)
  businessProfile?: BusinessProfile;
  latestSnapshot?: EntrepreneurProfileSnapshot;
  financialProfile?: FinancialProfile;
}

export interface BusinessProfile {
  id: string;
  entrepreneurId: string;
  businessName: string | null;
  businessSector: string | null;
  businessActivity: string | null;
  monthlySales: number | null;
  monthlyCosts: number | null;
  employeeCount: number | null;
  formalized: boolean | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EntrepreneurProfileSnapshot {
  id: string;
  entrepreneurId: string;
  sourceSubmissionId: string | null;
  sourceSyncRunId: string | null;
  snapshotVersion: number;
  isLatest: boolean;
  snapshotDate: string;
  data: Record<string, unknown>;
  createdAt: string;
}

// TODO: replace with real credit scale when foundation defines it
export type CreditLevel = 'bajo' | 'medio' | 'alto' | 'excelente';

// TODO: add actual financial fields once foundation delivers Excel spec
export interface FinancialProfile {
  id: string;
  entrepreneurId: string;
  // TODO: add loan amount, balances, earnings before/after per Excel columns
  creditLevel?: CreditLevel;
  loanStatus?: string;
  rawData: Record<string, unknown>;
  importedAt: string;
  sourceFile: string;
}

export interface EntrepreneurFilters {
  query?: string;
  municipality?: string;
  department?: string;
  active?: boolean;
  creditLevel?: CreditLevel;
}
