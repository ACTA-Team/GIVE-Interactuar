# React SDK Complete Reference

## Installation

```bash
npm install @acta-team/acta-sdk
```

## Provider Setup

### ActaProvider

Wrap your application with `ActaProvider` to enable SDK hooks.

```tsx
import { ActaProvider } from '@acta-team/acta-sdk';

function App() {
  return (
    <ActaProvider apiKey={process.env.ACTA_API_KEY_TESTNET}>
      {/* Your app components */}
    </ActaProvider>
  );
}

export default App;
```

**Props:**
- `apiKey` (string, required) - Your acta.build API key from https://dapp.acta.build
- `children` (ReactNode, required) - Your application components

**Environment Variables:**
```env
# .env.local
ACTA_API_KEY_TESTNET=your_testnet_api_key_here
ACTA_API_KEY_MAINNET=your_mainnet_api_key_here
```

**⚠️ IMPORTANT:** Always add `.env.local` to `.gitignore`

---

## useCredential Hook

Hook for credential issuance operations.

### Import

```tsx
import { useCredential } from '@acta-team/acta-sdk';
```

### Usage

```tsx
const { issue } = useCredential();
```

### issue() Method

Issue a new verifiable credential to a vault.

**Function Signature:**
```tsx
async function issue(params: IssueCredentialParams): Promise<void>
```

**Parameters:**
```typescript
interface IssueCredentialParams {
  owner: string;              // Wallet address of credential holder
  vcId: string;               // Unique credential ID (e.g., 'vc:education:degree:12345')
  vcData: string;             // JSON string of W3C VC 2.0 credential
  issuer: string;             // Wallet address of credential issuer
  issuerDid: string;          // DID of issuer (e.g., 'did:pkh:stellar:testnet:G...')
  signTransaction: (xdr: string, options?: any) => Promise<string>;  // Freighter signing function
}
```

**Example:**
```tsx
import { useCredential } from '@acta-team/acta-sdk';

function IssueCredential() {
  const { issue } = useCredential();

  const handleIssue = async () => {
    const walletAddress = await freighter.getPublicKey();
    const uniqueId = Date.now().toString();

    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'EducationCredential'],
      credentialSubject: {
        id: `did:pkh:stellar:testnet:${walletAddress}`,
        degree: 'Bachelor of Science',
        university: 'Example University'
      }
    };

    await issue({
      owner: walletAddress,
      vcId: `vc:education:degree:${uniqueId}`,
      vcData: JSON.stringify(credential),
      issuer: walletAddress,
      issuerDid: `did:pkh:stellar:testnet:${walletAddress}`,
      signTransaction: freighter.signTransaction
    });
  };

  return <button onClick={handleIssue}>Issue Credential</button>;
}
```

**Returns:** Promise that resolves when credential is issued

**Throws:** Error if issuance fails

---

## useVault Hook

Hook for vault management operations.

### Import

```tsx
import { useVault } from '@acta-team/acta-sdk';
```

### Usage

```tsx
const { createVault, authorizeIssuer, revokeIssuer } = useVault();
```

---

### createVault() Method

Create a new credential vault for a user.

**Function Signature:**
```tsx
async function createVault(params: CreateVaultParams): Promise<void>
```

**Parameters:**
```typescript
interface CreateVaultParams {
  owner: string;              // Wallet address of vault owner
  ownerDid: string;           // DID of owner (e.g., 'did:pkh:stellar:testnet:G...')
  signTransaction: (xdr: string, options?: any) => Promise<string>;  // Freighter signing function
}
```

**Example:**
```tsx
import { useVault } from '@acta-team/acta-sdk';

function CreateVault() {
  const { createVault } = useVault();

  const handleCreate = async () => {
    const walletAddress = await freighter.getPublicKey();

    await createVault({
      owner: walletAddress,
      ownerDid: `did:pkh:stellar:testnet:${walletAddress}`,
      signTransaction: freighter.signTransaction
    });
  };

  return <button onClick={handleCreate}>Create Vault</button>;
}
```

**Returns:** Promise that resolves when vault is created

**Throws:** Error if vault creation fails or vault already exists

**⚠️ Note:** Each wallet address can have only one vault. Creating a vault is permanent.

---

### authorizeIssuer() Method

Grant an issuer permission to add credentials to your vault.

**Function Signature:**
```tsx
async function authorizeIssuer(params: AuthorizeIssuerParams): Promise<void>
```

