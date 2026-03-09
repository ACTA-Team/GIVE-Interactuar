-- =============================================================================
-- Migration: initial schema
-- Source: supabase-schema.sql (root of repo)
-- Generated: 2024-01-01
-- =============================================================================

create extension if not exists "pgcrypto";

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
  'verification',
  'endorsement'
);

create type public.relationship_type as enum (
  'endorses',
  'verifies',
  'references',
  'supersedes'
);

create type public.sync_status as enum (
  'running',
  'success',
  'partial_success',
  'failed'
);

create type public.stellar_network as enum (
  'testnet',
  'mainnet',
  'futurenet'
);

create type public.vault_role as enum (
  'read',
  'sponsor',
  'observer'
);

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

create table public.organizations (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  legal_name      text,
  document_type   text,
  document_number text,
  email           text,
  phone           text,
  metadata        jsonb       not null default '{}'::jsonb,
  active          boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index organizations_document_idx
  on public.organizations(document_type, document_number);

-- =============================================================================
-- INTERNAL USERS
-- =============================================================================

create table public.internal_users (
  id              uuid        primary key default gen_random_uuid(),
  auth_user_id    uuid        unique,
  organization_id uuid        not null references public.organizations(id) on delete restrict,
  full_name       text        not null,
  email           text        not null unique,
  role            text        not null check (role in ('admin', 'operator', 'viewer')),
  active          boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================================================
-- ENTREPRENEURS
-- =============================================================================

create table public.entrepreneurs (
  id              uuid        primary key default gen_random_uuid(),
  organization_id uuid        not null references public.organizations(id) on delete restrict,
  first_name      text        not null,
  last_name       text        not null,
  full_name       text        generated always as (trim(first_name || ' ' || last_name)) stored,
  document_type   text        not null,
  document_number text        not null,
  email           text,
  phone           text,
  municipality    text,
  department      text,
  country         text        default 'Colombia',
  active          boolean     not null default true,
  metadata        jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index entrepreneurs_org_document_idx
  on public.entrepreneurs(organization_id, document_type, document_number);

create index entrepreneurs_name_idx
  on public.entrepreneurs(full_name);

-- =============================================================================
-- BUSINESS PROFILE
-- =============================================================================

create table public.entrepreneur_business_profiles (
  id                 uuid          primary key default gen_random_uuid(),
  entrepreneur_id    uuid          not null references public.entrepreneurs(id) on delete cascade,
  business_name      text,
  business_sector    text,
  business_activity  text,
  monthly_sales      numeric(18,2),
  monthly_costs      numeric(18,2),
  employee_count     integer,
  formalized         boolean,
  metadata           jsonb         not null default '{}'::jsonb,
  created_at         timestamptz   not null default now(),
  updated_at         timestamptz   not null default now()
);

create unique index entrepreneur_business_profiles_unique_idx
  on public.entrepreneur_business_profiles(entrepreneur_id);

-- =============================================================================
-- FORM SOURCES
-- =============================================================================

create table public.form_sources (
  id               uuid        primary key default gen_random_uuid(),
  organization_id  uuid        not null references public.organizations(id) on delete restrict,
  provider         text        not null default 'google_forms',
  external_form_id text        not null,
  name             text        not null,
  description      text,
  active           boolean     not null default true,
  metadata         jsonb       not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index form_sources_provider_external_idx
  on public.form_sources(provider, external_form_id);

-- =============================================================================
-- RAW SUBMISSIONS
-- =============================================================================

create table public.form_submissions_raw (
  id                   uuid        primary key default gen_random_uuid(),
  form_source_id       uuid        not null references public.form_sources(id) on delete restrict,
  external_response_id text        not null,
  submitted_at         timestamptz,
  responder_email      text,
  raw_payload          jsonb       not null,
  raw_answers          jsonb       not null,
  checksum             text,
  synced_at            timestamptz not null default now(),
  created_at           timestamptz not null default now()
);

create unique index form_submissions_raw_unique_response_idx
  on public.form_submissions_raw(form_source_id, external_response_id);

-- =============================================================================
-- SYNC RUNS
-- =============================================================================

create table public.form_sync_runs (
  id              uuid               primary key default gen_random_uuid(),
  form_source_id  uuid               not null references public.form_sources(id) on delete restrict,
  status          public.sync_status not null,
  started_at      timestamptz        not null default now(),
  finished_at     timestamptz,
  total_fetched   integer            not null default 0,
  total_inserted  integer            not null default 0,
  total_updated   integer            not null default 0,
  total_failed    integer            not null default 0,
  error_log       jsonb              not null default '[]'::jsonb,
  metadata        jsonb              not null default '{}'::jsonb,
  created_at      timestamptz        not null default now()
);

-- =============================================================================
-- SNAPSHOTS
-- =============================================================================

create table public.entrepreneur_profile_snapshots (
  id                   uuid        primary key default gen_random_uuid(),
  entrepreneur_id      uuid        not null references public.entrepreneurs(id) on delete cascade,
  source_submission_id uuid        references public.form_submissions_raw(id) on delete set null,
  source_sync_run_id   uuid        references public.form_sync_runs(id) on delete set null,
  snapshot_version     integer     not null,
  is_latest            boolean     not null default true,
  snapshot_date        date        not null default current_date,
  data                 jsonb       not null,
  created_at           timestamptz not null default now()
);

create unique index entrepreneur_profile_snapshots_version_idx
  on public.entrepreneur_profile_snapshots(entrepreneur_id, snapshot_version);

create index entrepreneur_profile_snapshots_latest_idx
  on public.entrepreneur_profile_snapshots(entrepreneur_id, is_latest);

-- =============================================================================
-- STELLAR WALLETS
-- =============================================================================

create table public.stellar_wallets (
  id                 uuid                   primary key default gen_random_uuid(),
  entrepreneur_id    uuid                   not null references public.entrepreneurs(id) on delete cascade,
  public_key         text                   not null,
  network            public.stellar_network not null default 'testnet',
  is_primary         boolean                not null default false,
  is_verified        boolean                not null default false,
  federation_address text,
  metadata           jsonb                  not null default '{}'::jsonb,
  created_at         timestamptz            not null default now(),
  updated_at         timestamptz            not null default now()
);

create unique index stellar_wallets_unique_pk_network_idx
  on public.stellar_wallets(public_key, network);

create index stellar_wallets_entrepreneur_idx
  on public.stellar_wallets(entrepreneur_id, is_primary);

-- =============================================================================
-- SPONSOR VAULTS
-- =============================================================================

create table public.sponsor_vaults (
  id                uuid                   primary key default gen_random_uuid(),
  entrepreneur_id   uuid                   not null references public.entrepreneurs(id) on delete cascade,
  wallet_id         uuid                   references public.stellar_wallets(id) on delete set null,
  network           public.stellar_network not null default 'testnet',
  vault_role        public.vault_role      not null default 'read',
  vault_address     text,
  vault_contract_id text,
  vault_did_uri     text,
  vault_revoked     boolean                not null default false,
  sponsor_address   text,
  active            boolean                not null default true,
  metadata          jsonb                  not null default '{}'::jsonb,
  created_at        timestamptz            not null default now(),
  updated_at        timestamptz            not null default now()
);

create index sponsor_vaults_entrepreneur_idx
  on public.sponsor_vaults(entrepreneur_id);

create index sponsor_vaults_vault_contract_idx
  on public.sponsor_vaults(vault_contract_id);

create index sponsor_vaults_vault_address_idx
  on public.sponsor_vaults(vault_address);

-- =============================================================================
-- CREDENTIAL TEMPLATES
-- =============================================================================

create table public.credential_templates (
  id                  uuid                   primary key default gen_random_uuid(),
  organization_id     uuid                   not null references public.organizations(id) on delete restrict,
  name                text                   not null,
  credential_type     public.credential_type not null,
  schema_version      text                   not null,
  template_definition jsonb                  not null,
  active              boolean                not null default true,
  created_at          timestamptz            not null default now(),
  updated_at          timestamptz            not null default now()
);

-- =============================================================================
-- ISSUANCE DRAFTS
-- =============================================================================

create table public.issuance_drafts (
  id                  uuid        primary key default gen_random_uuid(),
  organization_id     uuid        not null references public.organizations(id) on delete restrict,
  entrepreneur_id     uuid        not null references public.entrepreneurs(id) on delete restrict,
  template_id         uuid        references public.credential_templates(id) on delete set null,
  latest_snapshot_id  uuid        references public.entrepreneur_profile_snapshots(id) on delete set null,
  subject_wallet_id   uuid        references public.stellar_wallets(id) on delete set null,
  sponsor_vault_id    uuid        references public.sponsor_vaults(id) on delete set null,
  prepared_payload    jsonb       not null default '{}'::jsonb,
  status              text        not null default 'draft' check (status in ('draft', 'ready', 'archived')),
  created_by          uuid        references public.internal_users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- =============================================================================
-- CREDENTIALS
-- =============================================================================

create table public.credentials (
  id                        uuid                      primary key default gen_random_uuid(),
  organization_id           uuid                      not null references public.organizations(id) on delete restrict,
  entrepreneur_id           uuid                      not null references public.entrepreneurs(id) on delete restrict,
  template_id               uuid                      references public.credential_templates(id) on delete set null,
  source_draft_id           uuid                      references public.issuance_drafts(id) on delete set null,
  source_snapshot_id        uuid                      references public.entrepreneur_profile_snapshots(id) on delete set null,
  credential_type           public.credential_type    not null,
  status                    public.credential_status  not null default 'draft',
  title                     text                      not null,
  description               text,
  public_id                 text                      not null unique,

  issued_at                 timestamptz,
  expires_at                timestamptz,
  revoked_at                timestamptz,

  issuer_stellar_address    text,
  issuer_did                text,

  subject_wallet_id         uuid                      references public.stellar_wallets(id) on delete set null,
  sponsor_vault_id          uuid                      references public.sponsor_vaults(id) on delete set null,

  onchain_vc_id             text,
  onchain_owner_address     text,
  onchain_contract_id       text,
  onchain_issuance_contract text,
  onchain_tx_hash           text,
  onchain_ledger_sequence   bigint,
  onchain_network           public.stellar_network,

  metadata                  jsonb                     not null default '{}'::jsonb,
  public_claims             jsonb                     not null default '{}'::jsonb,
  private_claims            jsonb                     not null default '{}'::jsonb,

  created_by                uuid                      references public.internal_users(id) on delete set null,
  created_at                timestamptz               not null default now(),
  updated_at                timestamptz               not null default now()
);

create index credentials_entrepreneur_idx
  on public.credentials(entrepreneur_id, created_at desc);

create index credentials_public_id_idx
  on public.credentials(public_id);

create index credentials_onchain_contract_idx
  on public.credentials(onchain_contract_id);

create index credentials_onchain_owner_idx
  on public.credentials(onchain_owner_address);

create index credentials_onchain_vc_id_idx
  on public.credentials(onchain_vc_id);

-- =============================================================================
-- CREDENTIAL RELATIONSHIPS
-- =============================================================================

create table public.credential_relationships (
  id                   uuid                     primary key default gen_random_uuid(),
  parent_credential_id uuid                     not null references public.credentials(id) on delete cascade,
  child_credential_id  uuid                     not null references public.credentials(id) on delete cascade,
  relationship_type    public.relationship_type not null,
  created_at           timestamptz              not null default now(),
  constraint credential_relationships_no_self
    check (parent_credential_id <> child_credential_id)
);

create unique index credential_relationships_unique_idx
  on public.credential_relationships(parent_credential_id, child_credential_id, relationship_type);

-- =============================================================================
-- CREDENTIAL EVIDENCE SNAPSHOTS
-- =============================================================================

create table public.credential_evidence_snapshots (
  id                       uuid        primary key default gen_random_uuid(),
  credential_id            uuid        not null references public.credentials(id) on delete cascade,
  entrepreneur_snapshot_id uuid        references public.entrepreneur_profile_snapshots(id) on delete set null,
  source_submission_id     uuid        references public.form_submissions_raw(id) on delete set null,
  evidence_payload         jsonb       not null,
  created_at               timestamptz not null default now()
);

-- =============================================================================
-- CREDENTIAL PUSHES
-- =============================================================================

create table public.credential_pushes (
  id                   uuid                   primary key default gen_random_uuid(),
  credential_id        uuid                   not null references public.credentials(id) on delete cascade,
  from_owner_address   text                   not null,
  to_owner_address     text                   not null,
  issuer_address       text                   not null,
  onchain_tx_hash      text,
  onchain_ledger_seq   bigint,
  network              public.stellar_network,
  pushed_at            timestamptz            not null default now()
);

create index credential_pushes_credential_idx
  on public.credential_pushes(credential_id);

create index credential_pushes_from_owner_idx
  on public.credential_pushes(from_owner_address);

create index credential_pushes_to_owner_idx
  on public.credential_pushes(to_owner_address);

-- =============================================================================
-- VERIFICATION RECORDS
-- =============================================================================

create table public.verification_records (
  id                  uuid        primary key default gen_random_uuid(),
  credential_id       uuid        not null references public.credentials(id) on delete cascade,
  verifier_type       text,
  verifier_identifier text,
  verification_result text        not null check (verification_result in ('success', 'failed')),
  checked_at          timestamptz not null default now(),
  metadata            jsonb       not null default '{}'::jsonb
);
