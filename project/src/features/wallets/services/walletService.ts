import type { WalletRepository } from '../repositories/walletRepository'
import type { StellarWallet } from '../types'

export function createWalletService(repo: WalletRepository) {
  return {
    async listByEntrepreneur(entrepreneurId: string): Promise<StellarWallet[]> {
      return repo.findByEntrepreneur(entrepreneurId)
    },

    async getById(id: string): Promise<StellarWallet | null> {
      return repo.findById(id)
    },

    async verifyOwnership(_walletId: string, _challengeSignature: string): Promise<boolean> {
      // TODO: verify that the entrepreneur controls the private key
      // by validating a signed challenge (sign-in with Stellar pattern)
      throw new Error('Not implemented')
    },
  }
}

export type WalletService = ReturnType<typeof createWalletService>
