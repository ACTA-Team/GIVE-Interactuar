export interface DashboardResumen {
  total_participantes: number;
  activos: number;
  tasa_retencion_pct: number;
  mujeres: number;
  hombres: number;
  pct_mujeres: number;
  ventas_total_n1_cop: number;
  ventas_total_n_cop: number;
  ventas_promedio_n1_cop: number;
  ventas_promedio_n_cop: number;
  variacion_promedio_pct: number;
  empleos_tc_n1: number;
  empleos_tc_n: number;
  nuevos_empleos: number;
  empleos_formalizados: number;
}

export interface DashboardPorPrograma {
  programa: string;
  participantes: number;
  ventas_promedio_n1_cop: number;
  ventas_promedio_n_cop: number;
  variacion_promedio_pct: number;
  nuevos_empleos: number;
}

export interface DashboardPorGenero {
  genero: string;
  participantes: number;
  ventas_promedio_n1_cop: number;
  ventas_promedio_n_cop: number;
  variacion_promedio_pct: number;
}

export interface DashboardPorAliado {
  aliado: string;
  participantes: number;
  nuevos_empleos: number;
}

export interface DashboardPorEdad {
  rango: string;
  participantes: number;
}

export interface DashboardVentasMensuales {
  mes: string;
  promedio_cop: number;
  n: number;
}

export interface DashboardCarteraClasificacion {
  clasificacion: string;
  label: string;
  casos: number;
  saldo_mora_cop: number;
}

export interface DashboardCartera {
  total_con_credito: number;
  al_dia: number;
  en_mora: number;
  pct_mora: number;
  saldo_mora_total_cop: number;
  por_clasificacion: DashboardCarteraClasificacion[];
}

export interface DashboardData {
  metadata: {
    programa: string;
    periodo: string;
    nota: string;
    fuente: string;
  };
  resumen: DashboardResumen;
  por_programa: DashboardPorPrograma[];
  por_genero: DashboardPorGenero[];
  por_aliado: DashboardPorAliado[];
  por_edad: DashboardPorEdad[];
  ventas_mensuales: DashboardVentasMensuales[];
  cartera: DashboardCartera;
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
