import { z } from 'zod'
import { StellarAddressSchema, StellarNetworkSchema } from '@/features/stellar/schemas'

export const AddWalletSchema = z.object({
  entrepreneurId: z.string().uuid(),
  publicKey: StellarAddressSchema,
  network: StellarNetworkSchema.default('testnet'),
  isPrimary: z.boolean().default(false),
  federationAddress: z.string().optional(),
})

export type AddWalletInput = z.infer<typeof AddWalletSchema>
