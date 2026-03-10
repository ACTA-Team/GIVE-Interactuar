# acta.build Platform Overview

## What is acta.build?

acta.build is a **Verifiable Credentials Infrastructure** built on the Stellar blockchain, providing W3C Verifiable Credentials 2.0 compliant credential issuance, storage, and verification.

### Key Features

- **W3C VC 2.0 Compliance** - Full support for W3C Verifiable Credentials 2.0 standard
- **Stellar/Soroban Integration** - On-chain credential storage using Soroban smart contracts
- **Non-Custodial Architecture** - Users control their private keys via wallet integration
- **Encrypted Vaults** - Secure on-chain storage for credentials
- **Decentralized Identifiers (DIDs)** - PKH-based DIDs for identity representation
- **Issuer Authorization** - Granular control over who can issue credentials

---

## Architecture

### Core Components

1. **Credentials (VCs)**
   - W3C Verifiable Credentials 2.0 format
   - JSON-LD based data structure
   - Cryptographically signed by issuers
   - Stored permanently on Stellar blockchain

2. **Vaults**
   - User-owned encrypted storage containers
   - One vault per wallet address
   - Stored on Stellar/Soroban smart contracts
   - Requires wallet signature for operations

3. **DIDs (Decentralized Identifiers)**
   - Format: `did:pkh:stellar:testnet:<wallet-address>`
   - PKH (Public Key Hash) method
   - Network-specific (testnet vs mainnet)
   - Represents credential subjects and issuers

4. **Issuers**
   - Entities authorized to issue credentials to vaults
   - Identified by Stellar wallet address
   - Must be explicitly authorized by vault owner
   - Can be revoked at any time

---

## Network Configuration

### Testnet (Development)
- **Use for:** Development, testing, experimentation
- **Cost:** Free (testnet XLM has no value)
- **API Key:** `ACTA_API_KEY_TESTNET`
- **Freighter Mode:** Testnet
- **DID Format:** `did:pkh:stellar:testnet:<address>`

### Mainnet (Production)
- **Use for:** Production deployments only
- **Cost:** Requires real XLM for transactions
- **API Key:** `ACTA_API_KEY_MAINNET`
- **Freighter Mode:** Mainnet
- **DID Format:** `did:pkh:stellar:mainnet:<address>`

**⚠️ ALWAYS start with testnet for development!**

---

## API Architecture

### Configuration Endpoint

The acta.build API provides automatic RPC URL discovery:

```
GET https://api.acta.build/config
Authorization: Bearer <API_KEY>
```

**Response:**
```json
{
  "network": "testnet",
  "rpcUrl": "https://soroban-testnet.stellar.org",
  "contractAddress": "...",
  "passphrase": "Test SDF Network ; September 2015"
}
```

**Why this matters:** The SDK automatically fetches RPC URLs, so you don't need to hardcode Stellar endpoints.

---

## Credential Lifecycle

### 1. Vault Creation
- User creates vault with their wallet address
- Vault is deployed as Soroban smart contract
- Owner DID is registered
- Vault is permanent once created

### 2. Issuer Authorization
- Vault owner authorizes trusted issuers
- Issuer can now write credentials to vault
- Authorization can be revoked later

### 3. Credential Issuance
- Issuer creates W3C VC 2.0 credential
- Credential is signed and stored in vault
- Blockchain transaction records issuance
- Credential is immutable once issued

### 4. Credential Verification
- Verifier queries vault for credential
- Checks issuer authorization status
- Validates cryptographic signatures
- Returns credential data if valid

### 5. Issuer Revocation
- Vault owner revokes issuer authorization
- All credentials from that issuer become invalid
- Does not delete credentials (immutable)
- Affects verification results

---

## Security Model

### Non-Custodial Architecture

**Users control their private keys:**
- Private keys never leave the wallet (Freighter)
- acta.build cannot access user keys
- All transactions require user signature
- No custodial risk

**API Keys are NOT private keys:**
- API keys are for acta.build service access
- They do NOT control user funds or credentials
- Separate from blockchain private keys

### Trust Model

**Vault Owner (User):**
- Full control over their vault
- Chooses which issuers to trust
- Can revoke issuer access
- Controls private keys via wallet

**Issuer:**
- Authorized by vault owner
- Can issue credentials to authorized vaults
- Credentials are cryptographically signed
- Reputation-based trust

**Verifier:**
- Reads credentials from vaults
- Checks issuer authorization
- Validates signatures
- No write access

---

## Data Privacy

### What's On-Chain
- Credential data (vcData JSON)
- Vault ownership
- Issuer authorizations
- Credential IDs

### What's Encrypted
- Vault data is encrypted on-chain
- Only accessible via proper authorization

### Privacy Considerations
- Credentials are readable by anyone who knows the vault address and credential ID
- Don't store sensitive personal data without encryption
- Consider zero-knowledge proofs for privacy-sensitive use cases
- Use selective disclosure patterns

---

## Supported Standards

### W3C Verifiable Credentials 2.0

**Required Fields:**
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential"],
  "credentialSubject": {
    "id": "did:pkh:stellar:testnet:..."
  }
}
```

**Custom Credential Types:**
- Extend base `VerifiableCredential` type
- Add domain-specific types (e.g., `EducationCredential`)
- Include custom fields in `credentialSubject`

---

## Integration Patterns

### React SDK
- Hooks-based API (`useCredential`, `useVault`, `useVaultRead`)
- Automatic Freighter wallet integration
- TypeScript support
- React 16.8+ required

### REST API
- Direct API calls for backend integrations
- Requires manual transaction signing
- Suitable for Node.js, Python, etc.
- See API documentation for endpoints

---

## Use Cases

### Education
- Diplomas and degrees
- Course completion certificates
- Skill certifications
- Academic transcripts

### Employment
- Employment verification
- Job titles and roles
- Work history
- Reference letters

### Identity
- KYC verification
- Age verification
- Citizenship proof
- Professional licenses

### Custom
- Event attendance
- Membership credentials
- Achievement badges
- Custom verifications

---

## Resources

- **Website:** https://acta.build
- **Documentation:** https://docs.acta.build
- **Live dApp:** https://dapp.acta.build
- **GitHub:** https://github.com/ACTA-Team
- **Discord:** https://discord.gg/DsUSE3aMDZ
