// TODO: fill in actual contract IDs after deploying to Stellar testnet/mainnet

export const STELLAR_NETWORK = {
  TESTNET: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    horizonUrl: 'https://horizon-testnet.stellar.org',
  },
  MAINNET: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://soroban-mainnet.stellar.org',
    horizonUrl: 'https://horizon.stellar.org',
  },
} as const;

export type StellarNetwork = keyof typeof STELLAR_NETWORK;

// TODO: replace with actual deployed contract addresses
export const CONTRACT_IDS = {
  VC_VAULT: '' as string,
} as const;

export const ACTIVE_NETWORK: StellarNetwork =
  (process.env.NEXT_PUBLIC_STELLAR_NETWORK as StellarNetwork) ?? 'TESTNET';
