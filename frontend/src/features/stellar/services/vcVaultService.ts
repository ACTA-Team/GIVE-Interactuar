import type {
  SorobanInvokeResult,
  IssueVcParams,
  VerifyVcParams,
  RevokeVcParams,
} from '../types';

// Wraps calls to the vc-vault Soroban smart contract:
// issue(owner, vc_id, issuer_addr)   → stores the VC in the vault
// verify_vc(owner, vc_id)            → returns bool (on-chain verification)
// revoke(owner, vc_id, issuer_addr)  → marks VC as revoked
// push(owner, new_owner, vc_id, issuer_addr) → transfers VC to new vault
//
// TODO: implement once @stellar/stellar-sdk is installed
// TODO: inject a signerKeypair or use WalletKit for user-signed transactions
export function createVcVaultService() {
  return {
    async issue(params: IssueVcParams): Promise<SorobanInvokeResult> {
      // TODO:
      // 1. Build Soroban invocation for issue(owner, vc_id, issuer_addr) on params.contractId
      // 2. Sign with issuer keypair
      // 3. Submit and return result
      void params;
      throw new Error('Not implemented — install @stellar/stellar-sdk first');
    },

    async verify(params: VerifyVcParams): Promise<boolean> {
      // TODO:
      // 1. Simulate verify_vc(owner, vc_id) on params.contractId (read-only)
      // 2. Parse boolean return value
      void params;
      throw new Error('Not implemented — install @stellar/stellar-sdk first');
    },

    async revoke(params: RevokeVcParams): Promise<SorobanInvokeResult> {
      // TODO:
      // 1. Build Soroban invocation for revoke(owner, vc_id, issuer_addr) on params.contractId
      // 2. Sign with issuer keypair
      // 3. Submit and return result
      void params;
      throw new Error('Not implemented — install @stellar/stellar-sdk first');
    },
  };
}

export type VcVaultService = ReturnType<typeof createVcVaultService>;
