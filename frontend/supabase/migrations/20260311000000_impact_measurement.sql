-- =============================================================================
-- Migration: Impact Measurement (Medición de Impacto MicroMBA)
-- Normalized schema (4NF) for program impact data
-- Generated: 2026-03-11
-- =============================================================================

-- =============================================================================
-- ENUMS
-- =============================================================================

create type public.im_enrollment_status as enum (
  'activo',
  'aplazado',
  'retirado'
);

create type public.im_program_type as enum (
  'mba_agroempresarial',
  'mba_empresarial'
);

create type public.im_gender as enum (
  'hombre',
  'mujer'
);

create type public.im_residence_zone as enum (
  'cabecera_urbana',
  'centro_poblado_rural',
  'rural_dispersa'
);

create type public.im_credit_segment as enum (
  'consolidacion',
  'cuenta_propia',
  'en_crecimiento'
);

create type public.im_record_validity as enum (
  'valido',
  'no_valido'
);

create type public.im_business_size as enum (
  'microempresa',
  'pequena',
  'mediana'
);

create type public.im_overdue_classification as enum (
  'A',
  'B',
  'E'
);

-- =============================================================================
-- LOOKUP / REFERENCE TABLES
-- =============================================================================

create table public.im_allies (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null unique,
  active     boolean     not null default true,
  created_at timestamptz not null default now()
);

create table public.im_consultants (
  id         uuid        primary key default gen_random_uuid(),
  full_name  text        not null unique,
  active     boolean     not null default true,
  created_at timestamptz not null default now()
);

create table public.im_levels (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null unique,
  sort_order smallint    not null default 0,
  created_at timestamptz not null default now()
);

create table public.im_economic_sectors (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null unique,
  created_at timestamptz not null default now()
);

create table public.im_economic_activities (
  id         uuid        primary key default gen_random_uuid(),
  sector_id  uuid        not null references public.im_economic_sectors(id) on delete restrict,
  name       text        not null,
  created_at timestamptz not null default now(),
  unique (sector_id, name)
);

create table public.im_legal_figures (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null unique,
  created_at timestamptz not null default now()
);

create table public.im_education_levels (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null unique,
  sort_order smallint    not null default 0,
  created_at timestamptz not null default now()
);

create table public.im_marital_statuses (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null unique,
  created_at timestamptz not null default now()
);

