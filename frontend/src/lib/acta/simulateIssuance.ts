/**
 * Read from env (NEXT_PUBLIC_ so it's also visible client-side — this flag
 * is checked both server-side, in issueCourseCredentialCore.ts, and
 * client-side, for UI badges and the legacy impact/behavior/profile/mba
 * flow in useIssueCredential.ts). Set NEXT_PUBLIC_ACTA_ISSUANCE_SIMULATED
 * in .env to "true" to fake issuance, or "false"/unset for real on-chain
 * issuance.
 */
export const ACTA_ISSUANCE_SIMULATED: boolean =
  process.env.NEXT_PUBLIC_ACTA_ISSUANCE_SIMULATED === 'true';

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
