# Security Best Practices

Critical security guidelines for integrating acta.build verifiable credentials.

---

## API Key Management

### Storage

**✅ DO:**
```typescript
// Store in environment file
// .env.local
ACTA_API_KEY_TESTNET=your_api_key_here
ACTA_API_KEY_MAINNET=your_mainnet_key_here

// Access in code
const apiKey = process.env.ACTA_API_KEY_TESTNET;
```

**❌ DON'T:**
```typescript
// NEVER hardcode API keys
const apiKey = 'sk_test_abc123...';  // ❌ BAD!

// NEVER commit keys to version control
git add .env.local  // ❌ BAD!
```

### .gitignore Configuration

**Always exclude environment files:**
```gitignore
# .gitignore
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local
```

**Verify exclusion:**
```bash
# Check that .env.local is not tracked
git status

# Should NOT show .env.local in changes
```

### Key Rotation

**When to rotate API keys:**
- Key accidentally committed to version control
- Key exposed in logs or error messages
- Key shared with unauthorized person
- Periodic rotation (every 90 days recommended)
- Security incident or breach

**How to rotate:**
1. Generate new API key at https://dapp.acta.build
2. Update `.env.local` with new key
3. Test application with new key
4. Revoke old key in dashboard
5. Verify old key no longer works

### API Key Permissions

**Testnet API key:**
- Use for all development and testing
- Free to use (no cost)
- Can be regenerated freely
- Limited to testnet network

**Mainnet API key:**
- Use ONLY for production
- Costs real XLM for transactions
- Protect as sensitive credential
- Monitor usage regularly

**⚠️ NEVER use mainnet key during development!**

---

## Private Key Security

### Understanding Key Types

**API Keys (acta.build):**
- Used for acta.build API access
- NOT blockchain private keys
- Cannot control user funds
- Cannot sign transactions
- Can be rotated freely

**Wallet Private Keys (Stellar):**
- Control blockchain assets (XLM)
- Sign all blockchain transactions
- Authorize vault operations
- Stored in Freighter wallet
- NEVER shared with anyone

**Critical distinction:** API keys ≠ Private keys

### Wallet Private Key Protection

**✅ DO:**
- Keep private keys in Freighter wallet
- Never extract private keys from wallet
- Use hardware wallet (Ledger) for mainnet
- Backup seed phrase offline (paper, metal)
- Store backup in secure location (safe, bank vault)
- Use testnet for development

**❌ DON'T:**
- Share private keys or seed phrases
- Store private keys in code
- Save private keys in .env files
- Send private keys via email/chat
- Screenshot seed phrases
- Store seed phrases in cloud
- Use same wallet for testnet and mainnet

### Non-Custodial Architecture

**What this means:**
- You control your private keys
- acta.build cannot access your keys
- acta.build cannot sign transactions for you
- You are responsible for key security

**Implications:**
- If you lose keys, you lose access to vault
- No "forgot password" recovery
- No customer support can recover keys
- Backup is YOUR responsibility

### Transaction Signing

**Secure signing flow:**
```typescript
// 1. Application requests operation
await issue({ owner, vcId, vcData, issuer, issuerDid, signTransaction });

// 2. acta.build SDK prepares transaction

// 3. SDK calls Freighter to sign
signTransaction: freighter.signTransaction

// 4. Freighter shows transaction to user
// "Sign transaction to issue credential?"

// 5. User reviews and approves

// 6. Freighter signs with private key (inside extension)

// 7. Signed transaction returned to SDK

// 8. SDK submits to Stellar network
```

**Security guarantees:**
- Private key never leaves Freighter
- User sees transaction before signing
- User can reject transaction
- Application never has access to private key

---

## Credential Data Privacy

### What's On-Chain

**Publicly readable data:**
- Credential content (vcData JSON)
- Vault owner address
- Issuer address
- Credential ID
- Issuance timestamp

