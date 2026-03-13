import { SmartAccountKit, IndexedDBStorage } from 'smart-account-kit';

let instance: SmartAccountKit | null = null;

function buildConfig() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const networkPassphrase = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE;
  const accountWasmHash = process.env.NEXT_PUBLIC_ACCOUNT_WASM_HASH;
  const webauthnVerifierAddress = process.env.NEXT_PUBLIC_WEBAUTHN_VERIFIER;

  if (
    !rpcUrl ||
    !networkPassphrase ||
    !accountWasmHash ||
    !webauthnVerifierAddress
  ) {
    throw new Error(
      'Missing SmartAccountKit env vars: NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_NETWORK_PASSPHRASE, NEXT_PUBLIC_ACCOUNT_WASM_HASH, NEXT_PUBLIC_WEBAUTHN_VERIFIER',
    );
  }

  return {
    rpcUrl,
    networkPassphrase,
    accountWasmHash,
    webauthnVerifierAddress,
    storage: new IndexedDBStorage(),
    rpId:
      typeof window !== 'undefined' ? window.location.hostname : 'localhost',
    rpName: 'Interactuar',
    timeoutInSeconds: 30,
  };
}

export function getSmartAccountKit(): SmartAccountKit {
  if (typeof window === 'undefined') {
    throw new Error('SmartAccountKit can only be used in the browser');
  }
  if (!instance) {
    instance = new SmartAccountKit(buildConfig());
  }
  return instance;
}