**Parameters:**
```typescript
interface AuthorizeIssuerParams {
  owner: string;              // Wallet address of vault owner
  issuer: string;             // Wallet address of issuer to authorize
  signTransaction: (xdr: string, options?: any) => Promise<string>;  // Freighter signing function
}
```

**Example:**
```tsx
import { useVault } from '@acta-team/acta-sdk';

function AuthorizeIssuer() {
  const { authorizeIssuer } = useVault();
  const [issuerAddress, setIssuerAddress] = useState('');

  const handleAuthorize = async () => {
    const walletAddress = await freighter.getPublicKey();

    await authorizeIssuer({
      owner: walletAddress,
      issuer: issuerAddress,
      signTransaction: freighter.signTransaction
    });
  };

  return (
    <div>
      <input
        value={issuerAddress}
        onChange={(e) => setIssuerAddress(e.target.value)}
        placeholder="Issuer wallet address"
      />
      <button onClick={handleAuthorize}>Authorize</button>
    </div>
  );
}
```

**Returns:** Promise that resolves when issuer is authorized

**Throws:** Error if authorization fails

---

### revokeIssuer() Method

Revoke an issuer's permission to add credentials to your vault.

**Function Signature:**
```tsx
async function revokeIssuer(params: RevokeIssuerParams): Promise<void>
```

**Parameters:**
```typescript
interface RevokeIssuerParams {
  owner: string;              // Wallet address of vault owner
  issuer: string;             // Wallet address of issuer to revoke
  signTransaction: (xdr: string, options?: any) => Promise<string>;  // Freighter signing function
}
```

**Example:**
```tsx
import { useVault } from '@acta-team/acta-sdk';

function RevokeIssuer() {
  const { revokeIssuer } = useVault();
  const [issuerAddress, setIssuerAddress] = useState('');

  const handleRevoke = async () => {
    const walletAddress = await freighter.getPublicKey();

    await revokeIssuer({
      owner: walletAddress,
      issuer: issuerAddress,
      signTransaction: freighter.signTransaction
    });
  };

  return (
    <div>
      <input
        value={issuerAddress}
        onChange={(e) => setIssuerAddress(e.target.value)}
        placeholder="Issuer wallet address"
      />
      <button onClick={handleRevoke}>Revoke</button>
    </div>
  );
}
```

**Returns:** Promise that resolves when issuer is revoked

**Throws:** Error if revocation fails

**⚠️ Warning:** Revoking an issuer affects ALL credentials from that issuer. They will no longer be considered valid.

---

## useVaultRead Hook

Hook for reading and verifying credentials.

### Import

```tsx
import { useVaultRead } from '@acta-team/acta-sdk';
```

### Usage

```tsx
const { verifyVc } = useVaultRead();
```

### verifyVc() Method

Verify a credential's validity and retrieve its data.

**Function Signature:**
```tsx
async function verifyVc(params: VerifyVcParams): Promise<VerifyVcResult>
```

**Parameters:**
```typescript
interface VerifyVcParams {
  owner: string;              // Wallet address of credential holder
  vcId: string;               // Credential ID to verify
}
```

**Returns:**
```typescript
interface VerifyVcResult {
  isValid: boolean;           // Whether credential is valid
  vcData: string;             // JSON string of credential data (if valid)
}
```

**Example:**
```tsx
import { useVaultRead } from '@acta-team/acta-sdk';

function VerifyCredential() {
  const { verifyVc } = useVaultRead();
  const [vcId, setVcId] = useState('');
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    const walletAddress = await freighter.getPublicKey();

    const verification = await verifyVc({
      owner: walletAddress,
      vcId: vcId
    });

    if (verification.isValid) {
      const credential = JSON.parse(verification.vcData);
      setResult({
        valid: true,
        credential
      });
    } else {
      setResult({
        valid: false,
        error: 'Credential is not valid'
      });
    }
  };

  return (
    <div>
      <input
        value={vcId}
        onChange={(e) => setVcId(e.target.value)}
        placeholder="Credential ID"
      />
      <button onClick={handleVerify}>Verify</button>

      {result && (
        <div>
          {result.valid ? (
            <pre>{JSON.stringify(result.credential, null, 2)}</pre>
          ) : (
            <p>{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

**Throws:** Error if verification request fails (not the same as invalid credential)

**Verification Checks:**
- Credential exists in vault
- Issuer is currently authorized for the vault
- Cryptographic signatures are valid
- Credential has not been tampered with

---

## Freighter Wallet Integration

### Installation

```bash
# Install Freighter browser extension from:
# https://www.freighter.app/
```

### Configuration

1. Install Freighter extension
2. Create or import wallet
3. Switch to **Testnet** mode (for development)
4. Fund testnet account at https://laboratory.stellar.org/#account-creator?network=test

### Getting Public Key

```tsx
import freighter from '@stellar/freighter-api';

