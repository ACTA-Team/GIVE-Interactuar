export type StellarNetworkType = 'testnet' | 'mainnet' | 'futurenet'

export interface StellarWallet {
  id: string
  entrepreneurId: string
  publicKey: string
  network: StellarNetworkType
  isPrimary: boolean
  isVerified: boolean
  federationAddress: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}
