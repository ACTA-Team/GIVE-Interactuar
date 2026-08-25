-- Persists the ACTA issuer identity (did:stellar + its Ed25519 signing
-- keys) so it survives Vercel serverless cold starts. Without this, the
-- SDK's default in-memory storage loses the identity on every restart,
-- minting a new DID (and orphaning every previously issued credential)
-- each time — see @acta-team/credentials' EphemeralIssuerStorageError.
--
-- Holds private key material (assertion/authentication signing keys).
-- Service-role only, same access model as other server-only tables in
-- this project (e.g. course-templates storage) — never exposed to the
-- browser, no RLS policies for anon/authenticated roles.
create table public.issuer_identities (
  id                                  uuid        primary key default gen_random_uuid(),
  controller                          text        not null,
  network                             text        not null check (network in ('mainnet', 'testnet')),
  did                                 text        not null,
  assertion_public_key_multibase      text        not null,
  assertion_private_key_hex           text        not null,
  assertion_public_key_hex            text        not null,
  authentication_public_key_multibase text,
  authentication_private_key_hex      text,
  authentication_public_key_hex       text,
  created_at                          timestamptz not null default now(),
  updated_at                          timestamptz not null default now(),
  unique (controller, network)
);