create table public.im_compensation_funds (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null unique,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- COHORTS
-- =============================================================================

create table public.im_cohorts (
  id          uuid                  primary key default gen_random_uuid(),
  name        text                  not null,
  cohort_year smallint              not null,
  program     public.im_program_type not null,
  ally_id     uuid                  not null references public.im_allies(id) on delete restrict,
  level_id    uuid                  references public.im_levels(id) on delete set null,
  created_at  timestamptz           not null default now(),
  unique (name, cohort_year, ally_id)
);

create index im_cohorts_ally_idx on public.im_cohorts(ally_id);
create index im_cohorts_year_idx on public.im_cohorts(cohort_year);

-- =============================================================================
-- ENTREPRENEUR DEMOGRAPHICS (extends existing entrepreneurs table)
-- =============================================================================

create table public.im_entrepreneur_demographics (
  id                          uuid        primary key default gen_random_uuid(),
  entrepreneur_id             uuid        not null references public.entrepreneurs(id) on delete cascade,
  nationality                 text,
  gender                      public.im_gender,
  birth_date                  date,
  education_level_id          uuid        references public.im_education_levels(id) on delete set null,
  home_address                text,
  home_neighborhood           text,
  home_municipality           text,
  home_zone                   public.im_residence_zone,
  socioeconomic_stratum       smallint,
  marital_status_id           uuid        references public.im_marital_statuses(id) on delete set null,
  is_primary_provider         boolean,
  avg_household_income        numeric(18,2),
  per_capita_income           numeric(18,2),
  poverty_line                text,
  household_members           smallint,
  dependents                  text,
  housing_type                text,
  internet_access             text,
  health_regime               text,
  contributes_pension         text,
  compensation_fund_affiliation text,
  compensation_fund_id        uuid        references public.im_compensation_funds(id) on delete set null,
  residence_zone_2            text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create unique index im_entrepreneur_demographics_unique_idx
  on public.im_entrepreneur_demographics(entrepreneur_id);

-- =============================================================================
-- ENTREPRENEUR SELF-IDENTIFICATIONS (4NF: multi-valued attribute)
-- =============================================================================

create table public.im_entrepreneur_self_identifications (
  id                   uuid        primary key default gen_random_uuid(),
  entrepreneur_id      uuid        not null references public.entrepreneurs(id) on delete cascade,
  identification_label text        not null,
  created_at           timestamptz not null default now()
);

create unique index im_entrepreneur_self_identifications_unique_idx
  on public.im_entrepreneur_self_identifications(entrepreneur_id, identification_label);

-- =============================================================================
-- BUSINESSES (extended business data)
-- =============================================================================

create table public.im_businesses (
  id                    uuid                   primary key default gen_random_uuid(),
  entrepreneur_id       uuid                   not null references public.entrepreneurs(id) on delete cascade,
  business_name         text,
  nit                   text,
  nit_raw               text,
  founded_date          date,
  phone                 text,
  address               text,
  neighborhood          text,
  municipality          text,
  zone                  public.im_residence_zone,
  website               text,
  legal_figure_id       uuid                   references public.im_legal_figures(id) on delete set null,
  location_type         text,
  economic_activity_id  uuid                   references public.im_economic_activities(id) on delete set null,
  activity_description  text,
  employees_in_fund     integer,
  employee_fund_id      uuid                   references public.im_compensation_funds(id) on delete set null,
  business_size         public.im_business_size,
  created_at            timestamptz            not null default now(),
  updated_at            timestamptz            not null default now()
);

create unique index im_businesses_unique_idx
  on public.im_businesses(entrepreneur_id);

create index im_businesses_nit_idx
  on public.im_businesses(nit);

-- =============================================================================
-- MEASUREMENTS (central fact table)
-- =============================================================================

create table public.im_measurements (
  id                     uuid                       primary key default gen_random_uuid(),
  entrepreneur_id        uuid                       not null references public.entrepreneurs(id) on delete cascade,
  measurement_year       smallint                   not null,
  cohort_id              uuid                       not null references public.im_cohorts(id) on delete restrict,
  cohort_code            text,
  consultant_id          uuid                       not null references public.im_consultants(id) on delete restrict,
  enrollment_status      public.im_enrollment_status not null,
  credit_active_12m      boolean,
  credit_segment_start   public.im_credit_segment,
  credit_segment_end     public.im_credit_segment,
  pte_progress           text,
  atypical_flag          text,
  record_validity        public.im_record_validity,
  total_sales_prev_year  numeric(18,2),
  avg_sales_prev_year    numeric(18,2),
  has_fixed_salary_prev  boolean,
  salary_value_prev      numeric(18,2),
  has_fixed_salary_current boolean,
  salary_value_current   numeric(18,2),
  observations           text,
  metadata               jsonb                      not null default '{}'::jsonb,
  created_at             timestamptz                not null default now(),
  updated_at             timestamptz                not null default now()
);

create unique index im_measurements_unique_idx
  on public.im_measurements(entrepreneur_id, measurement_year);

create index im_measurements_year_idx
  on public.im_measurements(measurement_year);

create index im_measurements_cohort_idx
  on public.im_measurements(cohort_id);

create index im_measurements_consultant_idx
  on public.im_measurements(consultant_id);

-- =============================================================================
-- MONTHLY SALES (child of measurement)
-- =============================================================================

create table public.im_monthly_sales (
  id             uuid           primary key default gen_random_uuid(),
  measurement_id uuid           not null references public.im_measurements(id) on delete cascade,
  month          smallint       not null check (month between 1 and 12),
  amount         numeric(18,2),
  created_at     timestamptz    not null default now()
);

create unique index im_monthly_sales_unique_idx
  on public.im_monthly_sales(measurement_id, month);

-- =============================================================================
-- MONTHLY COSTS (child of measurement)
-- =============================================================================

create table public.im_monthly_costs (
  id             uuid           primary key default gen_random_uuid(),
  measurement_id uuid           not null references public.im_measurements(id) on delete cascade,
  month          smallint       not null check (month between 1 and 12),
  amount         numeric(18,2),
  created_at     timestamptz    not null default now()
);

create unique index im_monthly_costs_unique_idx
  on public.im_monthly_costs(measurement_id, month);

-- =============================================================================
-- QUARTERLY BALANCES (child of measurement)
-- =============================================================================

create table public.im_quarterly_balances (
  id             uuid           primary key default gen_random_uuid(),
  measurement_id uuid           not null references public.im_measurements(id) on delete cascade,
  quarter        smallint       not null check (quarter between 1 and 4),
  assets         numeric(18,2),
  liabilities    numeric(18,2),
  created_at     timestamptz    not null default now()
);

create unique index im_quarterly_balances_unique_idx
  on public.im_quarterly_balances(measurement_id, quarter);

-- =============================================================================
-- EMPLOYMENT SNAPSHOTS (child of measurement, 2 rows: prev_year + current_year)
-- =============================================================================

create table public.im_employment_snapshots (
  id                      uuid        primary key default gen_random_uuid(),
  measurement_id          uuid        not null references public.im_measurements(id) on delete cascade,
  period                  text        not null check (period in ('prev_year', 'current_year')),
  full_time_total         integer,
  full_time_women         integer,
  full_time_men           integer,
  part_time_total         integer,
  part_time_women         integer,
  part_time_men           integer,
  social_security_total   integer,
  social_security_women   integer,
  social_security_men     integer,
  with_benefits           integer,
  under_30                integer,
  day_laborers            integer,
  created_at              timestamptz not null default now()
);

create unique index im_employment_snapshots_unique_idx
  on public.im_employment_snapshots(measurement_id, period);

-- =============================================================================
-- OVERDUE CREDITS (Cartera Vencida)
-- =============================================================================

create table public.im_overdue_credits (
  id                uuid                          primary key default gen_random_uuid(),
  entrepreneur_id   uuid                          not null references public.entrepreneurs(id) on delete cascade,
  measurement_year  smallint                      not null,
  ally_id           uuid                          references public.im_allies(id) on delete set null,
  cohort_id         uuid                          references public.im_cohorts(id) on delete set null,
  consultant_id     uuid                          references public.im_consultants(id) on delete set null,
  business_name     text,
  nit               text,
  credit_number     text,
  initial_amount    numeric(18,2),
  overdue_balance   numeric(18,2),
  debt_percentage   numeric(7,4),
  days_overdue      integer,
  classification    public.im_overdue_classification,
  created_at        timestamptz                   not null default now()
);

create index im_overdue_credits_entrepreneur_idx
  on public.im_overdue_credits(entrepreneur_id);

create index im_overdue_credits_year_idx
  on public.im_overdue_credits(measurement_year);

-- =============================================================================
-- COLLECTION RESPONSES (Recolección: ene-mar, abr, may)
-- =============================================================================

create table public.im_collection_responses (
  id                       uuid        primary key default gen_random_uuid(),
  entrepreneur_id          uuid        not null references public.entrepreneurs(id) on delete cascade,
  collection_year          smallint    not null,
  collection_period        text        not null check (collection_period in ('ene_mar', 'abr', 'may')),
  privacy_accepted         boolean,
  external_factors         text,
  implemented_practices    text,
  observations             text,
  needs_credit             boolean,
  credit_amount            numeric(18,2),
  investment_destination   text,
  ss_payer_info            text,
  ss_payer_name            text,
  ss_payer_doc_type        text,
  ss_payer_doc_number      text,
  has_accountant           boolean,
  financial_record_method  text,
  metadata                 jsonb       not null default '{}'::jsonb,
  created_at               timestamptz not null default now()
);

create index im_collection_responses_entrepreneur_idx
  on public.im_collection_responses(entrepreneur_id, collection_year);

create unique index im_collection_responses_unique_idx
  on public.im_collection_responses(entrepreneur_id, collection_year, collection_period);

-- =============================================================================
-- COLLECTION MONTHLY FIGURES (child of collection response)
-- =============================================================================

create table public.im_collection_monthly_figures (
  id                     uuid           primary key default gen_random_uuid(),
  collection_response_id uuid           not null references public.im_collection_responses(id) on delete cascade,
  month                  smallint       not null check (month between 1 and 12),
  sales                  numeric(18,2),
  costs                  numeric(18,2),
  created_at             timestamptz    not null default now()
);

create unique index im_collection_monthly_figures_unique_idx
  on public.im_collection_monthly_figures(collection_response_id, month);

-- =============================================================================
-- COLLECTION BALANCES (child of collection response)
-- =============================================================================

create table public.im_collection_balances (
  id                     uuid           primary key default gen_random_uuid(),
  collection_response_id uuid           not null references public.im_collection_responses(id) on delete cascade,
  assets                 numeric(18,2),
  liabilities            numeric(18,2),
  created_at             timestamptz    not null default now()
);

create unique index im_collection_balances_unique_idx
  on public.im_collection_balances(collection_response_id);
