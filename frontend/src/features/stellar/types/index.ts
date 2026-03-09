export type StellarNetworkType = 'testnet' | 'mainnet' | 'futurenet';

// Represents a Soroban contract invocation result
export interface SorobanInvokeResult {
  txHash: string;
  ledgerSequence: number;
  success: boolean;
  returnValue?: unknown;
}

// Represents a VC stored in a vc-vault contract
export interface VcVaultEntry {
  vcId: string;
  ownerAddress: string;
  contractId: string;
  issuanceContract: string;
  network: StellarNetworkType;
}

// Parameters needed to call issue() on the vc-vault contract
export interface IssueVcParams {
  ownerAddress: string; // vault owner (subject)
  vcId: string; // unique VC identifier
  issuerAddress: string; // issuer_addr
  contractId: string; // the deployed vc-vault contract address
  network: StellarNetworkType;
}

// Parameters needed to call verify_vc() on the vc-vault contract
export interface VerifyVcParams {
  ownerAddress: string;
  vcId: string;
  contractId: string;
  network: StellarNetworkType;
}

// Parameters needed to call revoke() on the vc-vault contract
export interface RevokeVcParams {
  ownerAddress: string;
  vcId: string;
  issuerAddress: string;
  contractId: string;
  network: StellarNetworkType;
}
