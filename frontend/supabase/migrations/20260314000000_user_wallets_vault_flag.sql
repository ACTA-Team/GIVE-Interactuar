-- =============================================================================
-- Migration: Add vault_initialized flag to user_wallets
-- Tracks whether the ACTA vault + issuer authorization have been completed.
-- =============================================================================

alter table public.user_wallets
  add column vault_initialized boolean not null default false;

-- Allow users to update their own row (needed to flip vault_initialized).
create policy "Users update own wallet"
  on public.user_wallets for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
