import type { VaultRepository } from '../repositories/vaultRepository'
import type { SponsorVault } from '../types'

export function createVaultService(repo: VaultRepository) {
  return {
    async listByEntrepreneur(entrepreneurId: string): Promise<SponsorVault[]> {
      return repo.findByEntrepreneur(entrepreneurId)
    },

    async getById(id: string): Promise<SponsorVault | null> {
      return repo.findById(id)
    },

    async deployVault(_entrepreneurId: string): Promise<SponsorVault> {
      // TODO:
      // 1. Get entrepreneur's primary wallet
      // 2. Call VcVaultService to deploy a new vc-vault contract (Soroban)
      // 3. Persist new SponsorVault record with contract address
      throw new Error('Not implemented')
    },
  }
}

export type VaultService = ReturnType<typeof createVaultService>
