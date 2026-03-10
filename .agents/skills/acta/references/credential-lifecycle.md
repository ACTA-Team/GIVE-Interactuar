# Credential Lifecycle Reference

Complete workflows for credential issuance, verification, and revocation.

---

## Credential Issuance Workflow

### Overview

Issue W3C Verifiable Credentials 2.0 to a user's vault on Stellar blockchain.

### Prerequisites

- [ ] Vault exists for credential holder
- [ ] Issuer is authorized for the vault (if issuer ≠ owner)
- [ ] Freighter wallet installed and connected
- [ ] API key configured

### Step-by-Step Process

#### 1. Prepare Credential Data

Create W3C VC 2.0 compliant credential JSON:

```typescript
const credential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1'
  ],
  type: ['VerifiableCredential', 'EducationCredential'],
  credentialSubject: {
    id: 'did:pkh:stellar:testnet:GXXXXXXXXXXXXXXXXXXXXX',
    degree: 'Bachelor of Science',
    major: 'Computer Science',
    university: 'Example University',
    graduationDate: '2024-05-15',
    gpa: '3.8'
  }
};
```

**Required Fields:**
- `@context` - Must include W3C VC context URL
- `type` - Must include `VerifiableCredential`
- `credentialSubject.id` - DID of credential holder

**Optional Fields:**
- Additional types (e.g., `EducationCredential`)
- Custom properties in `credentialSubject`
- `issuer`, `issuanceDate`, `expirationDate` (handled by acta.build)

#### 2. Generate Unique Credential ID

Create a unique identifier for the credential:

```typescript
// Format: vc:<type>:<subtype>:<unique-id>
const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
const vcId = `vc:education:degree:${uniqueId}`;
```

**Naming Conventions:**
- `vc:education:degree:*` - Education degrees
- `vc:education:certificate:*` - Certificates
- `vc:employment:verification:*` - Employment verification
- `vc:identity:kyc:*` - KYC credentials
- `vc:custom:*` - Custom credential types

**⚠️ Important:** Credential IDs must be unique. Using duplicate IDs will fail.

#### 3. Get Wallet Addresses

```typescript
import freighter from '@stellar/freighter-api';

// Get credential holder's address
const holderAddress = await freighter.getPublicKey();

// Issuer address (may be same as holder for self-issued)
const issuerAddress = holderAddress;  // Or different issuer

// Create DIDs
const holderDid = `did:pkh:stellar:testnet:${holderAddress}`;
const issuerDid = `did:pkh:stellar:testnet:${issuerAddress}`;
```

#### 4. Issue Credential

```typescript
import { useCredential } from '@acta-team/acta-sdk';

const { issue } = useCredential();

await issue({
  owner: holderAddress,
  vcId: vcId,
  vcData: JSON.stringify(credential),
  issuer: issuerAddress,
  issuerDid: issuerDid,
  signTransaction: freighter.signTransaction
});
```

#### 5. User Signs Transaction

Freighter will prompt the user to:
- Review transaction details
- Approve the credential issuance
- Sign with their private key

**What the user sees:**
```
Freighter - Sign Transaction

From: GXXXXXXXXXXXXXXXXXXX
Operation: Invoke Contract
Contract: Credential Vault
Function: issue_credential

[Approve] [Reject]
```

#### 6. Confirmation

Once signed and submitted:
- Transaction is broadcast to Stellar network
- Credential is stored in vault
- Issuer authorization is verified
- Credential becomes publicly verifiable

**Success indicators:**
- No errors thrown
- Promise resolves successfully
- Credential can be verified immediately

---

## Credential Verification Workflow

### Overview

Verify that a credential is valid, authentic, and issued by an authorized issuer.

### Prerequisites

- [ ] Credential ID (vcId)
- [ ] Vault owner address
- [ ] API key configured

### Step-by-Step Process

#### 1. Obtain Credential Information

Get the credential ID and holder address:

```typescript
// Received from credential holder
const vcId = 'vc:education:degree:1234567890';
const holderAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
```

**Ways to receive credential information:**
- QR code scan
- Deep link
- Manual entry
- Shared via messaging
- Blockchain query

#### 2. Call Verification API

```typescript
import { useVaultRead } from '@acta-team/acta-sdk';

const { verifyVc } = useVaultRead();

const verification = await verifyVc({
  owner: holderAddress,
  vcId: vcId
});
```

**No wallet signature required for verification** - this is a read-only operation.

#### 3. Check Validity

```typescript
if (verification.isValid) {
  console.log('✅ Credential is valid');

  // Parse credential data
  const credential = JSON.parse(verification.vcData);

  // Access credential fields
  console.log('Degree:', credential.credentialSubject.degree);
  console.log('University:', credential.credentialSubject.university);
} else {
  console.log('❌ Credential is invalid or does not exist');
}
```

