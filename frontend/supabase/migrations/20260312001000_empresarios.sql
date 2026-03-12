-- =============================================================================
-- Migration: Empesarios dataset & table
-- Source: empresarios.json — 1,069 entrepreneurs from the MicroMBA GIVE Colombia program
-- Generated: 2026-03-12
-- =============================================================================

-- NOTE:
-- This migration assumes that the helper function `public.update_updated_at_column`
-- has already been created in a prior migration (e.g. 20260312000000_credentials.sql).

create table public.empresarios (
  id                   uuid            primary key default gen_random_uuid(),
  name                 text            not null,
  company              text,
  program              text,
  partner              text,
  status               text,
  gender               text,
  municipality         text,
  sector               text,
  sales_prev_year_cop  bigint,
  sales_cop            bigint,
  growth_pct           numeric(7, 2),
  new_jobs             integer,
  level                text,
  "group"              text,
  cohort_year          integer,
  active_credit        text,
  education            text,
  strata               integer,
  residence_zone       text,
  legal_entity         text,
  company_size         text,
  age                  integer,
  age_range            text,
  credit_requested     text            not null,
  delinquent           text            not null,
  created_at           timestamptz     not null default now(),
  updated_at           timestamptz     not null default now()
);

create index empresarios_status_idx
  on public.empresarios(status);

create index empresarios_program_idx
  on public.empresarios(program);

create index empresarios_partner_idx
  on public.empresarios(partner);

create index empresarios_delinquent_idx
  on public.empresarios(delinquent);

create trigger empresarios_updated_at
  before update on public.empresarios
  for each row execute function public.update_updated_at_column();

