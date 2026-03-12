export interface DashboardSummary {
  total_participants: number;
  active_count: number;
  retention_rate_pct: number;
  women: number;
  men: number;
  women_percentage: number;
  previous_year_sales_total_cop: number;
  current_year_sales_total_cop: number;
  average_previous_year_sales_cop: number;
  average_current_year_sales_cop: number;
  average_variation_pct: number;
  full_time_jobs_previous_year: number;
  full_time_jobs_current_year: number;
  new_jobs: number;
  formalized_jobs: number;
}

export interface DashboardByProgram {
  program: string;
  participants: number;
  average_previous_year_sales_cop: number;
  average_current_year_sales_cop: number;
  average_variation_pct: number;
  new_jobs: number;
}

export interface DashboardByGender {
  gender: string;
  participants: number;
  average_previous_year_sales_cop: number;
  average_current_year_sales_cop: number;
  average_variation_pct: number;
}

export interface DashboardByAlly {
  ally: string;
  participants: number;
  new_jobs: number;
}

export interface DashboardByAge {
  range: string;
  participants: number;
}

export interface DashboardMonthlySales {
  month: string;
  average_cop: number;
  n: number;
}

export interface DashboardPortfolioClassification {
  classification: string;
  label: string;
  cases: number;
  overdue_balance_cop: number;
}

export interface DashboardPortfolio {
  total_with_credit: number;
  current: number;
  in_default: number;
  default_rate_pct: number;
  total_overdue_balance_cop: number;
  by_classification: DashboardPortfolioClassification[];
}

export interface DashboardData {
  metadata: {
    program: string;
    period: string;
    note: string;
    source: string;
  };
  summary: DashboardSummary;
  by_program: DashboardByProgram[];
  by_gender: DashboardByGender[];
  by_ally: DashboardByAlly[];
  by_age: DashboardByAge[];
  monthly_sales: DashboardMonthlySales[];
  portfolio: DashboardPortfolio;
}

export interface EntrepreneurRecord {
  document_number: string;
  full_name: string;
  business_name: string | null;
  program: string;
  ally: string;
  enrollment_status: string;
  gender: string | null;
  municipality: string | null;
  sector: string | null;
  sales_prev_year_cop: number | null;
  sales_current_year_cop: number | null;
  sales_variation_pct: number | null;
  new_jobs: number | null;
  level: string | null;
  cohort_name: string;
  cohort_year: number;
  active_credit: string | null;
  education_level: string | null;
  socioeconomic_stratum: number | null;
  home_zone: string | null;
  legal_figure: string | null;
  business_size: string | null;
  age: number | null;
  age_range: string | null;
  requested_credit: string | null;
  overdue: string | null;
  years_in_operation: number | null;
  total_costs_cop: number | null;
  total_assets_cop: number | null;
  total_liabilities_cop: number | null;
  current_employees: number | null;
  is_formalized: boolean | null;
}
