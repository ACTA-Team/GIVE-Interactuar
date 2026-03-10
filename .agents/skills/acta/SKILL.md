---
name: acta
description: Guide developers through integrating acta.build's verifiable credentials infrastructure on Stellar blockchain. Focus on credential issuance and verification workflows using React SDK hooks (useCredential, useVault, useVaultRead) or REST API. Ensures security with mandatory confirmations for credential operations, key management best practices, and non-custodial vault setup. Use when working with W3C Verifiable Credentials 2.0, Stellar blockchain credentials, decentralized identity (DIDs), credential verification, or vault storage.
license: MIT
compatibility: Requires internet access for API calls. React SDK requires React 16.8+, Freighter wallet for testnet. Node.js 18+ for scripts.
metadata:
  author: acta-build
  version: "1.0.0"
  platform: stellar
  standards: W3C-VC-2.0
---

## CRITICAL SAFETY RULES

### Before Any Credential Operation:

1. **ALWAYS confirm the user controls the private keys**
   - acta.build is non-custodial - users must sign with their own wallet
   - Freighter wallet required for testnet operations
   - NEVER ask users to share private keys or seed phrases

2. **NEVER expose sensitive data in code**
   - API keys go in `.env.local` (add to `.gitignore`)
   - Use `ACTA_API_KEY_TESTNET` environment variable
   - No hardcoded keys in source files
   - No keys committed to version control

3. **ALWAYS verify credential immutability understanding**
   - Credentials on Stellar blockchain are permanent
   - Cannot be edited after issuance
   - Revocation is separate from deletion
   - Get explicit confirmation before issuing

4. **ALWAYS use testnet first**
   - Default to `ACTA_API_KEY_TESTNET` for development
   - Only use mainnet with explicit user confirmation
   - Freighter must be configured for testnet mode

### Mandatory Confirmations:

**Before Credential Issuance:**
```
⚠️  CREDENTIAL ISSUANCE CONFIRMATION

You are about to issue a verifiable credential that will be:
- Permanently recorded on Stellar blockchain
- Publicly verifiable by anyone
- Immutable once created
- Stored in the user's vault

Credential Type: [type]
Owner: [wallet address]
Issuer DID: [issuer DID]

Environment: [TESTNET/MAINNET]

Do you want to proceed? (yes/no)
```

**Before Credential Revocation:**
```
⚠️  CREDENTIAL REVOCATION CONFIRMATION

WARNING: This action affects credential validity.

Credential ID: [vcId]
Owner: [wallet address]
Action: Revoke issuer authorization

This will:
- Mark issuer as unauthorized for this vault
- Affect all credentials from this issuer
- Require blockchain transaction

Type 'revoke' to confirm: _____
```

**Before Vault Creation:**
```
ℹ️  VAULT INITIALIZATION

Creating a new credential vault:
- Owner: [wallet address]
- Owner DID: [DID]
- Network: [TESTNET/MAINNET]

The vault will:
- Store encrypted credentials on-chain
- Require wallet signature for operations
- Use Stellar/Soroban smart contracts

Proceed? (yes/no)
```

---

## 5-STEP CREDENTIAL INTEGRATION WORKFLOW

### Step 1: Environment Setup
**Goal:** Configure API access and wallet connection

**Actions:**
1. Obtain API key from https://dapp.acta.build
2. Create `.env.local` in project root:
   ```
   ACTA_API_KEY_TESTNET=your_api_key_here
   ```
3. Add `.env.local` to `.gitignore`
4. Install Freighter wallet browser extension
5. Configure Freighter for testnet mode
6. Verify setup with `scripts/test-api-connection.js`

**SDK Setup (React):**
```tsx
import { ActaProvider } from '@acta-team/acta-sdk';

function App() {
  return (
    <ActaProvider apiKey={process.env.ACTA_API_KEY_TESTNET}>
      {/* Your app */}
    </ActaProvider>
  );
}
```

**Reference:** See `references/react-sdk-reference.md` for complete setup

---

### Step 2: Vault Initialization
**Goal:** Create user-controlled credential vault

**When:** First-time setup for each user

**React SDK:**
```tsx
import { useVault } from '@acta-team/acta-sdk';

const { createVault } = useVault();

await createVault({
  owner: walletAddress,
  ownerDid: 'did:pkh:stellar:testnet:' + walletAddress,
  signTransaction: freighterSignTransaction
});
```

**Safety Checks:**
- [ ] Confirm user controls the wallet address
- [ ] Verify Freighter is connected and unlocked
- [ ] Check network is testnet (for development)
- [ ] User understands vault is permanent

**Reference:** See `references/vault-management.md` for details

---

### Step 3: Credential Issuance
**Goal:** Issue W3C Verifiable Credential and store in vault

**When:** User has earned/received a credential

**React SDK:**
```tsx
import { useCredential } from '@acta-team/acta-sdk';

const { issue } = useCredential();

await issue({
  owner: walletAddress,
  vcId: 'vc:education:degree:' + uniqueId,
  vcData: JSON.stringify({
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential', 'EducationCredential'],
    credentialSubject: {
      id: 'did:pkh:stellar:testnet:' + walletAddress,
      degree: 'Bachelor of Science',
      major: 'Computer Science',
      university: 'Example University',
      graduationDate: '2024-05-15'
    }
  }),
  issuer: issuerWalletAddress,
  issuerDid: 'did:pkh:stellar:testnet:' + issuerWalletAddress,
  signTransaction: freighterSignTransaction
});
```

