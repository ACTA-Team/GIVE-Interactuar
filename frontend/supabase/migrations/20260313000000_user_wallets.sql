-- =============================================================================
-- Migration: User Wallets
-- Links Supabase Auth users to their Stellar smart-account-kit passkey wallets
-- Generated: 2026-03-13
-- =============================================================================

create table public.user_wallets (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  stellar_address text        not null,   -- contractId from smart-account-kit (passkey wallet)
  passkey_name    text,                   -- name given when creating the wallet (e.g. user's email)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint user_wallets_user_unique    unique(user_id),
  constraint user_wallets_address_unique unique(stellar_address)
);

alter table public.user_wallets enable row level security;

create policy "Users read own wallet"
  on public.user_wallets for select
  using (auth.uid() = user_id);

create policy "Users insert own wallet"
  on public.user_wallets for insert
  with check (auth.uid() = user_id);

create trigger user_wallets_updated_at
  before update on public.user_wallets
  for each row execute function public.update_updated_at_column();
