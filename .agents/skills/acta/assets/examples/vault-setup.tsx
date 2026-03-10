import { useVault } from '@acta-team/acta-sdk';
import freighter from '@stellar/freighter-api';
import { useState } from 'react';

/**
 * Example component for vault setup and management
 *
 * This component demonstrates:
 * - Creating a new credential vault
 * - Authorizing issuers
 * - Revoking issuer authorization
 * - Managing vault permissions
 * - Error handling for vault operations
 */
export function VaultSetup() {
  const { createVault, authorizeIssuer, revokeIssuer } = useVault();
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Create vault
  const handleCreateVault = async () => {
    try {
      setIsLoading(true);
      setStatus('Connecting to Freighter wallet...');

      // Get wallet address
      const address = await freighter.getPublicKey();
      setWalletAddress(address);

      setStatus('Creating vault...');

      // Create owner DID
      const ownerDid = `did:pkh:stellar:testnet:${address}`;

      // Create vault (requires wallet signature)
      await createVault({
        owner: address,
        ownerDid: ownerDid,
        signTransaction: freighter.signTransaction
      });

      setStatus('✅ Vault created successfully!');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        setStatus('ℹ️ Vault already exists for this wallet');
      } else if (error.message?.includes('User declined')) {
        setStatus('❌ Transaction cancelled by user');
      } else if (error.message?.includes('balance')) {
        setStatus('❌ Insufficient balance. Fund your testnet wallet at https://laboratory.stellar.org/#account-creator?network=test');
      } else {
        setStatus(`❌ Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Connect wallet to check status
  const handleConnectWallet = async () => {
    try {
      const address = await freighter.getPublicKey();
      setWalletAddress(address);
      setStatus(`Connected: ${address}`);
    } catch (error) {
      setStatus('❌ Please install Freighter wallet');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Vault Setup</h2>

      <div className="mb-4 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">What is a Vault?</h3>
        <p className="text-sm text-blue-800">
          A vault is your encrypted, on-chain storage for verifiable credentials.
          Each wallet can have one vault that stores all your credentials permanently.
        </p>
      </div>

      {!walletAddress && (
        <button
          onClick={handleConnectWallet}
          className="w-full py-2 px-4 mb-4 rounded font-semibold bg-gray-600 hover:bg-gray-700 text-white"
        >
          Connect Freighter Wallet
        </button>
      )}

      {walletAddress && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="text-xs text-gray-600">Connected Wallet:</p>
          <p className="text-xs font-mono break-all">{walletAddress}</p>
        </div>
      )}

      <button
        onClick={handleCreateVault}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded font-semibold text-white ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Creating Vault...' : 'Create Vault'}
      </button>

      {status && (
        <div className={`mt-4 p-3 rounded ${
          status.startsWith('✅') ? 'bg-green-100 text-green-800' :
          status.startsWith('ℹ️') ? 'bg-blue-100 text-blue-800' :
          status.startsWith('❌') ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p className="font-semibold mb-1">⚠️ Important:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Vaults are permanent and cannot be deleted</li>
          <li>You can only create one vault per wallet</li>
          <li>Requires a small amount of testnet XLM</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Component for managing issuer authorizations
 */
export function IssuerManagement() {
  const { authorizeIssuer, revokeIssuer } = useVault();
  const [issuerAddress, setIssuerAddress] = useState('');
  const [issuerName, setIssuerName] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authorizedIssuers, setAuthorizedIssuers] = useState<Array<{name: string, address: string}>>([]);

  // Authorize issuer
  const handleAuthorizeIssuer = async () => {
    try {
      setIsLoading(true);
      setStatus('Requesting authorization...');

      const walletAddress = await freighter.getPublicKey();

      // Confirm with user
      const confirmed = confirm(`
⚠️ ISSUER AUTHORIZATION

You are about to authorize:
${issuerName || 'Unnamed issuer'}
${issuerAddress}

This issuer will be able to:
- Issue credentials to your vault
- Add new verifiable credentials

Proceed with authorization?
      `);

      if (!confirmed) {
        setStatus('Authorization cancelled');
        setIsLoading(false);
        return;
      }

      setStatus('Signing transaction...');

      await authorizeIssuer({
        owner: walletAddress,
        issuer: issuerAddress,
        signTransaction: freighter.signTransaction
      });

      // Add to list
      setAuthorizedIssuers([
        ...authorizedIssuers,
        { name: issuerName || 'Unnamed', address: issuerAddress }
      ]);

      setStatus(`✅ Issuer authorized successfully!`);
      setIssuerAddress('');
      setIssuerName('');
    } catch (error: any) {
      if (error.message?.includes('User declined')) {
        setStatus('❌ Authorization cancelled');
      } else {
        setStatus(`❌ Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke issuer
  const handleRevokeIssuer = async (address: string, name: string) => {
    try {
      setIsLoading(true);

      // Strong confirmation for revocation
      const confirmText = prompt(`
⚠️ CRITICAL: ISSUER REVOCATION

WARNING: This will affect credential validity!

You are about to revoke authorization for:
${name}
${address}

This will:
- Prevent future credentials from this issuer
- Mark ALL existing credentials from this issuer as INVALID
- Require a blockchain transaction

This action is permanent and affects ALL credentials from this issuer.

Type "REVOKE" to confirm:
      `);

      if (confirmText !== 'REVOKE') {
        setStatus('Revocation cancelled');
        setIsLoading(false);
        return;
      }

      setStatus('Revoking issuer...');

      const walletAddress = await freighter.getPublicKey();

      await revokeIssuer({
        owner: walletAddress,
        issuer: address,
        signTransaction: freighter.signTransaction
      });

      // Remove from list
      setAuthorizedIssuers(
        authorizedIssuers.filter(issuer => issuer.address !== address)
      );

      setStatus(`✅ Issuer revoked. All credentials from this issuer are now invalid.`);
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Issuer Management</h2>

      {/* Authorize new issuer */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="font-bold mb-3">Authorize New Issuer</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Issuer Name (optional)
            </label>
            <input
              type="text"
              value={issuerName}
              onChange={(e) => setIssuerName(e.target.value)}
              placeholder="e.g., Example University"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Issuer Wallet Address
            </label>
            <input
              type="text"
              value={issuerAddress}
              onChange={(e) => setIssuerAddress(e.target.value)}
              placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className="w-full px-3 py-2 border rounded font-mono text-sm"
            />
          </div>

          <button
            onClick={handleAuthorizeIssuer}
            disabled={isLoading || !issuerAddress}
            className={`w-full py-2 px-4 rounded font-semibold text-white ${
              isLoading || !issuerAddress
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLoading ? 'Authorizing...' : 'Authorize Issuer'}
          </button>
        </div>
      </div>

      {status && (
        <div className={`mb-4 p-3 rounded ${
          status.startsWith('✅') ? 'bg-green-100 text-green-800' :
          status.startsWith('❌') ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </div>
      )}

      {/* Authorized issuers list */}
      <div>
        <h3 className="font-bold mb-3">Authorized Issuers</h3>

        {authorizedIssuers.length === 0 ? (
          <p className="text-gray-500 text-sm">No issuers authorized yet</p>
        ) : (
          <div className="space-y-2">
            {authorizedIssuers.map((issuer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex-1">
                  <p className="font-semibold">{issuer.name}</p>
                  <p className="text-xs font-mono text-gray-600">{issuer.address}</p>
                </div>
                <button
                  onClick={() => handleRevokeIssuer(issuer.address, issuer.name)}
                  disabled={isLoading}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Warning:</strong> Revoking an issuer will invalidate ALL credentials
          issued by that issuer. This action is permanent and cannot be undone.
        </p>
      </div>
    </div>
  );
}

/**
 * Complete vault setup wizard
 */
export function VaultSetupWizard() {
  const { createVault, authorizeIssuer } = useVault();
  const [step, setStep] = useState(1);
  const [walletAddress, setWalletAddress] = useState('');
  const [vaultCreated, setVaultCreated] = useState(false);
  const [status, setStatus] = useState('');

  const handleStep1 = async () => {
    try {
      const address = await freighter.getPublicKey();
      setWalletAddress(address);
      setStep(2);
    } catch (error) {
      setStatus('Please install Freighter wallet extension');
    }
  };

  const handleStep2 = async () => {
    try {
      setStatus('Creating vault...');

      await createVault({
        owner: walletAddress,
        ownerDid: `did:pkh:stellar:testnet:${walletAddress}`,
        signTransaction: freighter.signTransaction
      });

      setVaultCreated(true);
      setStep(3);
      setStatus('Vault created successfully!');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        setVaultCreated(true);
        setStep(3);
        setStatus('Vault already exists - proceeding to next step');
      } else {
        setStatus(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Vault Setup Wizard</h2>

      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className={`flex-1 text-center ${step >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            1
          </div>
          <p className="text-xs mt-1">Connect</p>
        </div>
        <div className="flex-1 border-t-2"></div>
        <div className={`flex-1 text-center ${step >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            2
          </div>
          <p className="text-xs mt-1">Create Vault</p>
        </div>
        <div className="flex-1 border-t-2"></div>
        <div className={`flex-1 text-center ${step >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            3
          </div>
          <p className="text-xs mt-1">Complete</p>
        </div>
      </div>

      {/* Step content */}
      <div className="mb-6">
        {step === 1 && (
          <div>
            <h3 className="font-bold mb-2">Step 1: Connect Wallet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Freighter wallet to get started. Make sure you're on the testnet network.
            </p>
            <button
              onClick={handleStep1}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
            >
              Connect Freighter
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-bold mb-2">Step 2: Create Vault</h3>
            <p className="text-sm text-gray-600 mb-2">
              Create your credential vault. This will store all your verifiable credentials securely on-chain.
            </p>
            <div className="mb-4 p-3 bg-gray-100 rounded">
              <p className="text-xs text-gray-600">Wallet:</p>
              <p className="text-xs font-mono break-all">{walletAddress}</p>
            </div>
            <button
              onClick={handleStep2}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
            >
              Create Vault
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-bold mb-2">✅ Setup Complete!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your vault is ready. You can now issue and receive verifiable credentials.
            </p>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded">
                Issue Your First Credential
              </button>
              <button className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded">
                View Documentation
              </button>
            </div>
          </div>
        )}
      </div>

      {status && (
        <div className={`p-3 rounded text-sm ${
          status.includes('success') || status.includes('exists') ? 'bg-green-100 text-green-800' :
          status.includes('Error') ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}
