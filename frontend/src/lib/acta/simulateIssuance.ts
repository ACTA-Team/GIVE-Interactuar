/**
 * ACTA's did:stellar registry only accepts classic G... accounts as
 * `controller` (v0.1) — it rejects our smart-contract wallets (C...), both
 * via the SDK and the raw API (confirmed directly). Real on-chain issuance
 * is on hold until the issuer architecture is decided, so this generates
 * plausible-looking but fake identifiers instead, letting the rest of the
 * product (batch issue, emails, public credential page) be built and
 * tested without blockchain in the loop. Flip `ACTA_ISSUANCE_SIMULATED` to
 * `false` once real issuance is unblocked.
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
