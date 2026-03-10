# Quick Start Guide

Get started with the acta.build verifiable credentials skill in 5 minutes.

## 1. Install the Skill

```bash
# From the skill directory
npx skills add .

# Or from GitHub (when published)
npx skills add wlademyr/acta-skill
```

## 2. Test Helper Scripts

Verify your API connection:

```bash
npm run test:api
```

Validate credential templates:

```bash
npm run validate:education
npm run validate:employment
npm run validate:identity
```

## 3. Invoke the Skill

In Claude Code:

```
$acta help me set up my first credential vault
```

Or implicitly:

```
I want to issue a verifiable credential for education
```

## 4. Common Tasks

### Issue a Credential

```
$acta help me issue an education credential
```

The skill will:
- Check your setup (API key, wallet)
- Show you the credential template
- Guide you through the issuance process
- Provide safety confirmations

### Verify a Credential

```
$acta verify this credential: vc:education:degree:12345
```

The skill will:
- Read the credential from the vault
- Check validity and issuer authorization
- Display credential details

### Set Up a Vault

```
$acta create a vault for my wallet
```

The skill will:
- Connect to Freighter wallet
- Create vault with your DID
- Confirm successful creation

## 5. Prerequisites Checklist

Before using the skill, ensure you have:

- [ ] **API Key** from https://dapp.acta.build
- [ ] **Freighter Wallet** installed and configured for testnet
- [ ] **API Key in .env.local**:
  ```
  ACTA_API_KEY_TESTNET=your_api_key_here
  ```
- [ ] **.env.local in .gitignore** (protect your API key!)
- [ ] **Testnet XLM** funded wallet (free from Stellar Laboratory)

## 6. File Structure

```
acta-skill/
├── SKILL.md                    # Main skill definition (read first!)
├── README.md                   # Installation guide
├── QUICKSTART.md              # This file
├── references/                # Detailed documentation
│   ├── platform-overview.md
│   ├── react-sdk-reference.md
│   ├── credential-lifecycle.md
│   ├── vault-management.md
│   └── security-best-practices.md
├── assets/
│   ├── credential-templates/  # JSON templates
│   └── examples/              # React components
└── scripts/                   # Helper utilities
    ├── test-api-connection.js
    └── validate-credential.js
```

## 7. Safety First

The skill follows these safety principles:

⚠️ **Mandatory Confirmations**
- All credential operations require explicit approval
- Vault creation requires confirmation
- Issuer revocation requires typing "REVOKE"

🔐 **Security Best Practices**
- API keys never in code
- Private keys stay in wallet
- Testnet default for development

🛡️ **Immutability Warnings**
- Credentials cannot be deleted
- Users must understand permanence
- Clear consequences explained

## 8. Example Workflows

### Complete Setup (First Time)

```
$acta I'm new to verifiable credentials, help me get started
```

1. Skill checks prerequisites
2. Guides you to obtain API key
3. Helps configure environment
4. Creates vault
5. Issues first credential

### Issue Employment Credential

```
$acta issue an employment verification credential
```

1. Skill loads employment template
2. Prompts for job details
3. Shows confirmation dialog
4. Signs with Freighter
5. Returns credential ID

### Verify Someone's Credential

```
$acta verify credential vc:education:degree:xyz from wallet GXXXXX
```

1. Skill queries vault
2. Checks issuer authorization
3. Validates signatures
4. Displays credential data

## 9. Troubleshooting

**"API key not found"**
- Create `.env.local` file
- Add `ACTA_API_KEY_TESTNET=your_key`
- Restart your application

**"Vault not found"**
- Create vault first with `$acta create vault`
- Check you're using correct wallet address

**"Issuer not authorized"**
- Authorize issuer with `$acta authorize issuer GXXXXX`
- Confirm authorization completed

**"Insufficient balance"**
- Fund testnet wallet: https://laboratory.stellar.org/#account-creator?network=test
- Mainnet: Add real XLM

## 10. Next Steps

- Read `SKILL.md` for complete workflow
- Explore `references/` for detailed documentation
- Try example React components in `assets/examples/`
- Join Discord: https://discord.gg/DsUSE3aMDZ

## Resources

- **Website:** https://acta.build
- **Documentation:** https://docs.acta.build
- **dApp:** https://dapp.acta.build
- **GitHub:** https://github.com/ACTA-Team
- **Discord:** https://discord.gg/DsUSE3aMDZ

---

**Need help?** Ask in the skill:

```
$acta I'm stuck with [your issue]
```

The skill will guide you through troubleshooting!
