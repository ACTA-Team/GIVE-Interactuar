-- =============================================================================
-- Migration: Overdue Portfolio (Cartera Vencida)
-- Source: Cartera Vencida sheet (00. Medición de Impacto MicroMBA.xlsm)
-- Generated: 2026-03-12
-- =============================================================================

-- NOTE:
-- This migration assumes that the helper function `public.update_updated_at_column`
-- has already been created in a prior migration (e.g. 20260312000000_credentials.sql).

create table public.cartera_vencida (
  id                  uuid            primary key default gen_random_uuid(),
  measurement_year    integer,
  partner             text,
  program             text,
  level               text,
  "group"             text,
  consultant          text,
  document_number     text            not null,
  full_name           text,
  company             text,
  nit                 text,
  active_credit       integer,
  initial_amount      bigint,
  overdue_balance     bigint,
  debt_percentage     numeric(18,10),
  overdue_days        integer,
  classification      text,
  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now()
);

create index cartera_vencida_document_number_idx
  on public.cartera_vencida(document_number);

create index cartera_vencida_partner_idx
  on public.cartera_vencida(partner);

create index cartera_vencida_measurement_year_idx
  on public.cartera_vencida(measurement_year);

create trigger cartera_vencida_updated_at
  before update on public.cartera_vencida
  for each row execute function public.update_updated_at_column();