**Anyone can read if they know:**
- Vault owner address
- Credential ID

### Data Minimization

**✅ DO:**
```json
{
  "credentialSubject": {
    "id": "did:pkh:stellar:testnet:GXXXXX",
    "degreeLevel": "Bachelor",
    "field": "Computer Science",
    "graduationYear": "2024",
    "verified": true
  }
}
```

**❌ DON'T:**
```json
{
  "credentialSubject": {
    "id": "did:pkh:stellar:testnet:GXXXXX",
    "ssn": "123-45-6789",           // ❌ Sensitive!
    "homeAddress": "123 Main St",   // ❌ Private!
    "phoneNumber": "+1-555-1234",   // ❌ Personal!
    "bankAccount": "9876543210",    // ❌ Financial!
    "medicalRecords": "..."         // ❌ HIPAA violation!
  }
}
```

### Sensitive Data Handling

**Options for privacy-sensitive data:**

1. **Hash instead of raw data:**
```json
{
  "credentialSubject": {
    "id": "did:pkh:stellar:testnet:GXXXXX",
    "ssnHash": "sha256:abc123...",
    "verified": true
  }
}
```

2. **Off-chain storage with proof:**
```json
{
  "credentialSubject": {
    "id": "did:pkh:stellar:testnet:GXXXXX",
    "dataUrl": "https://secure-storage.example.com/data/xyz",
    "dataHash": "sha256:def456..."
  }
}
```

3. **Zero-knowledge proofs (future):**
```json
{
  "credentialSubject": {
    "id": "did:pkh:stellar:testnet:GXXXXX",
    "ageOver21": true,  // Proven without revealing exact age
    "zkProof": "..."
  }
}
```

### GDPR and Privacy Compliance

**Challenges with blockchain:**
- Data is immutable (cannot be deleted)
- Right to erasure (GDPR) is difficult
- Data is publicly readable

**Compliance strategies:**
1. **Don't store personal data on-chain**
   - Use hashes and references instead
   - Store sensitive data off-chain

2. **Minimize data collection**
   - Only include necessary fields
   - Aggregate rather than specific data

3. **User consent**
   - Inform users data is permanent
   - Get explicit consent before issuance
   - Document consent in application

4. **Selective disclosure**
   - Use ZKP for privacy-sensitive claims
   - Prove properties without revealing data

---

## Network Security

### Testnet vs Mainnet

**Testnet (Development):**
- ✅ Use for all development
- ✅ Use for testing
- ✅ Use for demos
- ✅ Free (no real cost)
- ✅ Safe to experiment
- ✅ Can fail without consequences

**Mainnet (Production):**
- ⚠️ Use ONLY for production
- ⚠️ Costs real XLM
- ⚠️ Transactions are permanent
- ⚠️ Requires explicit user confirmation
- ⚠️ Thorough testing required first

### Environment Configuration

**Separate environments:**
```typescript
// config.ts
export const config = {
  development: {
    apiKey: process.env.ACTA_API_KEY_TESTNET,
    network: 'testnet',
    didPrefix: 'did:pkh:stellar:testnet:'
  },
  production: {
    apiKey: process.env.ACTA_API_KEY_MAINNET,
    network: 'mainnet',
    didPrefix: 'did:pkh:stellar:mainnet:'
  }
};

// Use based on NODE_ENV
const env = process.env.NODE_ENV === 'production' ? config.production : config.development;
```

### Network Validation

**Always verify network before mainnet operations:**
```typescript
const confirmMainnetOperation = async (operation: string) => {
  if (config.network === 'mainnet') {
    const confirmed = confirm(`
      ⚠️ MAINNET OPERATION WARNING

      You are about to perform: ${operation}

      This will:
      - Use real XLM (costs money)
      - Be permanent and cannot be undone
      - Be publicly recorded on Stellar mainnet

      Are you absolutely sure?
    `);

    if (!confirmed) {
      throw new Error('Operation cancelled by user');
    }
  }
};

// Use before mainnet operations
await confirmMainnetOperation('create vault');
await createVault({ ... });
```

