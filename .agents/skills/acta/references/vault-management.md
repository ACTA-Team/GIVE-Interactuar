# Vault Management Reference

Complete guide to creating and managing credential vaults on acta.build.

---

## What is a Vault?

A **vault** is an encrypted, on-chain storage container for verifiable credentials on the Stellar blockchain.

### Key Characteristics

- **One vault per wallet address** - Each Stellar wallet can have exactly one vault
- **Owner-controlled** - Only the vault owner can authorize issuers and manage access
- **Encrypted on-chain** - Stored on Stellar/Soroban smart contracts
- **Permanent** - Once created, vaults cannot be deleted
- **Non-custodial** - Owner controls private keys via wallet (Freighter)

### Vault Contents

Each vault stores:
- **Credentials (VCs)** - W3C Verifiable Credentials 2.0
- **Authorized Issuers** - List of wallet addresses allowed to issue credentials
- **Owner DID** - Decentralized identifier of vault owner
- **Metadata** - Vault creation timestamp, contract address, etc.

---

## Vault Creation

### Prerequisites

- [ ] Freighter wallet installed and configured
- [ ] Wallet funded with testnet XLM (for testnet) or real XLM (for mainnet)
- [ ] API key configured in environment
- [ ] Wallet connected and unlocked

### Create Vault (React SDK)

```typescript
import { useVault } from '@acta-team/acta-sdk';
import freighter from '@stellar/freighter-api';

function CreateVaultComponent() {
  const { createVault } = useVault();
  const [status, setStatus] = useState('');

  const handleCreateVault = async () => {
    try {
      setStatus('Creating vault...');

      // Get wallet address
      const walletAddress = await freighter.getPublicKey();

      // Create owner DID
      const ownerDid = `did:pkh:stellar:testnet:${walletAddress}`;

      // Create vault
      await createVault({
        owner: walletAddress,
        ownerDid: ownerDid,
        signTransaction: freighter.signTransaction
      });

      setStatus('✅ Vault created successfully!');
    } catch (error) {
      if (error.message.includes('already exists')) {
        setStatus('ℹ️ Vault already exists for this wallet');
      } else {
        setStatus(`❌ Error: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <button onClick={handleCreateVault}>Create Vault</button>
      <p>{status}</p>
    </div>
  );
}
```

### Vault Creation Parameters

```typescript
interface CreateVaultParams {
  owner: string;       // Stellar wallet address (e.g., 'GXXXXXXXX...')
  ownerDid: string;    // DID format: 'did:pkh:stellar:testnet:GXXXXXXXX...'
  signTransaction: (xdr: string, options?: any) => Promise<string>;
}
```

### Network-Specific DIDs

**Testnet:**
```typescript
const ownerDid = `did:pkh:stellar:testnet:${walletAddress}`;
```

**Mainnet:**
```typescript
const ownerDid = `did:pkh:stellar:mainnet:${walletAddress}`;
```

**⚠️ Important:** DID network must match your API key's network (testnet vs mainnet).

---

## Vault Lifecycle

### 1. Pre-Creation State
- User has wallet but no vault
- Cannot receive credentials yet
- Must create vault before credential operations

### 2. Vault Creation
- User signs transaction with Freighter
- Soroban smart contract deployed
- Owner DID registered
- Vault address recorded

### 3. Active State
- Vault exists and is operational
- Owner can authorize/revoke issuers
- Credentials can be issued and verified
- Vault is permanent

### 4. No Deletion
- Vaults cannot be deleted or destroyed
- Data remains on blockchain permanently
- Owner retains control indefinitely

---

## Issuer Authorization Management

Vault owners control which wallet addresses can issue credentials to their vault.

### Authorization Model

**Who needs authorization:**
- External issuers (universities, employers, certification bodies)
- Any wallet address ≠ vault owner

**Who doesn't need authorization:**
- Vault owner (automatically authorized for own vault)
- Read-only verifiers (no authorization needed)

---

### Authorize Issuer

Grant permission for an issuer to add credentials to your vault.

```typescript
import { useVault } from '@acta-team/acta-sdk';

