-- =============================================================================
-- Migration: Data Collection Consolidated (Recolección consolidado)
-- Source: Recolección ene-mar + abr + may (00. Medición de Impacto MicroMBA.xlsm)
-- Generated: 2026-03-12
-- =============================================================================

-- NOTE:
-- This migration assumes that the helper function `public.update_updated_at_column`
-- has already been created in a prior migration (e.g. 20260312000000_credentials.sql).

create table public.recoleccion (
  id                      uuid            primary key default gen_random_uuid(),
  document_number         text            not null,
  full_name               text,
  company                 text,
  privacy_accepted        text,

  -- Monthly revenue (COP)
  sales_january           bigint,
  sales_february          bigint,
  sales_march             bigint,
  sales_april             bigint,
  sales_may               bigint,

  -- Monthly costs and expenses (COP)
  costs_january           bigint,
  costs_february          bigint,
  costs_march             bigint,
  costs_april             bigint,
  costs_may               bigint,

  -- Balance sheet
  assets                  bigint,
  liabilities             bigint,

  -- Qualitative
  external_factors        text,
  practices_strategies    text,
  observations            text,

  -- Credit
  needs_credit            text,
  required_amount         text,
  investment_destination  text,

  -- Metadata
  source_sheet            text            not null,   -- 'Recolección ene-mar' | 'Recolección abr' | 'Recolección may'
  created_at              timestamptz     not null default now(),
  updated_at              timestamptz     not null default now()
);

create index recoleccion_document_number_idx
  on public.recoleccion(document_number);

create index recoleccion_source_sheet_idx
  on public.recoleccion(source_sheet);

create trigger recoleccion_updated_at
  before update on public.recoleccion
  for each row execute function public.update_updated_at_column();
