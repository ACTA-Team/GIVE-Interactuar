# Zero-Knowledge Proofs (Future Expansion)

This document is a placeholder for future ZKP integration with acta.build.

---

## Status

**🚧 Under Development**

Zero-knowledge proof functionality for acta.build is currently in development. This reference will be expanded when ZKP features become available.

---

## Overview

Zero-knowledge proofs (ZKPs) enable proving specific claims about credentials without revealing the underlying data.

### Use Cases

**Age Verification:**
- Prove age > 21 without revealing exact birthdate
- Prove age > 18 for content access
- Prove age in range (e.g., 25-35) for demographics

**Identity Verification:**
- Prove citizenship without revealing full identity
- Prove residency in a country without revealing address
- Prove identity matches without revealing personal details

**Financial:**
- Prove income > threshold without revealing exact salary
- Prove credit score > minimum without revealing exact score
- Prove account balance > amount without revealing balance

**Education:**
- Prove degree completion without revealing GPA
- Prove graduation year in range without revealing exact date
- Prove enrollment status without revealing personal details

---

## Available Resources

### acta.build ZKP Repository

acta.build has a zero-knowledge proof implementation in development:

**Repository:** https://github.com/ACTA-Team/zk-test

This repository contains:
- ZK circuits for selective disclosure
- Proof generation and verification
- Integration with Stellar blockchain
- Example implementations

**Note:** Check repository for latest status and documentation.

---

## Planned Features

### Selective Disclosure

Reveal only specific fields from a credential:

```typescript
// Hypothetical API (not yet available)
const proof = await generateSelectiveDisclosureProof({
  credential: educationCredential,
  revealedFields: ['degree', 'university'],
  hiddenFields: ['gpa', 'studentId']
});

// Verifier sees only revealed fields
const verified = await verifySelectiveDisclosureProof(proof);
```

### Range Proofs

Prove a value falls within a range:

```typescript
// Hypothetical API (not yet available)
const proof = await generateRangeProof({
  credential: ageCredential,
  claim: 'age',
  range: { min: 21, max: 120 }  // Prove age >= 21
});

// Verifier confirms age > 21 without seeing exact age
const verified = await verifyRangeProof(proof);
```

### Set Membership

Prove a value belongs to a set:

```typescript
// Hypothetical API (not yet available)
const proof = await generateSetMembershipProof({
  credential: nationalityCredential,
  claim: 'country',
  validSet: ['USA', 'Canada', 'UK', 'Australia']
});

// Verifier confirms nationality is in set without seeing specific country
const verified = await verifySetMembershipProof(proof);
```

---

## Technical Approach

### Expected Architecture

**Circuit Design:**
- ZK circuits for common proof types
- Optimized for Stellar/Soroban constraints
- Verifiable on-chain

**Proof Generation:**
- Client-side proof generation
- Browser-compatible libraries
- Reasonable computation time

**On-Chain Verification:**
- Soroban smart contracts verify proofs
- Gas-efficient verification
- Results stored on-chain

---

## Integration Plan

### Phase 1: Basic Selective Disclosure
- Hide/reveal specific credential fields
- Simple proof generation
- On-chain verification

### Phase 2: Range Proofs
- Age verification
- Score thresholds
- Numeric range proofs

### Phase 3: Advanced Proofs
- Set membership
- Predicate proofs
- Composite proofs

---

## Timeline

**Current Status:** Research and development

**Expected Availability:** TBD

**Updates:** Check https://github.com/ACTA-Team/zk-test and https://docs.acta.build for latest information.

---

## When to Use ZKPs

### Good Use Cases
✅ Privacy-sensitive personal data
✅ Regulatory compliance (KYC without PII exposure)
✅ Age verification
✅ Threshold proofs (salary, credit score)
✅ Selective credential sharing

### When NOT to Use ZKPs
❌ Public information (university name, job title)
❌ Non-sensitive data
❌ When full disclosure is required
❌ Performance-critical applications (ZKP has computation overhead)

---

## Alternative Approaches (Until ZKP Available)

### 1. Hash-Based Verification

Store hash of sensitive data:

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "IdentityCredential"],
  "credentialSubject": {
    "id": "did:pkh:stellar:testnet:GXXXXX",
    "ssnHash": "sha256:abc123...",
    "verified": true
  }
}
```

User can prove they know the original value by revealing it for hash comparison.

### 2. Off-Chain Storage with Proofs

Store sensitive data off-chain, credential contains only proof:

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "EducationCredential"],
  "credentialSubject": {
    "id": "did:pkh:stellar:testnet:GXXXXX",
    "dataUrl": "https://secure-storage.example.com/data/xyz",
    "dataHash": "sha256:def456...",
    "verified": true
  }
}
```

Access control on off-chain storage provides privacy.

### 3. Multiple Credentials

Issue separate credentials for different disclosure levels:

```typescript
// High-detail credential (private)
const detailedCredential = {
  credentialSubject: {
    id: holderDid,
    degree: 'Bachelor of Science',
    major: 'Computer Science',
    university: 'Example University',
    graduationDate: '2024-05-15',
    gpa: '3.8',
    studentId: '12345'
  }
};

// Low-detail credential (public)
const summaryCredential = {
  credentialSubject: {
    id: holderDid,
    degreeLevel: 'Bachelor',
    field: 'Computer Science',
    graduationYear: '2024',
    verified: true
  }
};

// User shares appropriate credential based on context
```

---

## Research and Learning

### Understanding Zero-Knowledge Proofs

**Concepts:**
- Prover, Verifier, Witness
- Completeness, Soundness, Zero-Knowledge
- zk-SNARKs, zk-STARKs
- Trusted setup vs transparent setup

**Resources:**
- ZK Whiteboard Sessions: https://zkhack.dev/whiteboard/
- Zero Knowledge Proofs MOOC: https://zk-learning.org/
- Practical zk-SNARKs: https://www.npmjs.com/package/snarkjs

### Stellar/Soroban ZK Integration

**Soroban Capabilities:**
- Smart contract verification
- Gas costs for ZK verification
- State storage for proofs

**Stellar Network:**
- Transaction size limits
- Computational constraints
- Cost considerations

---

## Stay Updated

**Official Channels:**
- GitHub: https://github.com/ACTA-Team/zk-test
- Documentation: https://docs.acta.build
- Discord: https://discord.gg/DsUSE3aMDZ

**Community:**
- Join discussions about ZKP features
- Share use cases and requirements
- Contribute to development

---

## Placeholder Notice

⚠️ **This document is a placeholder.**

The information above represents planned or potential features. Actual implementation may differ.

**Check official acta.build documentation for:**
- Current ZKP availability
- Implementation details
- API reference
- Code examples
- Best practices

**Last Updated:** 2024 (placeholder)
**Next Review:** When ZKP features are released
