import { z } from 'zod';

export const StellarNetworkSchema = z.enum(['testnet', 'mainnet', 'futurenet']);

// Stellar public key (G... address) basic validation
export const StellarAddressSchema = z
  .string()
  .regex(/^G[A-Z2-7]{55}$/, 'Dirección Stellar inválida (debe comenzar con G)');

export const ContractIdSchema = z
  .string()
  .regex(
    /^C[A-Z2-7]{55}$/,
    'Contract ID de Soroban inválido (debe comenzar con C)',
  );
