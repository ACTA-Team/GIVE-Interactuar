// Server-only module: persists the ACTA issuer identity (did:stellar +
// its Ed25519 signing keys) in Postgres so it survives Vercel serverless
// cold starts. Without this, ActaClient falls back to in-memory storage,
// which is lost on every restart — minting a new DID each time and
// orphaning every credential already issued under the old one. Same
// service-role access pattern as src/lib/supabase/storage.ts.
import { createClient } from '@supabase/supabase-js';
import type { IssuerIdentity, IssuerIdentityStorage } from '@acta-team/credentials';
import { supabaseUrl, supabaseRoleKey } from '@/lib/constants/env';

interface IssuerIdentityRow {
  controller: string;
  network: string;
  did: string;
  assertion_public_key_multibase: string;
  assertion_private_key_hex: string;
  assertion_public_key_hex: string;
  authentication_public_key_multibase: string | null;
  authentication_private_key_hex: string | null;
  authentication_public_key_hex: string | null;
}

function rowToIdentity(row: IssuerIdentityRow): IssuerIdentity {
  return {
    did: row.did,
    controller: row.controller,
    assertionPublicKeyMultibase: row.assertion_public_key_multibase,
    assertionPrivateKeyHex: row.assertion_private_key_hex,
    assertionPublicKeyHex: row.assertion_public_key_hex,
    authenticationPublicKeyMultibase:
      row.authentication_public_key_multibase ?? undefined,
    authenticationPrivateKeyHex:
      row.authentication_private_key_hex ?? undefined,
    authenticationPublicKeyHex: row.authentication_public_key_hex ?? undefined,
  };
}

export function createSupabaseIssuerIdentityStorage(): IssuerIdentityStorage {
  const supabase = createClient(supabaseUrl!, supabaseRoleKey!);

  return {
    isEphemeral: false,

    async get(controller, network) {
      const { data, error } = await supabase
        .from('issuer_identities')
        .select(
          'controller, network, did, assertion_public_key_multibase, assertion_private_key_hex, assertion_public_key_hex, authentication_public_key_multibase, authentication_private_key_hex, authentication_public_key_hex',
        )
        .eq('controller', controller)
        .eq('network', network)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return rowToIdentity(data as IssuerIdentityRow);
    },

    async set(identity, network) {
      const { error } = await supabase.from('issuer_identities').upsert(
        {
          controller: identity.controller,
          network,
          did: identity.did,
          assertion_public_key_multibase: identity.assertionPublicKeyMultibase,
          assertion_private_key_hex: identity.assertionPrivateKeyHex,
          assertion_public_key_hex: identity.assertionPublicKeyHex,
          authentication_public_key_multibase:
            identity.authenticationPublicKeyMultibase ?? null,
          authentication_private_key_hex:
            identity.authenticationPrivateKeyHex ?? null,
          authentication_public_key_hex:
            identity.authenticationPublicKeyHex ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'controller,network' },
      );

      if (error) throw error;
    },
  };
}