const { authorizeIssuer } = useVault();

// Example: Authorize university to issue degrees
const universityWallet = 'GUNIVERSITY123...';

await authorizeIssuer({
  owner: await freighter.getPublicKey(),
  issuer: universityWallet,
  signTransaction: freighter.signTransaction
});
```

### Authorization Parameters

```typescript
interface AuthorizeIssuerParams {
  owner: string;              // Your wallet address (vault owner)
  issuer: string;             // Wallet address to authorize
  signTransaction: Function;  // Freighter signing function
}
```

### Authorization Use Cases

**Educational Institution:**
```typescript
// Student authorizes university to issue degree credentials
await authorizeIssuer({
  owner: studentWallet,
  issuer: universityWallet,
  signTransaction: freighter.signTransaction
});

// University can now issue credentials to student's vault
await issue({
  owner: studentWallet,
  vcId: 'vc:education:degree:12345',
  vcData: degreeCredentialJson,
  issuer: universityWallet,
  issuerDid: `did:pkh:stellar:testnet:${universityWallet}`,
  signTransaction: universityFreighter.signTransaction
});
```

**Employer:**
```typescript
// Employee authorizes company to issue employment credentials
await authorizeIssuer({
  owner: employeeWallet,
  issuer: companyWallet,
  signTransaction: freighter.signTransaction
});
```

**KYC Provider:**
```typescript
// User authorizes KYC service to issue identity credentials
await authorizeIssuer({
  owner: userWallet,
  issuer: kycProviderWallet,
  signTransaction: freighter.signTransaction
});
```

---

### Revoke Issuer

Remove an issuer's permission to add credentials.

```typescript
import { useVault } from '@acta-team/acta-sdk';

const { revokeIssuer } = useVault();

// Example: Revoke university's authorization
await revokeIssuer({
  owner: await freighter.getPublicKey(),
  issuer: universityWallet,
  signTransaction: freighter.signTransaction
});
```

### Revocation Parameters

```typescript
interface RevokeIssuerParams {
  owner: string;              // Your wallet address (vault owner)
  issuer: string;             // Wallet address to revoke
  signTransaction: Function;  // Freighter signing function
}
```

### Effects of Revocation

**Immediate effects:**
✅ Issuer can no longer issue new credentials
✅ All existing credentials from this issuer become invalid
✅ `verifyVc()` returns `isValid: false` for affected credentials

**What is NOT affected:**
❌ Credentials are not deleted (immutable blockchain)
❌ Credential data still exists on-chain
❌ Other issuers' credentials are unaffected

### When to Revoke

**Security incidents:**
- Issuer's private key compromised
- Issuer account hacked
- Fraudulent credential issuance detected

**Trust loss:**
- University loses accreditation
- Company commits fraud
- Certification body loses credibility

**Relationship termination:**
- No longer working for employer
- Graduated from educational institution
- Service contract ended

**Example: Security Breach**
```typescript
// University reports security breach
console.log('⚠️ University XYZ reported key compromise');

// Immediately revoke authorization
await revokeIssuer({
  owner: studentWallet,
  issuer: universityWallet,
  signTransaction: freighter.signTransaction
});

console.log('✅ Authorization revoked. All credentials now invalid.');
```

---

## Querying Vaults

### Verify Credentials (Read-Only)

Anyone can verify credentials if they know the vault owner and credential ID.

```typescript
import { useVaultRead } from '@acta-team/acta-sdk';

const { verifyVc } = useVaultRead();

// Verify a credential
const result = await verifyVc({
  owner: 'GSTUDENT123...',
  vcId: 'vc:education:degree:12345'
});

