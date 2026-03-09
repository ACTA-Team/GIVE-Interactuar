import { z } from 'zod'
import { StellarNetworkSchema } from '@/features/stellar/schemas'

export const VaultRoleSchema = z.enum(['read', 'sponsor', 'observer'])

export const CreateVaultSchema = z.object({
  entrepreneurId: z.string().uuid(),
  walletId: z.string().uuid().optional(),
  network: StellarNetworkSchema.default('testnet'),
  vaultRole: VaultRoleSchema.default('read'),
  vaultAddress: z.string().optional(),
  vaultContractId: z.string().optional(),
  sponsorAddress: z.string().optional(),
})

export type CreateVaultInput = z.infer<typeof CreateVaultSchema>
