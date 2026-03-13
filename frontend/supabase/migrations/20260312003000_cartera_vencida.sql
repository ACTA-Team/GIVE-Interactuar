-- =============================================================================
-- Migration: Cartera Vencida
-- Source: Cartera Vencida sheet (00. Medición de Impacto MicroMBA.xlsm)
-- Generated: 2026-03-12
-- =============================================================================

-- NOTE:
-- This migration assumes that the helper function `public.update_updated_at_column`
-- has already been created in a prior migration (e.g. 20260312000000_credentials.sql).

create table public.cartera_vencida (
  id                  uuid            primary key default gen_random_uuid(),
  anio_medicion       integer,
  aliado              text,
  programa            text,
  nivel               text,
  "group"             text,
  consultor           text,
  cedula              text            not null,
  nombre_completo     text,
  empresa             text,
  nit                 text,
  credito_vigente     integer,
  monto_inicial       bigint,
  saldo_mora          bigint,
  porcentaje_deuda    text,
  dias_vencidos       text,
  clasificacion       text,
  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now()
);

create index cartera_vencida_cedula_idx
  on public.cartera_vencida(cedula);

create index cartera_vencida_aliado_idx
  on public.cartera_vencida(aliado);

create index cartera_vencida_anio_medicion_idx
  on public.cartera_vencida(anio_medicion);

create trigger cartera_vencida_updated_at
  before update on public.cartera_vencida
  for each row execute function public.update_updated_at_column();