const publicKey = await freighter.getPublicKey();
```

### Signing Transactions

The `signTransaction` parameter in SDK methods expects Freighter's signing function:

```tsx
import freighter from '@stellar/freighter-api';

// Pass directly to SDK methods
await issue({
  // ... other params
  signTransaction: freighter.signTransaction
});
```

**Freighter will:**
- Show transaction details to user
- Request user approval
- Sign transaction with private key
- Return signed transaction XDR

**Security:** Private keys never leave the Freighter extension.

---

## Error Handling

### Common Errors

**"User denied transaction"**
- User rejected signing in Freighter
- Ask user to try again

**"Vault already exists"**
- User already has a vault
- Skip vault creation step

**"Issuer not authorized"**
- Issuer must be authorized first
- Use `authorizeIssuer()` before issuing

**"Invalid credential format"**
- vcData doesn't match W3C VC 2.0 schema
- Validate with `scripts/validate-credential.js`

**"Network error"**
- Check API key is correct
- Verify internet connection
- Ensure Freighter is on correct network (testnet/mainnet)

### Error Handling Pattern

```tsx
try {
  await issue({ /* params */ });
  console.log('✅ Credential issued successfully');
} catch (error) {
  if (error.message.includes('denied')) {
    console.log('User cancelled transaction');
  } else if (error.message.includes('authorized')) {
    console.log('Issuer needs authorization first');
  } else {
    console.error('Error:', error.message);
  }
}
```

---

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions.

### Import Types

```tsx
import type {
  IssueCredentialParams,
  CreateVaultParams,
  AuthorizeIssuerParams,
  RevokeIssuerParams,
  VerifyVcParams,
  VerifyVcResult
} from '@acta-team/acta-sdk';
```

### Example with Types

```tsx
import { useCredential } from '@acta-team/acta-sdk';
import type { IssueCredentialParams } from '@acta-team/acta-sdk';

function IssueCredential() {
  const { issue } = useCredential();

  const handleIssue = async (params: IssueCredentialParams) => {
    await issue(params);
  };

  return <button onClick={() => handleIssue({...})}>Issue</button>;
}
```

---

## Best Practices

### 1. Environment Variables
```tsx
// ✅ Good
const apiKey = process.env.ACTA_API_KEY_TESTNET;

// ❌ Bad
const apiKey = 'hardcoded-key-here';
```

### 2. Unique Credential IDs
```tsx
// ✅ Good
const vcId = `vc:education:degree:${Date.now()}-${Math.random()}`;

// ❌ Bad
const vcId = 'vc:education:degree:1';  // Not unique!
```

### 3. Error Handling
```tsx
// ✅ Good
try {
  await issue({ /* params */ });
} catch (error) {
  console.error('Issuance failed:', error);
  // Show user-friendly message
}

// ❌ Bad
await issue({ /* params */ });  // No error handling
```

### 4. Testnet First
```tsx
// ✅ Good
<ActaProvider apiKey={process.env.ACTA_API_KEY_TESTNET}>

// ❌ Bad (for development)
<ActaProvider apiKey={process.env.ACTA_API_KEY_MAINNET}>
```

### 5. Validate Credentials
```tsx
// ✅ Good
const credential = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  type: ['VerifiableCredential', 'EducationCredential'],
  credentialSubject: { id: 'did:pkh:stellar:testnet:...' }
};

// ❌ Bad
const credential = {
  type: 'education',  // Missing required fields!
  data: { ... }
};
```

---

## React Version Compatibility

- **Minimum:** React 16.8+ (hooks support)
- **Recommended:** React 18+
- **Next.js:** Compatible with Next.js 13+ (App Router and Pages Router)

---

## Complete Example Application

See `assets/examples/` for complete working examples:
- `react-issue-credential.tsx` - Full issuance flow
- `react-verify-credential.tsx` - Full verification flow
- `vault-setup.tsx` - Vault creation and issuer authorization
