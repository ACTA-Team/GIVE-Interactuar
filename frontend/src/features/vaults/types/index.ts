export type StellarNetworkType = 'testnet' | 'mainnet' | 'futurenet';
export type VaultRole = 'read' | 'sponsor' | 'observer';

export interface SponsorVault {
  id: string;
  entrepreneurId: string;
  walletId: string | null;
  network: StellarNetworkType;
  vaultRole: VaultRole;
  vaultAddress: string | null;
  vaultContractId: string | null;
  vaultDidUri: string | null;
  vaultRevoked: boolean;
  sponsorAddress: string | null;
  active: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
