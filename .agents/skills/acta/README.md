# acta.build Verifiable Credentials Skill

Guide developers through integrating acta.build's W3C Verifiable Credentials 2.0 infrastructure on Stellar blockchain.

## Installation

Install this skill using the Claude Code CLI:

```bash
npx skills add wlademyr/acta-skill
```

Or clone and use locally:

```bash
git clone https://github.com/wlademyr/acta-skill
cd acta-skill
npx skills add .
```

## Usage

Invoke the skill with:

```
$acta help me issue a credential
$acta verify this credential
$acta set up a vault
```

Or implicitly by mentioning verifiable credentials or acta.build in your query.

## Prerequisites

- Node.js 18+
- React 16.8+ (for React SDK integration)
- Freighter wallet (for testnet operations)
- API key from https://dapp.acta.build

## Features

- ✅ **Credential Issuance** - Issue W3C VC 2.0 credentials on Stellar
- ✅ **Credential Verification** - Verify credential authenticity and validity
- 🔐 **Vault Management** - Create and manage encrypted credential vaults
- 🛡️ **Security Guardrails** - Mandatory confirmations and best practices
- 📝 **Code Examples** - Working React SDK integration examples
- 🧪 **Helper Scripts** - API testing and credential validation tools

## Documentation

See `SKILL.md` for the complete workflow and safety rules.

Reference documentation in `references/`:
- `platform-overview.md` - acta.build architecture
- `react-sdk-reference.md` - Complete SDK documentation
- `credential-lifecycle.md` - Issue, verify, revoke workflows
- `vault-management.md` - Vault setup and operations
- `security-best-practices.md` - Key management and safety

## License

MIT License - see LICENSE file for details.

## Links

- acta.build: https://acta.build
- Documentation: https://docs.acta.build
- Live dApp: https://dapp.acta.build
- GitHub: https://github.com/ACTA-Team
- Discord: https://discord.gg/DsUSE3aMDZ