#### 4. Validate Credential Structure

Even if `isValid` is true, verify the credential matches expected format:

```typescript
if (verification.isValid) {
  const credential = JSON.parse(verification.vcData);

  // Check credential type
  if (!credential.type.includes('EducationCredential')) {
    throw new Error('Expected an education credential');
  }

  // Validate required fields
  if (!credential.credentialSubject.degree) {
    throw new Error('Missing degree field');
  }

  // Check issuer identity (if known)
  const expectedIssuerDid = 'did:pkh:stellar:testnet:GISSUER...';
  // Additional validation logic
}
```

#### 5. Interpret Results

**What `isValid: true` means:**
- ✅ Credential exists in the vault
- ✅ Issuer is currently authorized for this vault
- ✅ Cryptographic signatures are valid
- ✅ Credential has not been tampered with

**What `isValid: false` means:**
- ❌ Credential doesn't exist, OR
- ❌ Issuer has been revoked, OR
- ❌ Credential signature is invalid

**⚠️ Important:** `isValid` checks authorization status at verification time, not issuance time. If an issuer was revoked after issuance, the credential becomes invalid.

---

## Issuer Authorization Workflow

### Overview

Vault owners control which issuers can add credentials to their vault.

### Authorize Issuer

#### When to Authorize
- Before an issuer can issue credentials to your vault
- When establishing trust with a new issuer
- When enrolling in a credential program

#### Process

```typescript
import { useVault } from '@acta-team/acta-sdk';

const { authorizeIssuer } = useVault();

// Example: University issuing degree credentials
const universityIssuerAddress = 'GUNIVERSITY...';

await authorizeIssuer({
  owner: await freighter.getPublicKey(),
  issuer: universityIssuerAddress,
  signTransaction: freighter.signTransaction
});
```

#### Use Cases

**Educational Institutions:**
```typescript
// Authorize university to issue degree credentials
await authorizeIssuer({
  owner: studentAddress,
  issuer: universityAddress,
  signTransaction: freighter.signTransaction
});
```

**Employers:**
```typescript
// Authorize company to issue employment credentials
await authorizeIssuer({
  owner: employeeAddress,
  issuer: companyAddress,
  signTransaction: freighter.signTransaction
});
```

**Self-Issuance:**
```typescript
// No authorization needed - owner is issuer
// Owner is automatically authorized for their own vault
```

---

### Revoke Issuer

#### When to Revoke
- Issuer is no longer trusted
- Credentials from issuer should be invalidated
- Terminating relationship with credential provider
- Security breach or compromise

#### Process

```typescript
import { useVault } from '@acta-team/acta-sdk';

const { revokeIssuer } = useVault();

await revokeIssuer({
  owner: await freighter.getPublicKey(),
  issuer: untrustedIssuerAddress,
  signTransaction: freighter.signTransaction
});
```

#### Effects of Revocation

**Immediate effects:**
- Issuer can no longer issue new credentials
- All existing credentials from this issuer become invalid
- `verifyVc()` returns `isValid: false` for affected credentials

**What is NOT affected:**
- Credentials are not deleted (blockchain is immutable)
- Credential data remains on-chain
- Other issuers' credentials are unaffected

#### Example Scenarios

**University degree revoked:**
```typescript
// University had accreditation issues
await revokeIssuer({
  owner: studentAddress,
  issuer: universityAddress,
  signTransaction: freighter.signTransaction
});

// Now all degrees from this university show as invalid
```

**Employment termination:**
```typescript
// After leaving company
await revokeIssuer({
  owner: employeeAddress,
  issuer: formerEmployerAddress,
  signTransaction: freighter.signTransaction
});

// Employment credentials no longer verify as valid
```

---

## Advanced Patterns

### Multi-Issuer Credentials

User has credentials from multiple issuers:

```typescript
// Authorize multiple issuers
await authorizeIssuer({ owner, issuer: universityAddress, signTransaction });
await authorizeIssuer({ owner, issuer: employerAddress, signTransaction });
await authorizeIssuer({ owner, issuer: certificationBodyAddress, signTransaction });

// Each can issue credentials independently
// All credentials coexist in the same vault
```

### Credential Replacement

To "update" a credential (which is immutable):

1. Issue new credential with new ID
2. Application logic treats newer credential as authoritative
3. Optionally revoke old issuer if needed

```typescript
// Issue updated credential
const newVcId = `vc:education:degree:${Date.now()}`;
await issue({
  owner,
  vcId: newVcId,
  vcData: JSON.stringify(updatedCredential),
  issuer,
  issuerDid,
  signTransaction
});

// Application queries both credentials and uses newest
```

### Credential Expiration

