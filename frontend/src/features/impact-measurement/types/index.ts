// ─── Impact Credential ───────────────────────────────────────────────────────
// Answers: Does the business grow, sustain, or deteriorate?

export interface ImpactCredentialData {
  entrepreneurId: string;
  fullName: string;
  documentNumber: string;
  businessName: string | null;
  economicSector: string | null;
  yearsInOperation: number | null;
  totalSalesPrevYear: number | null;
  totalSalesCurrentYear: number | null;
  salesVariationPct: number | null;
  currentFullTimeEmployees: number | null;
  newJobsGenerated: number | null;
  newJobsFormalized: number | null;
  verdict: 'growing' | 'sustaining' | 'deteriorating' | 'insufficient_data';
}

// ─── Behavior Credential ─────────────────────────────────────────────────────
// Answers: Does the entrepreneur show financial stability and payment capacity?

export interface BehaviorCredentialData {
  entrepreneurId: string;
  fullName: string;
  documentNumber: string;
  creditSegmentStart: string | null;
  creditSegmentEnd: string | null;
  creditActive12m: boolean | null;
  avgMonthlySales: number | null;
  avgMonthlyCosts: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  estimatedOperatingMargin: number | null;
  leverageRatio: number | null;
  monthlyIncomeStability: number | null;
  recordValidity: string | null;
  // Derived indicators
  estimatedOperatingCapacity: 'high' | 'medium' | 'low' | 'insufficient_data';
  leverageLevel: 'healthy' | 'moderate' | 'high' | 'insufficient_data';
  commercialStability:
    | 'stable'
    | 'moderate'
    | 'volatile'
    | 'insufficient_data';
  financialTrend: 'positive' | 'neutral' | 'negative' | 'insufficient_data';
}

// ─── Profile & Formalization Credential ──────────────────────────────────────
// Answers: How formal, stable, and traceable is the applicant?

export interface ProfileCredentialData {
  entrepreneurId: string;
  fullName: string;
  documentNumber: string;
  documentType: string;
  identityValidated: boolean;
  educationLevel: string | null;
  municipality: string | null;
  residenceZone: string | null;
  isPrimaryProvider: boolean | null;
  avgHouseholdIncome: number | null;
  businessFormalized: boolean;
  nit: string | null;
  yearsInOperation: number | null;
  legalFigure: string | null;
  businessSize: string | null;
  hasInternet: boolean | null;
  healthRegime: string | null;
  contributesPension: boolean | null;
  compensationFund: string | null;
}
