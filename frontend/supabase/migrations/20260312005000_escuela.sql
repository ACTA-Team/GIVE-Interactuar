-- =============================================================================
-- Migration: Escuela
-- Source: Escuela sheet (Campos Bases de Datos.xlsx)
-- Generated: 2026-03-12
-- =============================================================================

-- NOTE:
-- This migration assumes that the helper function `public.update_updated_at_column`
-- has already been created in a prior migration (e.g. 20260312000000_credentials.sql).

create table public.escuela (
  id                  uuid          primary key default gen_random_uuid(),
  product             text,
  area                text,
  intervention_type   text,
  partner             text,
  project             text,
  client_name         text,
  document_number     text          not null,
  month               integer,
  year                integer,
  age                 integer,
  city                text,
  is_rural            text,         -- 'SI' | 'NO'
  industry            text,
  sector              text,
  economic_activity   text,
  stratum             integer,
  gender              text,         -- 'F' | 'M' | 'E'
  education_level     text,
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now()
);

create index escuela_document_number_idx
  on public.escuela(document_number);

create index escuela_intervention_type_idx
  on public.escuela(intervention_type);

create index escuela_partner_idx
  on public.escuela(partner);

create index escuela_year_idx
  on public.escuela(year);

create trigger escuela_updated_at
  before update on public.escuela
  for each row execute function public.update_updated_at_column();