W3C VC 2.0 supports expiration dates:

```typescript
const credential = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  type: ['VerifiableCredential', 'CertificationCredential'],
  expirationDate: '2025-12-31T23:59:59Z',
  credentialSubject: {
    id: holderDid,
    certification: 'Professional License',
    validUntil: '2025-12-31'
  }
};
```

**Verification with expiration:**
```typescript
const verification = await verifyVc({ owner, vcId });

if (verification.isValid) {
  const credential = JSON.parse(verification.vcData);
  const expirationDate = new Date(credential.expirationDate);

  if (expirationDate < new Date()) {
    console.log('❌ Credential has expired');
  } else {
    console.log('✅ Credential is valid and not expired');
  }
}
```

### Selective Disclosure (Future)

Zero-knowledge proofs enable proving specific claims without revealing full credential:

```typescript
// Future: Prove age > 21 without revealing exact birthdate
// See references/zero-knowledge-proofs.md when available
```

---

## Credential Templates

Common credential structures for different use cases.

### Education Degree
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "EducationCredential"],
  "credentialSubject": {
    "id": "did:pkh:stellar:testnet:GXXXXXX",
    "degree": "Bachelor of Science",
    "major": "Computer Science",
    "university": "Example University",
    "graduationDate": "2024-05-15",
    "gpa": "3.8"
  }
}
```

### Employment Verification
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "EmploymentCredential"],
  "credentialSubject": {
    "id": "did:pkh:stellar:testnet:GXXXXXX",
    "jobTitle": "Senior Software Engineer",
    "employer": "Acme Corporation",
    "startDate": "2020-06-01",
    "endDate": "2024-03-15",
    "skills": ["JavaScript", "React", "Node.js"]
  }
}
```

### Identity/KYC
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "IdentityCredential"],
  "credentialSubject": {
    "id": "did:pkh:stellar:testnet:GXXXXXX",
    "fullName": "Jane Doe",
    "dateOfBirth": "1990-01-15",
    "country": "United States",
    "verified": true,
    "kycLevel": "level-2"
  }
}
```

---

## Error Scenarios

### Issuance Errors

**Issuer Not Authorized:**
```
Error: Issuer GXXXXX is not authorized for vault GYYYYYY
```
**Solution:** Vault owner must call `authorizeIssuer()` first

**Vault Doesn't Exist:**
```
Error: Vault not found for owner GXXXXX
```
**Solution:** Create vault with `createVault()` first

**Duplicate Credential ID:**
```
Error: Credential with ID vc:education:degree:123 already exists
```
**Solution:** Generate new unique credential ID

**Invalid Credential Format:**
```
Error: vcData is not valid JSON
```
**Solution:** Validate credential structure against W3C VC 2.0 schema

### Verification Errors

**Credential Not Found:**
```
{ isValid: false }
```
**Possible reasons:**
- Credential doesn't exist
- Wrong owner address
- Wrong credential ID

**Issuer Revoked:**
```
{ isValid: false }
```
**Reason:** Issuer was revoked after credential was issued

---

## Best Practices

### Issuance
1. ✅ Always use testnet for development
2. ✅ Validate credential structure before issuing
3. ✅ Generate unique credential IDs
4. ✅ Confirm user approval before issuance
5. ✅ Handle Freighter rejection gracefully

### Verification
1. ✅ Always check `isValid` flag first
2. ✅ Validate credential structure even if valid
3. ✅ Check expiration dates if present
4. ✅ Verify issuer identity matches expectations
5. ✅ Handle missing credentials gracefully

### Authorization
1. ✅ Only authorize trusted issuers
2. ✅ Document reason for authorization
3. ✅ Review authorized issuers periodically
4. ✅ Revoke compromised issuers immediately
5. ✅ Understand revocation affects all credentials from issuer

---

## Testing Checklist

### Issuance Testing
- [ ] Issue credential to self (owner = issuer)
- [ ] Issue credential from different issuer (after authorization)
- [ ] Attempt issuance without authorization (should fail)
- [ ] Attempt duplicate credential ID (should fail)
- [ ] User rejects Freighter signature (should fail gracefully)
- [ ] Invalid credential format (should fail)

### Verification Testing
- [ ] Verify valid credential (should return isValid: true)
- [ ] Verify non-existent credential (should return isValid: false)
- [ ] Verify credential after issuer revoked (should return isValid: false)
- [ ] Parse credential data correctly
- [ ] Handle verification errors gracefully

### Authorization Testing
- [ ] Authorize new issuer successfully
- [ ] Authorize same issuer twice (should succeed/be idempotent)
- [ ] Revoke authorized issuer successfully
- [ ] Verify credentials invalid after revocation
- [ ] Re-authorize previously revoked issuer