---

## Application Security

### Input Validation

**Validate all inputs before issuing credentials:**
```typescript
const validateCredentialInput = (vcData: any) => {
  // Check required fields
  if (!vcData['@context']) {
    throw new Error('Missing @context');
  }

  if (!vcData.type || !vcData.type.includes('VerifiableCredential')) {
    throw new Error('Invalid type');
  }

  if (!vcData.credentialSubject) {
    throw new Error('Missing credentialSubject');
  }

  if (!vcData.credentialSubject.id || !vcData.credentialSubject.id.startsWith('did:')) {
    throw new Error('Invalid credentialSubject.id');
  }

  // Validate structure
  try {
    JSON.stringify(vcData);
  } catch {
    throw new Error('Credential data is not valid JSON');
  }

  return true;
};

// Use before issuing
validateCredentialInput(credential);
await issue({ vcData: JSON.stringify(credential), ... });
```

### Issuer Verification

**Verify issuer identity before accepting credentials:**
```typescript
const trustedIssuers = {
  'GUNIVERSITY123...': {
    name: 'Example University',
    types: ['EducationCredential'],
    verified: true
  },
  'GCOMPANY456...': {
    name: 'Acme Corporation',
    types: ['EmploymentCredential'],
    verified: true
  }
};

const verifyIssuer = (issuerAddress: string, credentialType: string) => {
  const issuer = trustedIssuers[issuerAddress];

  if (!issuer) {
    throw new Error('Unknown issuer');
  }

  if (!issuer.verified) {
    throw new Error('Issuer not verified');
  }

  if (!issuer.types.includes(credentialType)) {
    throw new Error('Issuer not authorized for this credential type');
  }

  return issuer;
};
```

### Rate Limiting

**Prevent abuse with rate limiting:**
```typescript
// Simple in-memory rate limiter
const rateLimiter = new Map<string, number[]>();

const checkRateLimit = (userId: string, maxRequests: number, windowMs: number) => {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];

  // Remove old requests outside window
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
};

// Use before credential operations
checkRateLimit(walletAddress, 10, 60000);  // 10 requests per minute
await issue({ ... });
```

---

## Error Handling

### Don't Expose Sensitive Info

**✅ DO:**
```typescript
try {
  await issue({ ... });
} catch (error) {
  // Log full error server-side
  console.error('Credential issuance failed:', error);

  // Show user-friendly message
  throw new Error('Failed to issue credential. Please try again.');
}
```

**❌ DON'T:**
```typescript
try {
  await issue({ ... });
} catch (error) {
  // Don't expose stack traces to users
  alert(error.stack);  // ❌ BAD!

  // Don't expose internal details
  throw new Error(`Database error: ${dbConnectionString}`);  // ❌ BAD!
}
```

### Secure Logging

**✅ DO:**
```typescript
// Log safely
console.log('Credential issued', {
  vcId: 'vc:education:degree:12345',
  owner: 'GXXXXX...XXXXX',  // Truncate
  timestamp: new Date().toISOString()
});
```

**❌ DON'T:**
```typescript
// Don't log sensitive data
console.log('API Key:', process.env.ACTA_API_KEY);  // ❌ BAD!
console.log('Full credential:', vcData);  // ❌ May contain PII!
console.log('User data:', userData);  // ❌ May contain PII!
```

---

## Dependency Security

### Keep Dependencies Updated

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Verify Package Integrity

```bash
# Use package-lock.json
npm ci  # Instead of npm install

# Verify signatures
npm verify
```

### Trusted Dependencies

**Official packages:**
- `@acta-team/acta-sdk` - Official acta.build SDK
- `@stellar/freighter-api` - Official Freighter wallet SDK
- `stellar-sdk` - Official Stellar SDK

