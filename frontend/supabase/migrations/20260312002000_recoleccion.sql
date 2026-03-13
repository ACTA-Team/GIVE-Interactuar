-- =============================================================================
-- Migration: Recolección consolidado
-- Source: Recolección ene-mar + abr + may (00. Medición de Impacto MicroMBA.xlsm)
-- Generated: 2026-03-12
-- =============================================================================

-- NOTE:
-- This migration assumes that the helper function `public.update_updated_at_column`
-- has already been created in a prior migration (e.g. 20260312000000_credentials.sql).

create table public.recoleccion (
  id                          uuid            primary key default gen_random_uuid(),
  cedula                      text            not null,
  nombre_completo             text,
  empresa                     text,
  privacidad_aceptada         text,

  -- Ingresos por mes (COP)
  ventas_enero                bigint,
  ventas_febrero              bigint,
  ventas_marzo                bigint,
  ventas_abril                bigint,
  ventas_mayo                 bigint,

  -- Costos y gastos por mes (COP)
  costos_enero                bigint,
  costos_febrero              bigint,
  costos_marzo                bigint,
  costos_abril                bigint,
  costos_mayo                 bigint,

  -- Balance (disponible según hoja)
  activos                     bigint,
  pasivos                     bigint,

  -- Cualitativos
  factores_externos           text,
  practicas_estrategias       text,
  observaciones               text,

  -- Crédito
  necesita_credito            text,
  monto_requerido             text,
  destino_inversion           text,

  -- Metadatos
  hoja_origen                 text            not null,   -- 'Recolección ene-mar' | 'Recolección abr' | 'Recolección may'
  created_at                  timestamptz     not null default now(),
  updated_at                  timestamptz     not null default now()
);

create index recoleccion_cedula_idx
  on public.recoleccion(cedula);

create index recoleccion_hoja_origen_idx
  on public.recoleccion(hoja_origen);

create trigger recoleccion_updated_at
  before update on public.recoleccion
  for each row execute function public.update_updated_at_column();
