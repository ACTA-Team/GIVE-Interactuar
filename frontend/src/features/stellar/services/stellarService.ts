import type { StellarNetworkType, SorobanInvokeResult } from '../types'

// TODO: implement once @stellar/stellar-sdk is installed
// This service handles generic Stellar/Soroban operations
export function createStellarService() {
  return {
    async getAccountInfo(_publicKey: string, _network: StellarNetworkType): Promise<unknown> {
      // TODO: call Horizon API to check account existence and balances
      throw new Error('Not implemented')
    },

    async fundTestnetAccount(_publicKey: string): Promise<void> {
      // TODO: call https://friendbot.stellar.org/?addr={publicKey} for testnet funding
      throw new Error('Not implemented')
    },

    async submitTransaction(
      _xdr: string,
      _network: StellarNetworkType,
    ): Promise<SorobanInvokeResult> {
      // TODO: submit signed XDR transaction via SorobanRpc.Server
      throw new Error('Not implemented')
    },
  }
}

export type StellarService = ReturnType<typeof createStellarService>
