import type { CredentialRepository } from '@/features/credentials/repositories/credentialRepository'
import type { CredentialVerificationStatus } from '../types'

// TODO: inject VcVaultService for on-chain verification
export function createVerificationService(credentialRepo: CredentialRepository) {
  return {
    async verify(credentialPublicId: string): Promise<CredentialVerificationStatus> {
      const credential = await credentialRepo.findByPublicId(credentialPublicId)

      if (!credential) {
        return {
          credentialPublicId,
          onchainVerified: null,
          dbStatus: 'not_found',
          isValid: false,
          checkedAt: new Date().toISOString(),
          publicClaims: {},
          title: '',
          issuedAt: null,
        }
      }

      // TODO: call VcVaultService.verify() if onchainContractId is present
      // const onchainVerified = credential.onchainContractId
      //   ? await vcVaultService.verify({ ... })
      //   : null

      const isValid = credential.status === 'issued'

      // TODO: persist verification record via repository
      // await verificationRepo.create({ credentialId: credential.id, verificationResult: isValid ? 'success' : 'failed', ... })

      return {
        credentialPublicId,
        onchainVerified: null, // TODO: fill from VcVaultService
        dbStatus: credential.status,
        isValid,
        checkedAt: new Date().toISOString(),
        publicClaims: credential.publicClaims,
        title: credential.title,
        issuedAt: credential.issuedAt,
      }
    },
  }
}

export type VerificationService = ReturnType<typeof createVerificationService>
