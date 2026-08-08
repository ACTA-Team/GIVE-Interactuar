/**
 * @acta-team/did-stellar@0.1.2 (2026-07-28) added C... smart-account
 * support to the `controller` validation — confirmed working. But DID
 * registration (ActaClient.getOrCreateIssuerIdentity /
 * IssuerIdentityProvider.getOrCreate) still requires an explicit
 * `sourcePublicKey` (a funded classic G... account or ACTA's relayer key)
 * to pay/source the registration transaction when controller is a
 * contract — unlike every other sourcePublicKey field in the SDK, this one
 * has no "omit it and the backend uses the relayer" fallback yet. We don't
 * have a funded G... keypair or ACTA's relayer public key, so real
 * issuance is still blocked. See conversation history for the exact SDK
 * error and source references. Flip to `false` once that's resolved.
 */
export const ACTA_ISSUANCE_SIMULATED: boolean = true;

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function simulateIssuerIdentity(controller: string): { did: string } {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet';
  return { did: `did:stellar:${network}:sim-${controller}` };
}

export function simulateIssueTx(): { txId: string } {
  return { txId: `sim_${randomHex(32)}` };
}