if (result.isValid) {
  const credential = JSON.parse(result.vcData);
  console.log('Degree:', credential.credentialSubject.degree);
  console.log('University:', credential.credentialSubject.university);
}
```

**No wallet signature required** - verification is read-only.

### Query Parameters

```typescript
interface VerifyVcParams {
  owner: string;    // Vault owner's wallet address
  vcId: string;     // Credential ID to verify
}
```

### Verification Returns

```typescript
interface VerifyVcResult {
  isValid: boolean;  // true if credential is valid
  vcData: string;    // JSON string of credential (if valid)
}
```

---

## Vault Security

### Access Control

**Write Operations (require signature):**
- Create vault → Owner only
- Authorize issuer → Owner only
- Revoke issuer → Owner only
- Issue credential → Authorized issuer only

**Read Operations (no signature required):**
- Verify credential → Anyone
- Query vault → Anyone

### Private Key Security

**Owner's private key controls:**
- Vault creation
- Issuer authorization
- Issuer revocation
- All vault management operations

**Security best practices:**
- 🔐 Never share private keys or seed phrases
- 🔐 Use hardware wallet for mainnet (Ledger with Freighter)
- 🔐 Use testnet for development and testing
- 🔐 Keep backup of seed phrase in secure location
- 🔐 Never store private keys in code or environment files

**What acta.build CANNOT do:**
- ❌ Access your private keys
- ❌ Sign transactions on your behalf
- ❌ Control your vault without your signature
- ❌ Steal or modify your credentials

---

## Multi-Vault Scenarios

### One User, Multiple Networks

A user can have:
- One vault on **testnet** (for testing)
- One vault on **mainnet** (for production)

**Same wallet address, different vaults:**
```typescript
// Testnet vault
await createVault({
  owner: walletAddress,
  ownerDid: `did:pkh:stellar:testnet:${walletAddress}`,
  signTransaction: freighter.signTransaction
});

// Mainnet vault (separate API key)
await createVault({
  owner: walletAddress,
  ownerDid: `did:pkh:stellar:mainnet:${walletAddress}`,
  signTransaction: freighter.signTransaction
});
```

**Important:** Use correct API key for each network.

### Multiple Users, Multiple Vaults

Each user has their own vault:

```typescript
// Alice's vault
await createVault({
  owner: aliceWallet,
  ownerDid: `did:pkh:stellar:testnet:${aliceWallet}`,
  signTransaction: aliceFreighter.signTransaction
});

// Bob's vault
await createVault({
  owner: bobWallet,
  ownerDid: `did:pkh:stellar:testnet:${bobWallet}`,
  signTransaction: bobFreighter.signTransaction
});
```

Vaults are completely independent - no shared data.

---

## Vault Management Best Practices

### 1. Testnet First

✅ **Always create testnet vault first:**
```typescript
// Development
const ownerDid = `did:pkh:stellar:testnet:${walletAddress}`;
```

❌ **Don't start with mainnet:**
```typescript
// WAIT until thoroughly tested!
const ownerDid = `did:pkh:stellar:mainnet:${walletAddress}`;
```

### 2. Document Authorized Issuers

Keep a record of who you've authorized:

```typescript
// Maintain a list
const authorizedIssuers = [
  { name: 'Example University', wallet: 'GUNIV123...', date: '2024-01-15' },
  { name: 'Acme Corp', wallet: 'GACME456...', date: '2024-02-20' }
];

// Add to list when authorizing
await authorizeIssuer({ owner, issuer: newIssuer, signTransaction });
authorizedIssuers.push({
  name: 'New Issuer',
  wallet: newIssuer,
  date: new Date().toISOString()
});
```

### 3. Periodic Issuer Review

Review authorized issuers regularly:

```typescript
// Quarterly review
const reviewAuthorizedIssuers = () => {
  authorizedIssuers.forEach(issuer => {
    console.log(`${issuer.name} - ${issuer.wallet}`);
    // Decide if authorization should continue
  });
};
```

### 4. Immediate Revocation on Compromise

Don't delay if issuer is compromised:

```typescript
// As soon as compromise detected
await revokeIssuer({
  owner,
  issuer: compromisedIssuerWallet,
  signTransaction
});
```

### 5. Backup Wallet Access

Ensure you can always access your wallet:

- ✅ Store seed phrase securely offline
- ✅ Test recovery process
- ✅ Consider multi-signature for high-value vaults (future)
- ✅ Document vault creation date and network

---

## Error Handling

### Vault Already Exists

```typescript
try {
  await createVault({ owner, ownerDid, signTransaction });
} catch (error) {
  if (error.message.includes('already exists')) {
    console.log('ℹ️ Vault already created. Skipping creation.');
    // Continue with next step
  } else {
    throw error;
  }
}
```

### Insufficient Balance

```
Error: Account does not have sufficient balance
```

**Solution:**
- Fund wallet with testnet XLM: https://laboratory.stellar.org/#account-creator?network=test
- For mainnet: Add XLM to wallet

### Wrong Network

```
Error: Network mismatch
```

**Solution:**
- Check Freighter is on correct network (testnet/mainnet)
- Verify API key matches network
- Ensure DID has correct network identifier

### Authorization Errors

```
Error: Issuer GXXXXX is not authorized
```

**Solution:**
```typescript
// Authorize issuer first
await authorizeIssuer({ owner, issuer, signTransaction });