**⚠️ Warning:** Be cautious of typosquatting (e.g., `acta-sdk` vs `@acta-team/acta-sdk`)

---

## Deployment Security

### HTTPS Required

**✅ DO:**
```
https://your-app.example.com
```

**❌ DON'T:**
```
http://your-app.example.com  // ❌ Insecure!
```

### Environment Variables in Production

**Use secure secret management:**
- AWS Secrets Manager
- Google Cloud Secret Manager
- Azure Key Vault
- Vercel Environment Variables
- Netlify Environment Variables

**Don't use:**
- Hardcoded values
- Committed .env files
- Unencrypted configuration files

### Content Security Policy

```typescript
// Add CSP headers
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  connect-src 'self' https://api.acta.build https://soroban-testnet.stellar.org;
  img-src 'self' data: https:;
  style-src 'self' 'unsafe-inline';
`;

// In Next.js
export const headers = [
  {
    key: 'Content-Security-Policy',
    value: cspHeader.replace(/\s{2,}/g, ' ').trim()
  }
];
```

---

## Security Checklist

### Development
- [ ] API keys in .env.local (not hardcoded)
- [ ] .env.local in .gitignore
- [ ] Using testnet for development
- [ ] Input validation on all credential data
- [ ] Error handling doesn't expose sensitive info
- [ ] Dependencies are up to date
- [ ] No credentials committed to Git

### Production
- [ ] HTTPS enabled
- [ ] Environment variables in secure storage
- [ ] Rate limiting implemented
- [ ] Monitoring and alerting configured
- [ ] Issuer verification in place
- [ ] CSP headers configured
- [ ] Mainnet operations require confirmation
- [ ] Audit logging enabled
- [ ] Regular security reviews scheduled

### User Education
- [ ] Users understand private key custody
- [ ] Users know credentials are immutable
- [ ] Users consent to on-chain storage
- [ ] Users understand testnet vs mainnet
- [ ] Users backup their seed phrases
- [ ] Users understand revocation implications

---

## Incident Response

### If API Key Exposed

1. **Immediately rotate key:**
   - Generate new API key
   - Update production environment
   - Revoke old key

2. **Assess damage:**
   - Check API usage logs
   - Identify unauthorized operations
   - Document timeline

3. **Notify affected users** (if applicable)

### If Private Key Compromised

1. **Transfer assets:**
   - Move XLM to new wallet
   - Create new vault in new wallet
   - Request credential re-issuance

2. **Revoke compromised vault:**
   - Notify verifiers
   - Update application to use new vault

3. **Document incident:**
   - Timeline of compromise
   - Steps taken
   - Lessons learned

---

## Security Resources

### Official Documentation
- acta.build Security: https://docs.acta.build/security
- Stellar Security: https://developers.stellar.org/docs/learn/security
- W3C VC Security: https://www.w3.org/TR/vc-data-model/#security-considerations

### Security Tools
- API key scanning: GitGuardian, TruffleHog
- Dependency scanning: npm audit, Snyk
- Code analysis: SonarQube, CodeQL

### Reporting Security Issues
- Email: security@acta.build (if available)
- GitHub Security Advisories
- Responsible disclosure

---

## Threat Model

### Threats Mitigated
✅ API key theft (via .env.local and rotation)
✅ Private key theft (via non-custodial architecture)
✅ Man-in-the-middle (via HTTPS)
✅ Unauthorized credential issuance (via issuer authorization)
✅ Credential tampering (via cryptographic signatures)

### Threats to Consider
⚠️ Phishing attacks (user education required)
⚠️ Social engineering (user awareness required)
⚠️ Malicious issuers (issuer verification required)
⚠️ Compromised dependencies (auditing required)
⚠️ Data privacy (minimize on-chain data)

### Out of Scope
❌ Freighter wallet vulnerabilities (trust wallet security)
❌ Stellar network attacks (trust Stellar consensus)
❌ Browser/OS vulnerabilities (trust user environment)
