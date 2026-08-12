import { ActaClient, mainNet, testNet } from '@acta-team/credentials';

let instance: Promise<ActaClient> | null = null;

/**
 * Server-only ActaClient — mirrors the baseURL/apiKey resolution in
 * src/app/providers.tsx (the client-side ActaConfig), but constructed
 * directly since API routes don't run inside the React tree.
 *
 * Fetches /config first and pins registryContractId to whatever ACTA's
 * backend actually uses. Without this, IssuerIdentityProvider falls back
 * to @acta-team/did-stellar's hardcoded DEFAULT_REGISTRY_CONTRACT_IDS,
 * which is stale (confirmed empirically 2026-08-11 — the SDK default is a
 * retired did-stellar-registry contract; ACTA's own /config reports a
 * newer one, v0.3.0). Registering against the stale default succeeds
 * on-chain but ACTA's vcIssue endpoint then can't resolve that issuerDid
 * (`issuerDid_unresolvable`), since it validates against the current
 * contract instead.
 */
export function getServerActaClient(): Promise<ActaClient> {
  if (instance) return instance;

  const apiKey = process.env.NEXT_PUBLIC_ACTA_API_KEY;
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_ACTA_API_KEY');
  }

  const baseURL =
    process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? mainNet : testNet;

  instance = (async () => {
    const res = await fetch(new URL('/config', baseURL), {
      headers: { 'X-ACTA-Key': apiKey },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch ACTA /config: ${res.status}`);
    }
    const config = (await res.json()) as { didStellarRegistryId?: string };

    return new ActaClient(baseURL, apiKey, {
      registryContractId: config.didStellarRegistryId,
      // ACTA's testnet API is occasionally slow enough to blow the SDK's
      // 30s default (confirmed empirically 2026-08-11 — real batch runs hit
      // "timeout of 30000ms exceeded" on some students, not all). Doesn't
      // fix their latency, just gives it more room before giving up.
      timeoutMs: 60000,
    });
  })();

  return instance;
}
