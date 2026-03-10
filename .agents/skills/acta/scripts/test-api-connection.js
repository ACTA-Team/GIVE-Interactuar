#!/usr/bin/env node

/**
 * Test acta.build API Connection
 *
 * This script verifies:
 * - API key is configured correctly
 * - Connection to acta.build API works
 * - Network configuration is valid
 *
 * Usage:
 *   node scripts/test-api-connection.js
 *
 * Prerequisites:
 *   - ACTA_API_KEY_TESTNET in .env.local
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const apiKey = process.env.ACTA_API_KEY_TESTNET;

console.log('🔍 Testing acta.build API Connection...\n');

// Check if API key exists
if (!apiKey) {
  console.error('❌ ERROR: ACTA_API_KEY_TESTNET not found in .env.local');
  console.log('\n📋 To fix this:');
  console.log('1. Obtain API key from https://dapp.acta.build');
  console.log('2. Create .env.local file in project root');
  console.log('3. Add: ACTA_API_KEY_TESTNET=your_api_key_here');
  console.log('4. Make sure .env.local is in .gitignore');
  process.exit(1);
}

console.log('✅ API key found in environment');
console.log(`   Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

// Test API connection
const options = {
  hostname: 'api.acta.build',
  path: '/config',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
};

console.log('🌐 Testing connection to https://api.acta.build/config...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ API connection successful!\n');

      try {
        const config = JSON.parse(data);

        console.log('📊 Configuration Details:');
        console.log('─────────────────────────────────────────');
        console.log(`Network:         ${config.network || 'testnet'}`);
        console.log(`RPC URL:         ${config.rpcUrl || 'N/A'}`);
        console.log(`Contract:        ${config.contractAddress ? config.contractAddress.substring(0, 20) + '...' : 'N/A'}`);
        console.log(`Passphrase:      ${config.passphrase ? config.passphrase.substring(0, 30) + '...' : 'N/A'}`);
        console.log('─────────────────────────────────────────\n');

        // Verify network
        if (config.network === 'testnet' || !config.network) {
          console.log('✅ Using TESTNET (safe for development)');
        } else if (config.network === 'mainnet') {
          console.log('⚠️  WARNING: Using MAINNET (real transactions!)');
          console.log('   Switch to testnet for development');
        }

        console.log('\n🎉 Setup is complete! You can start using acta.build.\n');

      } catch (error) {
        console.error('❌ Failed to parse API response');
        console.error('Response:', data);
      }
    } else if (res.statusCode === 401) {
      console.error('❌ Authentication failed (401 Unauthorized)');
      console.log('\n📋 Possible issues:');
      console.log('- API key is invalid or expired');
      console.log('- API key format is incorrect');
      console.log('\n✅ Solutions:');
      console.log('1. Generate new API key at https://dapp.acta.build');
      console.log('2. Update ACTA_API_KEY_TESTNET in .env.local');
      console.log('3. Verify no extra spaces in the key');
    } else if (res.statusCode === 403) {
      console.error('❌ Access forbidden (403 Forbidden)');
      console.log('\n📋 Possible issues:');
      console.log('- API key doesn\'t have required permissions');
      console.log('- API key is for wrong environment');
    } else {
      console.error(`❌ API connection failed with status ${res.statusCode}`);
      console.error('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.log('\n📋 Possible issues:');
  console.log('- No internet connection');
  console.log('- Firewall blocking HTTPS requests');
  console.log('- api.acta.build is temporarily unavailable');
  console.log('\n✅ Solutions:');
  console.log('1. Check your internet connection');
  console.log('2. Try again in a few moments');
  console.log('3. Check https://status.acta.build (if available)');
});

req.on('timeout', () => {
  console.error('❌ Request timeout');
  req.destroy();
});

req.setTimeout(10000); // 10 second timeout
req.end();
