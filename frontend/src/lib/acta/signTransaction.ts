import { xdr } from '@stellar/stellar-sdk';
import { getSmartAccountKit } from '@/lib/smart-account/config';

// The browser `buffer` polyfill (npm "buffer") lacks BigInt read/write helpers
// that stellar-sdk's XDR parser needs when deserialising Soroban footprints
// containing uint64/int64 fields (nonce TTLs, etc.).
/* eslint-disable @typescript-eslint/no-explicit-any */
const _bp = (typeof Buffer !== 'undefined' ? Buffer.prototype : null) as any;
if (_bp && typeof _bp.readBigUInt64BE !== 'function') {
  _bp.readBigUInt64BE = function (offset = 0) {
    const hi = BigInt(this.readUInt32BE(offset));
    const lo = BigInt(this.readUInt32BE(offset + 4));
    return (hi << BigInt(32)) | lo;
  };
}
if (_bp && typeof _bp.readBigInt64BE !== 'function') {
  _bp.readBigInt64BE = function (offset = 0) {
    const v: bigint = this.readBigUInt64BE(offset);
    return v >= BigInt(1) << BigInt(63) ? v - (BigInt(1) << BigInt(64)) : v;
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Builds a signTransaction function compatible with the ACTA SDK.
 *
 * The ACTA API prepares an unsigned Soroban transaction as XDR.
 * We sign the Soroban auth entries using the passkey wallet (WebAuthn),
 * then re-simulate so the resource limits include the __check_auth cost
 * (P-256 ECDSA verification is much heavier than the unsigned simulation estimates).
 * The ACTA backend adds the fee-payer signature before submitting.
 */
export function buildSignTransaction() {
  return async (
    unsignedXdr: string,
    opts: { networkPassphrase: string },
  ): Promise<string> => {
    const kit = getSmartAccountKit();

    const txEnvelope = xdr.TransactionEnvelope.fromXDR(unsignedXdr, 'base64');

    const txBody =
      txEnvelope.switch().name === 'envelopeTypeTxV0'
        ? txEnvelope.v0().tx()
        : txEnvelope.v1().tx();

    let hasSorobanAuth = false;

    for (const op of txBody.operations()) {
      if ((op.body().switch().name as string) !== 'invokeHostFunction') continue;

      const authEntries = op.body().invokeHostFunctionOp().auth();
      for (let i = 0; i < authEntries.length; i++) {
        const entry = authEntries[i];
        if (entry.credentials().switch().name !== 'sorobanCredentialsAddress')
          continue;
        hasSorobanAuth = true;

        // smart-account-kit bundles stellar-sdk@14 internally.
        // Round-trip through raw XDR to reconcile types with our stellar-sdk@13.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signedKit = (await kit.signAuthEntry(entry as unknown as any)) as any;
        const signedEntry = xdr.SorobanAuthorizationEntry.fromXDR(
          signedKit.toXDR(),
        ) as typeof entry;
        authEntries[i] = signedEntry;
      }
    }

    // The initial ACTA API simulation runs without signatures, so it never
    // executes the smart-account's __check_auth (WebAuthn P-256 verify).
    // Re-simulating with signed entries lets the RPC measure the real cost;
    // without this step the tx fails with INVOKE_HOST_FUNCTION_TRAPPED.
    if (hasSorobanAuth) {
      await resimulateAndPatchResources(txEnvelope, opts.networkPassphrase);
    }

    return txEnvelope.toXDR('base64');
  };
}

async function resimulateAndPatchResources(
  txEnvelope: xdr.TransactionEnvelope,
  networkPassphrase: string,
): Promise<void> {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  if (!rpcUrl) return;

  // Call Soroban JSON-RPC directly instead of stellar-sdk's rpc.Server /
  // TransactionBuilder.fromXDR — those pull in Buffer.readBigUInt64BE which
  // the browser buffer polyfill doesn't support.
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'simulateTransaction',
      params: { transaction: txEnvelope.toXDR('base64') },
    }),
  });

  const json = await res.json();
  const sim = json?.result;

  if (!sim || sim.error || !sim.transactionData) {
    console.error('[signTransaction] re-simulation failed:', sim?.error ?? json);
    return;
  }

  // sim.transactionData is base64-encoded SorobanTransactionData XDR.
  // Prepend the union discriminant (int32 = 1) to form a full TransactionExt.
  const sorobanDataBytes = Buffer.from(sim.transactionData as string, 'base64');
  const extBuf = Buffer.alloc(4 + sorobanDataBytes.length);
  extBuf.writeInt32BE(1, 0);
  sorobanDataBytes.copy(extBuf, 4);

  const v1Tx = txEnvelope.v1().tx();
  v1Tx.ext(xdr.TransactionExt.fromXDR(extBuf));

  const resourceFee = parseInt(sim.minResourceFee as string, 10);
  const newFee = 100 + resourceFee;
  if (newFee > v1Tx.fee()) {
    v1Tx.fee(newFee);
  }
}