// Then issue credential
await issue({ owner, vcId, vcData, issuer, issuerDid, signTransaction });
```

---

## Testing Checklist

### Vault Creation
- [ ] Create vault on testnet successfully
- [ ] Attempt to create vault twice (should fail gracefully)
- [ ] Create vault with insufficient balance (should fail with clear error)
- [ ] Verify vault exists after creation

### Issuer Authorization
- [ ] Authorize external issuer successfully
- [ ] Issue credential from authorized issuer
- [ ] Attempt to issue from unauthorized issuer (should fail)
- [ ] Authorize same issuer twice (should succeed or be idempotent)

### Issuer Revocation
- [ ] Revoke authorized issuer successfully
- [ ] Verify credentials become invalid after revocation
- [ ] Attempt to issue after revocation (should fail)
- [ ] Re-authorize previously revoked issuer

### Verification
- [ ] Verify valid credential returns isValid: true
- [ ] Verify credential from revoked issuer returns isValid: false
- [ ] Verify non-existent credential returns isValid: false
- [ ] Verify credential without wallet signature (read-only)

---

## Advanced Patterns

### Multi-Issuer Workflow

User receives credentials from multiple sources:

```typescript
// Phase 1: Create vault
await createVault({ owner, ownerDid, signTransaction });

// Phase 2: Authorize multiple issuers
await authorizeIssuer({ owner, issuer: universityWallet, signTransaction });
await authorizeIssuer({ owner, issuer: employerWallet, signTransaction });
await authorizeIssuer({ owner, issuer: kycProviderWallet, signTransaction });

// Phase 3: Each issuer can now issue credentials independently
// University issues degree
// Employer issues employment verification
// KYC provider issues identity credential

// All credentials coexist in the same vault
```

### Credential Portfolio

Vault as a complete credential portfolio:

```
Vault: GUSER123...
├── Education
│   ├── vc:education:degree:bachelor-cs-2024
│   ├── vc:education:certificate:aws-certified-2023
│   └── vc:education:bootcamp:fullstack-2022
├── Employment
│   ├── vc:employment:current:acme-corp
│   └── vc:employment:previous:startup-xyz
└── Identity
    ├── vc:identity:kyc:level-2
    └── vc:identity:age-verification
```

### Issuer Rotation

Replace compromised issuer with new one:

```typescript
// Step 1: Revoke old issuer
await revokeIssuer({ owner, issuer: oldUniversityWallet, signTransaction });

// Step 2: Authorize new issuer
await authorizeIssuer({ owner, issuer: newUniversityWallet, signTransaction });

// Step 3: Request credential re-issuance from new issuer
// (Application-specific logic)
```

---

## Future Enhancements

### Coming Soon

- **Bulk operations** - Authorize/revoke multiple issuers at once
- **Issuer metadata** - Store issuer names and descriptions
- **Credential queries** - List all credentials in a vault
- **Credential search** - Filter credentials by type
- **Access control lists** - Fine-grained permissions
- **Multi-signature vaults** - Shared vault control

See roadmap at https://github.com/ACTA-Team for updates.
