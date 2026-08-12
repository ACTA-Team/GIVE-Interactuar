import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';

/**
 * Server-only signer for a classic (G...) Stellar account. No passkey, no
 * Soroban auth entries — just a plain Ed25519 signature over the tx
 * envelope. Used when the account itself is the issuer (not a smart
 * contract wallet), so it's both the signer and the classic transaction
 * source in one.
 */
export function buildClassicSignTransaction(secretKey: string) {
  const keypair = Keypair.fromSecret(secretKey);

  return async (
    unsignedXdr: string,
    opts: { networkPassphrase: string },
  ): Promise<string> => {
    const tx = TransactionBuilder.fromXDR(unsignedXdr, opts.networkPassphrase);
    tx.sign(keypair);
    return tx.toXDR();
  };
}