**Mandatory Confirmation:** Show credential details and get explicit approval

**Safety Checks:**
- [ ] Validate vcData against W3C VC 2.0 schema
- [ ] Confirm vcId is unique
- [ ] Verify issuer has authority to issue this credential type
- [ ] User approves credential content
- [ ] Testnet confirmed for development

**Reference:** See `references/credential-lifecycle.md` for complete workflows

---

### Step 4: Credential Verification
**Goal:** Verify credential authenticity and validity

**When:** Receiving credential from another user

**React SDK:**
```tsx
import { useVaultRead } from '@acta-team/acta-sdk';

const { verifyVc } = useVaultRead();

const verification = await verifyVc({
  owner: credentialHolderAddress,
  vcId: 'vc:education:degree:12345'
});

// Check verification result
if (verification.isValid) {
  console.log('Credential is valid');
  // Parse vcData to access credential claims
  const credential = JSON.parse(verification.vcData);
}
```

**Verification Checks:**
- [ ] Credential exists in vault
- [ ] Issuer is authorized for the vault
- [ ] Credential has not been revoked
- [ ] Signature is cryptographically valid
- [ ] Schema matches expected format

**Reference:** See `references/credential-lifecycle.md` section on verification

---

### Step 5: Issuer Authorization Management
**Goal:** Control which issuers can add credentials to vault

**When:** Setting up trusted issuers or revoking access

**Authorize Issuer:**
```tsx
const { authorizeIssuer } = useVault();

await authorizeIssuer({
  owner: walletAddress,
  issuer: trustedIssuerAddress,
  signTransaction: freighterSignTransaction
});
```

**Revoke Issuer:**
```tsx
const { revokeIssuer } = useVault();

await revokeIssuer({
  owner: walletAddress,
  issuer: untrustedIssuerAddress,
  signTransaction: freighterSignTransaction
});
```

**Safety Checks:**
- [ ] Verify issuer address is correct
- [ ] Confirm user understands authorization implications
- [ ] For revocation: confirm all credentials from issuer will be affected
- [ ] Document reason for authorization/revocation

**Reference:** See `references/vault-management.md` for authorization patterns

---

## REQUIRED INFORMATION CHECKLIST

Before providing integration guidance, collect:

### Project Context
- [ ] **Application type:** React/Next.js, Node.js backend, mobile app, other?
- [ ] **Primary use case:** Education credentials, employment verification, KYC, custom?
- [ ] **Development stage:** Proof of concept, MVP, production?

### Technical Setup
- [ ] **API key obtained:** From https://dapp.acta.build?
- [ ] **Wallet setup:** Freighter installed and configured for testnet?
- [ ] **Environment:** Testnet (development) or mainnet (production)?

### Credential Details
- [ ] **Credential type:** Education, employment, identity, other?
- [ ] **Issuer authority:** Who has the right to issue these credentials?
- [ ] **Schema requirements:** Use standard template or custom structure?

### Security Understanding
- [ ] **Key custody:** User understands they control private keys?
- [ ] **Immutability:** User understands credentials are permanent?
- [ ] **Privacy:** Any sensitive data that needs protection?

**If information is missing, ASK before proceeding with code generation.**

---

## WHEN TO CONSULT REFERENCES

Load reference documentation progressively based on context:

### For All Integrations:
- `references/platform-overview.md` - First-time users need context on acta.build architecture

### For React Integration:
- `references/react-sdk-reference.md` - Complete hook documentation and TypeScript types

### For Credential Operations:
- `references/credential-lifecycle.md` - Detailed workflows for issue, verify, revoke

### For Vault Setup:
- `references/vault-management.md` - Vault creation, authorization, queries

### For Security Questions:
- `references/security-best-practices.md` - Key management, API security, threat models

### For Advanced Features:
- `references/zero-knowledge-proofs.md` - ZKP workflows (future expansion)

**Don't load all references upfront** - load only what's needed for the current task.

---

## HOW TO RESPOND

### 1. Gather Context
- Ask clarifying questions from the checklist
- Understand user's current setup and goal

### 2. Provide Structured Guidance
- Reference the 5-step workflow
- Show specific code examples
- Include safety checks

### 3. Safety-First Approach
- Always mention required confirmations
- Highlight security implications
- Remind about testnet-first development

### 4. Verify Understanding
- Ask user to confirm critical details
- Check API key is configured correctly
- Ensure wallet is connected

### 5. Next Steps
- Provide clear next action
- Reference relevant documentation
- Offer to help with testing

**Example Response:**
> I'll help you issue an education credential. First, let me verify your setup:
>
> 1. Do you have `ACTA_API_KEY_TESTNET` in your `.env.local`?
> 2. Is Freighter wallet installed and set to testnet mode?
> 3. Have you created a vault for the credential holder?
>
> Once confirmed, I'll show you the issuance code with the education template.
