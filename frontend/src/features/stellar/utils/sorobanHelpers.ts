import type { StellarNetworkType } from '../types';
import { STELLAR_NETWORK } from '@/lib/constants/stellar';

// TODO: import from @stellar/stellar-sdk once installed
// import { Contract, SorobanRpc, TransactionBuilder, Networks } from '@stellar/stellar-sdk'

export function getRpcUrl(network: StellarNetworkType): string {
  const key = network.toUpperCase() as keyof typeof STELLAR_NETWORK;
  return STELLAR_NETWORK[key]?.rpcUrl ?? '';
}

export function getNetworkPassphrase(network: StellarNetworkType): string {
  const key = network.toUpperCase() as keyof typeof STELLAR_NETWORK;
  return STELLAR_NETWORK[key]?.networkPassphrase ?? '';
}

// TODO: implement once @stellar/stellar-sdk is installed
export async function invokeContract(_params: {
  contractId: string;
  method: string;
  args: unknown[];
  signerKeypair: unknown;
  network: StellarNetworkType;
}): Promise<{ txHash: string; ledgerSequence: number }> {
  // TODO:
  // 1. Initialize SorobanRpc.Server with getRpcUrl(network)
  // 2. Build TransactionBuilder with source account
  // 3. Add InvokeContractOperation
  // 4. Simulate, prepare, sign, and submit transaction
  // 5. Return txHash and ledger sequence
  throw new Error('Not implemented — install @stellar/stellar-sdk first');
}

// TODO: implement once @stellar/stellar-sdk is installed
export async function simulateContractCall(_params: {
  contractId: string;
  method: string;
  args: unknown[];
  network: StellarNetworkType;
}): Promise<unknown> {
  // TODO: read-only simulation via SorobanRpc.Server.simulateTransaction
  throw new Error('Not implemented — install @stellar/stellar-sdk first');
}
