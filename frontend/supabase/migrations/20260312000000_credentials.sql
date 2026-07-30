-- =============================================================================
-- Migration: Credentials & Issuance Drafts
-- Tables for storing verifiable credential records and issuance workflow
-- Generated: 2026-03-12
-- =============================================================================

-- =============================================================================
-- ENUMS
-- =============================================================================

create type public.credential_status as enum (
  'draft',
  'issued',
  'revoked',
  'expired',
  'pending_endorsement'
);

create type public.credential_type as enum (
  'impact',
  'behavior',
  'profile'
);

create type public.issuance_draft_status as enum (
  'draft',
  'ready',
  'archived'
);

-- =============================================================================
-- CREDENTIAL TEMPLATES
-- =============================================================================

create table public.credential_templates (
  id                   uuid            primary key default gen_random_uuid(),
  name                 text            not null,
  credential_type      public.credential_type not null,
  schema_version       text            not null default '1.0.0',
  template_definition  jsonb           not null default '{}'::jsonb,
  active               boolean         not null default true,
  created_at           timestamptz     not null default now(),
  updated_at           timestamptz     not null default now()
);

-- =============================================================================
-- CREDENTIALS
-- =============================================================================

create table public.credentials (
  id                  uuid                     primary key default gen_random_uuid(),
  entrepreneur_id     text                     not null,
  template_id         uuid                     references public.credential_templates(id) on delete set null,
  source_draft_id     uuid,
  source_snapshot_id  uuid,
  credential_type     public.credential_type   not null,
  status              public.credential_status not null default 'draft',
  title               text                     not null,
  description         text,
  public_id           text                     not null default gen_random_uuid()::text,
  issued_at           timestamptz,
  expires_at          timestamptz,
  revoked_at          timestamptz,
  issuer_did          text,
  acta_vc_id          text,
  metadata            jsonb                    not null default '{}'::jsonb,
  public_claims       jsonb                    not null default '{}'::jsonb,
  created_by          text,
  created_at          timestamptz              not null default now(),
  updated_at          timestamptz              not null default now()
);

create index credentials_entrepreneur_idx
  on public.credentials(entrepreneur_id);

create index credentials_status_idx
  on public.credentials(status);

create index credentials_type_idx
  on public.credentials(credential_type);

create unique index credentials_public_id_idx
  on public.credentials(public_id);

create index credentials_acta_vc_idx
  on public.credentials(acta_vc_id)
  where acta_vc_id is not null;

-- =============================================================================
-- ISSUANCE DRAFTS
-- =============================================================================

create table public.issuance_drafts (
  id                  uuid                          primary key default gen_random_uuid(),
  entrepreneur_id     text                          not null,
  template_id         uuid                          references public.credential_templates(id) on delete set null,
  latest_snapshot_id  uuid,
  prepared_payload    jsonb                         not null default '{}'::jsonb,
  status              public.issuance_draft_status  not null default 'draft',
  credential_type     public.credential_type        not null,
  title               text                          not null,
  description         text,
  operator_note       text,
  created_by          text,
  created_at          timestamptz                   not null default now(),
  updated_at          timestamptz                   not null default now()
);

create index issuance_drafts_entrepreneur_idx
  on public.issuance_drafts(entrepreneur_id);

-- Add foreign key from credentials to issuance_drafts
alter table public.credentials
  add constraint credentials_source_draft_fk
  foreign key (source_draft_id)
  references public.issuance_drafts(id)
  on delete set null;

-- =============================================================================
-- TRIGGERS: auto-update updated_at
-- =============================================================================

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger credentials_updated_at
  before update on public.credentials
  for each row execute function public.update_updated_at_column();

create trigger issuance_drafts_updated_at
  before update on public.issuance_drafts
  for each row execute function public.update_updated_at_column();

create trigger credential_templates_updated_at
  before update on public.credential_templates
  for each row execute function public.update_updated_at_column();
