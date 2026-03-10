#!/usr/bin/env node

/**
 * Validate Verifiable Credential Structure
 *
 * This script validates credential JSON files against W3C VC 2.0 schema requirements.
 *
 * Usage:
 *   node scripts/validate-credential.js <credential-file.json>
 *
 * Example:
 *   node scripts/validate-credential.js assets/credential-templates/education.json
 *
 * What it checks:
 *   - Required @context field
 *   - Required type field includes VerifiableCredential
 *   - Required credentialSubject exists
 *   - credentialSubject.id is a valid DID
 *   - Valid JSON structure
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

// Helper function for colored output
function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

// Check command line arguments
if (process.argv.length < 3) {
  console.log(colorize('Usage:', 'bold'));
  console.log('  node validate-credential.js <credential-file.json>\n');
  console.log(colorize('Examples:', 'bold'));
  console.log('  node scripts/validate-credential.js assets/credential-templates/education.json');
  console.log('  node scripts/validate-credential.js my-credential.json\n');
  process.exit(1);
}

const filePath = process.argv[2];

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error(colorize(`❌ File not found: ${filePath}`, 'red'));
  console.log('\nMake sure the file path is correct.');
  process.exit(1);
}

console.log(colorize('\n🔍 Validating W3C Verifiable Credential 2.0\n', 'bold'));
console.log(`File: ${filePath}\n`);

// Read and parse credential file
let credential;
try {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  credential = JSON.parse(fileContent);
  console.log(colorize('✅ Valid JSON structure', 'green'));
} catch (error) {
  console.error(colorize('❌ Invalid JSON file', 'red'));
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

console.log('\n' + colorize('Validation Checks:', 'bold'));
console.log('─────────────────────────────────────────\n');

// Track validation results
const checks = [];
let hasErrors = false;
let hasWarnings = false;

// Check 1: @context field
const contextCheck = {
  name: '@context includes W3C VC context',
  valid: Array.isArray(credential['@context']) &&
         credential['@context'].includes('https://www.w3.org/2018/credentials/v1'),
  required: true
};
checks.push(contextCheck);

if (!contextCheck.valid) {
  hasErrors = true;
  console.log(colorize('❌ @context field', 'red'));
  console.log('   Expected: Array including "https://www.w3.org/2018/credentials/v1"');
  console.log(`   Found: ${JSON.stringify(credential['@context'])}\n`);
} else {
  console.log(colorize('✅ @context field', 'green'));
}

// Check 2: type field
const typeCheck = {
  name: 'type includes VerifiableCredential',
  valid: Array.isArray(credential.type) &&
         credential.type.includes('VerifiableCredential'),
  required: true
};
checks.push(typeCheck);

if (!typeCheck.valid) {
  hasErrors = true;
  console.log(colorize('❌ type field', 'red'));
  console.log('   Expected: Array including "VerifiableCredential"');
  console.log(`   Found: ${JSON.stringify(credential.type)}\n`);
} else {
  console.log(colorize('✅ type field', 'green'));
  // Show additional types
  const otherTypes = credential.type.filter(t => t !== 'VerifiableCredential');
  if (otherTypes.length > 0) {
    console.log(`   Additional types: ${otherTypes.join(', ')}`);
  }
}

// Check 3: credentialSubject exists
const subjectCheck = {
  name: 'credentialSubject exists',
  valid: !!credential.credentialSubject,
  required: true
};
checks.push(subjectCheck);

if (!subjectCheck.valid) {
  hasErrors = true;
  console.log(colorize('❌ credentialSubject field', 'red'));
  console.log('   credentialSubject is required but missing\n');
} else {
  console.log(colorize('✅ credentialSubject exists', 'green'));
}

// Check 4: credentialSubject.id is a DID
const didCheck = {
  name: 'credentialSubject.id is a DID',
  valid: credential.credentialSubject?.id?.startsWith('did:'),
  required: true
};
checks.push(didCheck);

if (!didCheck.valid) {
  hasErrors = true;
  console.log(colorize('❌ credentialSubject.id', 'red'));
  console.log('   Expected: DID format (e.g., "did:pkh:stellar:testnet:G...")');
  console.log(`   Found: ${credential.credentialSubject?.id || 'missing'}\n`);
} else {
  console.log(colorize('✅ credentialSubject.id is a DID', 'green'));
  console.log(`   ${credential.credentialSubject.id}`);
}

console.log('\n' + colorize('Additional Checks:', 'bold'));
console.log('─────────────────────────────────────────\n');

// Optional Check: Issuer field (not required in our implementation but recommended)
if (credential.issuer) {
  console.log(colorize('ℹ️  Issuer field present', 'blue'));
  console.log(`   ${credential.issuer}`);
} else {
  console.log(colorize('⚠️  Issuer field missing (optional)', 'yellow'));
  console.log('   Issuer will be set during credential issuance');
  hasWarnings = true;
}

// Optional Check: Issuance date
if (credential.issuanceDate) {
  console.log(colorize('ℹ️  Issuance date present', 'blue'));
  console.log(`   ${credential.issuanceDate}`);
} else {
  console.log(colorize('ℹ️  Issuance date not set', 'blue'));
  console.log('   Will be set automatically during issuance');
}

// Optional Check: Expiration date
if (credential.expirationDate) {
  console.log(colorize('ℹ️  Expiration date present', 'blue'));
  console.log(`   ${credential.expirationDate}`);
} else {
  console.log(colorize('ℹ️  No expiration date', 'blue'));
  console.log('   Credential will not expire');
}

// Check credential subject fields
console.log('\n' + colorize('Credential Subject Fields:', 'bold'));
console.log('─────────────────────────────────────────\n');

if (credential.credentialSubject) {
  const subjectFields = Object.keys(credential.credentialSubject).filter(key => key !== 'id');

  if (subjectFields.length === 0) {
    console.log(colorize('⚠️  No additional fields in credentialSubject', 'yellow'));
    console.log('   Consider adding credential-specific data');
    hasWarnings = true;
  } else {
    subjectFields.forEach(field => {
      const value = credential.credentialSubject[field];
      console.log(`  • ${field}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
    });
  }
}

// Security warnings
console.log('\n' + colorize('Security Checks:', 'bold'));
console.log('─────────────────────────────────────────\n');

// Check for potentially sensitive data
const sensitiveFields = ['ssn', 'socialSecurityNumber', 'password', 'privateKey', 'secret', 'creditCard', 'bankAccount'];
const foundSensitive = [];

function checkSensitiveData(obj, path = '') {
  for (const key in obj) {
    const fullPath = path ? `${path}.${key}` : key;
    const lowerKey = key.toLowerCase();

    if (sensitiveFields.some(sensitive => lowerKey.includes(sensitive))) {
      foundSensitive.push({ field: fullPath, value: obj[key] });
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      checkSensitiveData(obj[key], fullPath);
    }
  }
}

checkSensitiveData(credential);

if (foundSensitive.length > 0) {
  console.log(colorize('⚠️  WARNING: Potentially sensitive data detected!', 'yellow'));
  foundSensitive.forEach(item => {
    console.log(`   ${item.field}: ${item.value}`);
  });
  console.log('\n   Credentials are stored on-chain and publicly readable.');
  console.log('   Avoid including sensitive personal information without encryption.');
  hasWarnings = true;
} else {
  console.log(colorize('✅ No obvious sensitive data detected', 'green'));
}

// Final summary
console.log('\n' + colorize('═══════════════════════════════════════', 'bold'));
console.log(colorize('Summary:', 'bold'));
console.log(colorize('═══════════════════════════════════════', 'bold') + '\n');

const allValid = checks.every(c => c.valid);

if (allValid && !hasWarnings) {
  console.log(colorize('✅ Credential is valid and ready to use!', 'green'));
  console.log('\nThis credential meets W3C VC 2.0 requirements and can be issued.\n');
  process.exit(0);
} else if (allValid && hasWarnings) {
  console.log(colorize('✅ Credential is valid with warnings', 'green'));
  console.log(colorize('⚠️  Review warnings above before issuing', 'yellow'));
  console.log('\nThis credential meets minimum requirements but has optional issues.\n');
  process.exit(0);
} else {
  console.log(colorize('❌ Credential has errors and cannot be issued', 'red'));
  console.log('\nFix the errors above before attempting to issue this credential.\n');
  process.exit(1);
}
