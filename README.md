    # 🌏-Big-world-Bigger-ideas-🗺️

<div align="center">

![GitHub Owner](https://img.shields.io/badge/Owner-kushmanmb-blue?style=for-the-badge&logo=github)
![Creator](https://img.shields.io/badge/Creator-Matthew%20Brace-purple?style=for-the-badge&logo=github)
![Maintained](https://img.shields.io/badge/Maintained-Yes-green?style=for-the-badge)
![Focus](https://img.shields.io/badge/Focus-Blockchain-orange?style=for-the-badge&logo=ethereum)
[![Deploy](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/actions/workflows/deploy.yml/badge.svg)](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/actions/workflows/deploy.yml)

[![npm version](https://img.shields.io/npm/v/big-world-bigger-ideas?style=flat-square)](https://www.npmjs.com/package/big-world-bigger-ideas)
[![Profile](https://img.shields.io/badge/Profile-kushmanmb.org-informational?style=flat-square&logo=ethereum)](https://kushmanmb.org)
[![ENS](https://img.shields.io/badge/ENS-kushmanmb.eth-9cf?style=flat-square&logo=ethereum)](https://app.ens.domains/name/kushmanmb.eth)
[![Email](https://img.shields.io/badge/Contact-kushmanmb@gmx.com-red?style=flat-square&logo=gmail)](mailto:kushmanmb@gmx.com)

[![Tests](https://img.shields.io/badge/Tests-Passing-success?style=flat-square&logo=github-actions)](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/actions)
[![Security](https://img.shields.io/badge/Security-No%20Vulnerabilities-success?style=flat-square&logo=github)](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/security)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)

</div>

---

## 👤 Ownership & Attribution

**Created by:** [Matthew Brace (kushmanmb)](https://github.com/kushmanmb)  
**Organization:** [kushmanmb-org](https://github.com/kushmanmb-org)  
**Email:** kushmanmb@gmx.com  
**ENS:** kushmanmb.eth  

This repository is the original work and intellectual property of Matthew Brace. All blockchain utilities, crypto clarity tools, and documentation contained herein were created, designed, and maintained by the owner.

### Verification

- ✅ **Creator Verified**: Matthew Brace (kushmanmb)
- ✅ **Organization Verified**: kushmanmb-org
- ✅ **Repository Ownership**: Confirmed and documented
- ✅ **Commit History**: All contributions tracked and verified
- ✅ **NPM Package**: Published and maintained by author

---

## 📦 NPM Package Installation & Usage

This package is available on npm as `big-world-bigger-ideas`, providing comprehensive blockchain utilities and crypto clarity tools.

### Installation

```bash
npm install big-world-bigger-ideas
```

### Quick Start

```javascript
// Import the entire package
const bigWorld = require('big-world-bigger-ideas');

// Or import specific modules
const { 
  ERC721Fetcher, 
  BitcoinMiningFetcher,
  BlockchairFetcher,
  EthereumBlockchairFetcher,
  EtherscanTokenBalanceFetcher,
  HelloBitcoin,
  TokenUUID,
  OPReturnFetcher,
  ZKPDFVerifier,
  ConsensusTracker,
  AddressTracker,
  BlockchainCouncil
} = require('big-world-bigger-ideas');

// Example: Fetch ERC-721 NFT data
const nftFetcher = new ERC721Fetcher('0x1234...abcd');
const owner = await nftFetcher.getOwner('1');

// Example: Track Bitcoin mining data
const btcFetcher = new BitcoinMiningFetcher();
const miningData = await btcFetcher.getHashRate('1w');

// Example: OP_RETURN data encoding for blockchain
const opReturn = new OPReturnFetcher('bitcoin');
const encoded = opReturn.encodeData('Hello Blockchain!');
const script = opReturn.createOpReturnScript('Timestamped data');

// Example: Multi-chain blockchain data with Blockchair
const blockchair = new BlockchairFetcher('bitcoin');
const blockData = await blockchair.getBlock(700000);

// Example: Ethereum blockchain data with ENS support
const ethBlockchair = new EthereumBlockchairFetcher();
const addressData = await ethBlockchair.getAddressData('0x1234...');

// Example: Token balance checking with Etherscan
const etherscan = new EtherscanTokenBalanceFetcher('your-api-key');
const balance = await etherscan.getTokenBalance('0xAddress...', '0xTokenContract...');

// Example: Generate UUIDs for tokens
const tokenUUID = new TokenUUID();
const uuid = tokenUUID.generateForToken('0xContract...', '1');

// Example: Hello Bitcoin greeting
const hello = new HelloBitcoin('World');
console.log(hello.greet()); // "Hello Bitcoin from World! 🌍"

// Example: Blockchain governance with council
const council = new BlockchainCouncil('DAO Council');
council.addMember('0x1234...', 'Alice', MEMBER_ROLES.FOUNDER);
const proposal = council.createProposal('0x1234...', 'Upgrade Protocol', 'Details...');

// Example: Zero-knowledge PDF verification
const zkVerifier = new ZKPDFVerifier('your-name');
const doc = zkVerifier.registerDocument('doc-id', pdfBuffer, { title: 'My Document' });
```

### 🚀 Blockchain RPC Server

> **🌟 New!** Python-based JSON-RPC server for easy HTTP access to blockchain data!
>
> Start the server: `python3 blockchain_rpc_server.py`
>
> Query blockchain data via HTTP/JSON-RPC for Ethereum, Bitcoin, NFTs, and more.
>
> Learn more: [BLOCKCHAIN-RPC-SERVER.md](./BLOCKCHAIN-RPC-SERVER.md)

### 📚 Interactive Documentation

> **🌟 New!** Explore our comprehensive Mintlify documentation with interactive examples, searchable API references, and step-by-step guides.
>
> **Run locally:** `npm run docs:dev`
>
> Learn more: [MINTLIFY.md](./MINTLIFY.md)

### Available Modules

This package includes the following modules organized by category:

**Wallet & Configuration:**
- **`wallet`** - Wallet encryption and decryption utilities
- **`featureFlags`** - Feature flag management system

**NFT & Token Utilities:**
- **`ERC721Fetcher`** - ERC-721 NFT token data fetcher
- **`TokenHistoryTracker`** - Git-style NFT ownership history tracker
- **`TokenUUID`** - UUID generation and validation for blockchain tokens and NFTs

**Blockchain Data Fetchers:**
- **`BitcoinMiningFetcher`** - Bitcoin mining data from mempool.space
- **`BlockchairFetcher`** - Multi-chain blockchain data fetcher for Bitcoin, Ethereum, Litecoin, and more
- **`LitecoinBlockchairFetcher`** - Litecoin blockchain data from Blockchair
- **`EthereumBlockchairFetcher`** - Ethereum blockchain data from Blockchair with ENS support
- **`EtherscanTokenBalanceFetcher`** - ERC-20 and ERC-721 token balance fetcher from Etherscan

**Network & Consensus:**
- **`ConsensusTracker`** - Blockchain consensus mechanism tracker
- **`AddressTracker`** - Multi-chain address tracking and management

**Contract Utilities:**
- **`ContractABIFetcher`** - Contract ABI fetcher
- **`EthCallClient`** - Ethereum eth_call RPC client
- **`OPReturnFetcher`** - OP_RETURN data encoding/decoding across Bitcoin, Litecoin, and Ethereum

**Governance & Compliance:**
- **`BlockchainCouncil`** - Governance and council management for DAOs
- **`ISO27001Fetcher`** - ISO 27001 certification management
- **`WithdrawalCredentials`** - Ethereum withdrawal credentials management

**Advanced Features:**
- **`ZKPDFVerifier`** - Zero-knowledge PDF verification system
- **`PackageMetadata`** - Metadata processing utilities

**Helper Utilities:**
- **`HelloBitcoin`** - Simple Bitcoin greeting module for getting started

### Package Structure

The published package includes only the essential files (60.6 kB):
- Main entry point (`index.js`)
- Core JavaScript modules (`src/*.js`)
- Module documentation (`src/*.md`)
- Main README

Test files, examples, and development files are excluded from the npm package to keep it lightweight.

### Publishing to NPM

**For maintainers:** This package uses automated GitHub Actions workflow for publishing to npm.

**Quick publish:**
1. Update version: `npm run version:patch` (or `version:minor`, `version:major`)
2. Push changes: `git push origin main --follow-tags`
3. Create a GitHub release with the version tag
4. The workflow automatically publishes to npm

**For detailed publishing instructions, see [PUBLISHING.md](./PUBLISHING.md)** which covers:
- Automated publishing via GitHub releases
- Manual workflow dispatch
- Version management
- Pre-publish checks
- Troubleshooting

Tests run automatically before every publish to ensure quality.

---

## 🔨 Smart Contracts & Build Configuration

This repository includes Solidity smart contracts with a comprehensive build configuration using **Foundry**, a modern Ethereum development framework.

### 📄 Available Contracts

The `contracts/` directory contains production-ready smart contracts:

- **`Proxy.sol`** - EIP-1967 transparent proxy for upgradeable contracts
- **`MultiOwnable.sol`** - Multi-owner authentication with address and public key support
- **`Receiver.sol`** - Abstract contract for receiving ERC-721 and ERC-1155 tokens
- **`SignatureCheckerLib.sol`** - Signature verification utilities

### 🛠️ Build Configuration

The project uses **Foundry** for smart contract development with highly optimized settings:

- **Compiler Version:** Solidity 0.8.20
- **Optimizer:** Enabled with **999,999 runs** (optimized for runtime efficiency)
- **EVM Version:** Paris (post-merge Ethereum)
- **Build Framework:** Foundry

**Configuration Files:**
- `foundry.toml` - Primary Foundry configuration
- `remappings.txt` - Dependency path mappings
- `solc-settings.json` - Standard JSON compiler settings

### 📚 Dependencies

Pre-configured with industry-standard libraries:
- OpenZeppelin Contracts
- Solady (gas-optimized contracts)
- Forge Standard Library
- Account Abstraction (ERC-4337)
- WebAuthn verification
- P256 signature verification

### 🚀 Building Contracts

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install

# Compile contracts
forge build

# Run tests (when available)
forge test
```

### 📖 Documentation

#### 🌐 Interactive Documentation Portal

This project features a comprehensive **Mintlify documentation portal** with interactive examples, API references, and guides:

- **📚 Interactive Docs**: Modern, searchable documentation with live code examples
- **🚀 Quick Start**: Get started in under 5 minutes
- **📖 API Reference**: Detailed documentation for all modules
- **📝 Guides**: Best practices, ChatOps, security, and more

**Run Documentation Locally:**

```bash
# Install dependencies
npm install

# Start the documentation server
npm run docs:dev
```

**Documentation Structure:**
- **[MINTLIFY.md](./MINTLIFY.md)** - Mintlify setup and usage guide
- **[introduction.mdx](./introduction.mdx)** - Documentation homepage
- **[quickstart.mdx](./quickstart.mdx)** - Quick start guide
- **[installation.mdx](./installation.mdx)** - Installation instructions
- **[api-reference/](./api-reference/)** - Complete API documentation
- **[guides/](./guides/)** - User guides and best practices

#### 📚 Build & Contract Documentation

For detailed build configuration, compilation settings, and deployment instructions, see:
- **[BUILD.md](./BUILD.md)** - Comprehensive build documentation
- **[contracts/README.md](./contracts/README.md)** - Contract-specific documentation

### ✅ Verified Deployments

**Base Network (Chain ID: 8453)**
- Contract: Proxy.sol
- Address: `0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43`
- Verified: [View on Basescan](https://basescan.org/address/0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43)

---

## 🔐 Security & Branch Protection

This repository implements comprehensive security measures to protect sensitive data and maintain code quality.

### 🛡️ Private Key & Credential Protection

**CRITICAL SECURITY NOTICE**: This repository follows strict security practices to protect private keys and sensitive data:

- ✅ **No hardcoded private keys** in source code
- ✅ **No hardcoded API keys** - all use environment variables
- ✅ **Environment variables** for all sensitive configuration (`.env` files)
- ✅ **Comprehensive .gitignore** prevents accidental commits of credentials
- ✅ **Wallet encryption utilities** use secure algorithms (AES-256-CBC with PBKDF2)
- ✅ **Example files** use placeholder values, never real credentials
- ✅ **Security.md** documents best practices and reporting procedures
- ✅ **Regular security audits** via npm audit and CodeQL
- ✅ **Security-Guide.md** comprehensive developer security guide

**Best Practices for Users:**

```javascript
// ❌ NEVER DO THIS
const privateKey = '0x1234567890abcdef...'; // Hardcoded private key
const apiKey = 'sk_live_1234567890abcdef'; // Hardcoded API key

// ✅ ALWAYS DO THIS
require('dotenv').config();
const privateKey = process.env.PRIVATE_KEY; // From environment variable
const apiKey = process.env.ETHERSCAN_API_KEY; // From environment variable

// ✅ OR USE WALLET ENCRYPTION
const Wallet = require('./src/wallet.js');
const wallet = new Wallet();
wallet.generate();
const encrypted = wallet.encrypt(process.env.PASSWORD);
```

### 🔧 Environment Variables Setup

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Add your actual values**:
   ```bash
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   BLOCKCHAIR_API_KEY=your_blockchair_api_key_here
   ```

3. **Never commit `.env` files** (already in `.gitignore`)

### 📚 Security Documentation

- **[SECURITY.md](./SECURITY.md)** - Vulnerability disclosure policy and security guidelines
- **[SECURITY-GUIDE.md](./SECURITY-GUIDE.md)** - Comprehensive security best practices for developers
- **[SECURITY-AUDIT-2026-02-25.md](./SECURITY-AUDIT-2026-02-25.md)** - Latest security audit report (February 2026)
- **[PRE-COMMIT-HOOKS-SETUP.md](./PRE-COMMIT-HOOKS-SETUP.md)** - Guide to prevent accidental secret commits
- **[PACKAGE-MANAGER-SECURITY.md](./PACKAGE-MANAGER-SECURITY.md)** - Package manager credential security guide (npm, RubyGems, pip)
- **[.env.example](./.env.example)** - Template for environment variables

### 🔍 Security Audit History

- **2026-02-25**: Comprehensive blockchain data leak audit completed ✅
  - ✅ **No sensitive data leaks detected** - Private keys, API keys, and passwords verified secure
  - ✅ **Git history clean** - No accidentally committed secrets found
  - ✅ **Exceptional .gitignore** - 220+ patterns protecting sensitive files
  - ✅ **All tests passing** - 100% of security-critical modules tested
  - ✅ **Security documentation complete** - Added SECURITY.md and audit reports
  - ✅ **Pre-commit hooks guide** - Created setup guide to prevent future leaks
  - ⚠️ **Dependency updates needed** - 28 vulnerabilities in dev dependencies (low risk)
  - **Security Grade: A (Excellent)** - No critical issues, production-ready

- **2026-02-24**: Initial security audit completed
  - ✅ Removed hardcoded Etherscan API key from example files
  - ✅ Added security documentation (SECURITY-GUIDE.md)
  - ✅ Created .env.example template
  - ✅ Added security comments to test files
  - ✅ Verified no private keys or real credentials in codebase
  - ✅ All tests pass after security fixes

### Branch Protection Rules

Branch protection rulesets are configured for:
- **Main/Master branches**: Require 1 approval, signed commits, linear history
- **Release/Hotfix branches**: Require 2 approvals, stricter review requirements

📖 **See [.github/APPLY-RULESETS.md](./.github/APPLY-RULESETS.md)** for instructions on applying these rules to your repository.

### Enhanced .gitignore

The `.gitignore` file includes comprehensive patterns to prevent accidental commits of:
- 🔑 Private keys and certificates (*.key, *.pem, *.p12, *.pfx)
- 🔐 SSH keys (id_rsa, id_ed25519, authorized_keys)
- 🔒 Environment variables and secrets (.env, .env.*, secrets.*)
- 💰 Blockchain wallet files (keystore, UTC--, *.wallet)
- ☁️ Cloud provider credentials (AWS, GCP, Azure keys)
- 🗄️ Database credentials (*.sql with passwords, connection strings)
- 📝 Log files with sensitive data (*.log with credentials)

📖 **See [.github/SECURITY.md](./.github/SECURITY.md)** for complete security documentation and best practices.

---

## 🌐 Website Deployment

The project website is automatically deployed to **[kushmanmb.org](https://kushmanmb.org)** using GitHub Pages.

### Deployment Workflow

The repository uses GitHub Actions to automatically deploy the frontend when changes are pushed to the `main` branch.

**Workflow:** `.github/workflows/deploy.yml`

**Features:**
- 🚀 Automatic deployment on push to main
- 🧪 Runs full test suite before deployment
- 📦 Deploys static HTML, CSS, and JavaScript files
- ✅ Manual deployment trigger available via GitHub Actions

### Local Development

To work on the website locally:

```bash
# Install dependencies
npm ci

# Build the deployment package (runs tests, builds CSS, prepares files)
npm run deploy

# For editor preview, you can use any HTTP server
python3 -m http.server 8000

# Then visit http://localhost:8000
```

### Local Deployment Testing

You can test the deployment process locally using:

```bash
npm run deploy
```

This command will:
- ✅ Run all tests to ensure code quality
- 🎨 Build optimized CSS with Tailwind
- 📦 Prepare deployment package in `_site/` directory
- 🚀 Create the same structure that GitHub Actions deploys

The `_site/` directory will contain all files ready for deployment, allowing you to verify the deployment package before pushing to GitHub.

### Files Deployed

- `index.html` - Main documentation page
- `editor.html` - Interactive web editor
- `BeyondGlobal.html` - BeyondGlobal branding page
- `styles.css` - Main stylesheet
- `dist/output.css` - Compiled Tailwind CSS
- All JavaScript modules (`src/`)
- Smart contracts (`contracts/`)
- Supporting documentation files

📖 **For complete deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)**  
📖 **For GitHub Pages setup instructions, see [.github/PAGES-SETUP.md](./.github/PAGES-SETUP.md)**

---

## 🔐 Zero-Knowledge PDF Verification (zkpdf)

This repository includes a powerful zero-knowledge proof-based PDF verification system that enables document authentication and integrity verification without revealing document contents.

### Quick Start

```javascript
const ZKPDFVerifier = require('./src/zkpdf.js');

// Create a verifier instance
const verifier = new ZKPDFVerifier('kushmanmb');

// Register a PDF document
const doc = verifier.registerDocument(
  'contract-001',
  pdfContentBuffer,
  { title: 'Service Agreement', type: 'application/pdf' }
);

// Generate a zero-knowledge proof
const proof = verifier.generateProof('contract-001', {
  contractSigned: true,
  authorized: true
});

// Verify the proof
const verification = verifier.verifyProof(proof.proofId);
console.log(`Proof is ${verification.isValid ? 'VALID' : 'INVALID'}`);

// Submit for verification
const submission = verifier.submitForVerification('contract-001', {
  type: 'integrity-check',
  requester: 'legal-department'
});
```

### Features

- 📄 **Document Registration**: Register PDF documents with cryptographic hashing
- 🔑 **Zero-Knowledge Proofs**: Generate proofs that verify document properties without revealing content
- ✅ **Proof Verification**: Verify proofs to confirm document authenticity and integrity
- 📤 **Submission Workflow**: Submit documents for verification with metadata tracking
- 📊 **Multi-Document Support**: Manage and track multiple documents simultaneously
- 💾 **Metadata Management**: Store and retrieve document metadata securely
- 🔒 **Commitment Schemes**: Use cryptographic commitments for proof generation

### Available Functions

- `registerDocument(documentId, documentData, metadata)` - Register a PDF document for verification
- `generateProof(documentId, claims)` - Generate a zero-knowledge proof
- `verifyProof(proofId, verificationData)` - Verify a zero-knowledge proof
- `submitForVerification(documentId, submissionData)` - Submit document for verification
- `getDocumentInfo(documentId)` - Get information about a registered document
- `getProofInfo(proofId)` - Get information about a proof
- `listDocuments()` - List all registered documents
- `listProofs()` - List all generated proofs
- `getStatistics()` - Get verifier statistics
- `formatDocumentInfo(docInfo)` - Format document info for display
- `formatProofInfo(proofInfo)` - Format proof info for display
- `formatVerificationResult(result)` - Format verification result for display

### Use Cases

**Confidential Contract Verification:**
Prove that a signed contract exists without revealing its terms.

**Document Integrity Checking:**
Verify document hasn't been tampered with using cryptographic hashes.

**Compliance & Audit Trail:**
Create verifiable audit trail for compliance requirements.

**Multi-Party Document Verification:**
Multiple parties verify document validity without sharing it.

### Testing & Demo

```bash
npm run test:zkpdf    # Run zkpdf tests
npm run zkpdf:demo    # See the zkpdf verifier in action
```

### Documentation

For complete documentation, see [src/ZKPDF.md](./src/ZKPDF.md)

### How It Works

1. **Document Hashing**: SHA-256 hash computed for each registered document
2. **Commitment Generation**: Cryptographic commitment created using hash, timestamp, and nonce
3. **Proof Creation**: Proof includes commitment and claims about the document
4. **Verification**: Anyone can verify the proof without seeing the original document

### Example Output

```
Zero-Knowledge Proof
================================

Proof ID: 9d4a38a130a405dea20df34d159ba5d0
Document ID: contract-2024-001
Document Hash: fc84c91ae2d656a1fbf94a19b1c78a01...
Commitment: 13c50dcae15097461e9193d0963566ee...
Created: 2026-02-21T19:19:58.611Z

Claims:
  owner: kushmanmb
  documentExists: true
  integrityVerified: true
  contractSigned: true
```

---

## 🏆 ISO/IEC 27001:2013 Certification

This repository includes comprehensive tools for tracking and managing ISO/IEC 27001:2013 Information Security Management System (ISMS) certification compliance.

### Quick Start

```javascript
const ISO27001Fetcher = require('./src/iso27001.js');

// Create a fetcher instance for kushmanmb
const fetcher = new ISO27001Fetcher('kushmanmb');

// Get certification information
const info = fetcher.getCertificationInfo();
console.log(fetcher.formatCertificationInfo(info));

// Get compliance status
const status = fetcher.getComplianceStatus();
console.log(`Compliance: ${status.percentage}%`);

// Generate compliance report
const report = fetcher.generateComplianceReport();
console.log(report);
```

### Features

- 📋 **Comprehensive Tracking**: Full ISO 27001:2013 standard coverage with all 7 main clauses (4-10)
- 🔒 **114 Security Controls**: Track implementation across 14 Annex A control domains
- 📊 **Compliance Reporting**: Generate detailed reports and status summaries
- ✅ **Repository-Specific**: Track security measures specific to this blockchain repository
- 💾 **Smart Caching**: Automatic caching with 1-hour timeout
- 📈 **Progress Monitoring**: Track implementation progress and compliance percentage
- 🎯 **Recommendations**: Get actionable recommendations based on compliance status

### Standard Coverage

**Main Clauses (4-10):**
- Context of the Organization
- Leadership
- Planning
- Support
- Operation
- Performance Evaluation
- Improvement

**Annex A Control Domains:**
- Information Security Policies (A.5)
- Organization of Information Security (A.6)
- Human Resource Security (A.7)
- Asset Management (A.8)
- Access Control (A.9)
- Cryptography (A.10)
- Physical and Environmental Security (A.11)
- Operations Security (A.12)
- Communications Security (A.13)
- System Development and Maintenance (A.14)
- Supplier Relationships (A.15)
- Incident Management (A.16)
- Business Continuity (A.17)
- Compliance (A.18)

### Repository Compliance Status

Current compliance areas for this repository:

| Area | Status | Description |
|------|--------|-------------|
| ✓ Cryptography | Compliant | Wallet encryption/decryption utilities implemented |
| ✓ Access Control | Compliant | Branch protection rules and secure authentication |
| ✓ Operations Security | Compliant | Secure development practices and code review |
| ✓ Information Security Policies | Compliant | Security documentation and policies in place |
| ✓ Communications Security | Compliant | Secure blockchain network communications |
| ✓ System Development | Compliant | Secure coding practices and testing infrastructure |
| ○ Asset Management | In Progress | Enhanced .gitignore for sensitive data protection |

**Current Compliance: 84%** (96 of 114 controls implemented)

### Available Functions

- `getCertificationInfo()` - Get comprehensive certification information
- `getComplianceStatus()` - Get compliance status summary with percentages
- `getControlStatus()` - Get detailed control implementation by domain
- `generateComplianceReport()` - Generate full compliance report
- `formatCertificationInfo()` - Format certification data for display
- `clearCache()` - Clear cached data
- `getCacheStats()` - Get cache statistics

### Testing & Demo

```bash
npm run test:iso27001    # Run ISO 27001 certification tests
npm run iso27001:demo    # See the certification fetcher in action
```

### Documentation

For complete documentation, see [src/ISO27001.md](./src/ISO27001.md)

### Example Output

```
ISO/IEC 27001:2013 Certification Information
Owner: kushmanmb
======================================================================

Standard: ISO/IEC 27001:2013
Name: Information Security Management System (ISMS)
Status: In Progress

Compliance Status:
  Total Controls: 114
  Implemented: 96
  Compliance: 84%
  Overall Status: Good
```

### Benefits

- ✓ Demonstrates commitment to information security
- ✓ Builds trust with stakeholders and customers
- ✓ Improves security posture and reduces risk
- ✓ Ensures compliance with legal and regulatory requirements
- ✓ Provides competitive advantage in the market
- ✓ Establishes systematic approach to security management
- ✓ Facilitates continuous improvement
- ✓ Reduces likelihood of security breaches

---

## 🌐 Web Interface

This repository includes a comprehensive web interface for viewing and editing blockchain documentation.

**Main Files:**
- `index.html` - Main HTML page with blockchain documentation and navigation
- `editor.html` - Interactive web editor with live preview
- `styles.css` - Stylesheet with background image configuration

### 🖊️ Web Editor

The **Web Editor** (`editor.html`) is a powerful, browser-based tool for creating and editing blockchain documentation, smart contracts, and markdown files.

**Features:**
- ✨ **Live Preview**: Real-time markdown rendering as you type
- 📝 **Templates**: Pre-built templates for blockchain docs, smart contracts, README files, and markdown guides
- 💾 **Export Options**: Download files or copy to clipboard
- 📊 **Character/Word Counter**: Live tracking of document length
- 🎨 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 👁️ **Dual-Pane View**: Side-by-side editor and preview panels
- 🚩 **Feature Flags Integration**: Dynamic theming and UI based on feature flags

**Feature Flags Support:**

The web editor integrates with the repository's feature flags system to enable dynamic features:

- **🌙 Dark Mode** (`dark_mode` flag): When enabled, applies a dark theme to the entire editor interface
  - Dark background colors for reduced eye strain
  - Syntax-highlighted code blocks with dark theme
  - Optimized contrast for better readability
  
- **✨ New UI** (`new_ui` flag): When enabled, applies enhanced UI styling
  - Refined typography and spacing
  - Enhanced visual polish
  - Modern design elements

**To enable feature flags:**

1. Edit `feature-flags.json` in the repository root
2. Set the desired flag to `"enabled": true`
3. Reload the editor in your browser

Example `feature-flags.json`:
```json
{
  "flags": {
    "dark_mode": {
      "enabled": true,
      "updatedAt": "2026-02-24T16:30:00.000Z"
    },
    "new_ui": {
      "enabled": true,
      "updatedAt": "2026-02-24T16:30:00.000Z"
    }
  }
}
```

The editor will automatically load and apply the flags when the page loads. Active features are displayed in the header.

**To use the web editor:**
1. Open `editor.html` in a web browser
2. Select a template from the dropdown or start typing
3. Watch the live preview update automatically
4. Download your work or copy to clipboard

**Background Image Configuration:**
The web interface is configured with a custom background image located at:
`C:\Users\mattb\iCloudPhotos\Photos\IMG_0032.HEIC`

**Important Notes:**
- The configured path is an absolute Windows file path that only works on the local machine
- HEIC format has limited browser support (primarily Safari)
- For production deployment, consider:
  - Converting the image to JPEG, PNG, or WebP format
  - Using a relative path (e.g., `./images/background.jpg`)
  - Hosting the image on a web server or CDN

**To view the web interface:**
1. Open `index.html` in a web browser to see documentation
2. Click "Open Web Editor →" to launch the editor
3. Or run a local web server: `python3 -m http.server 8000` and navigate to `http://localhost:8000`

---

## ₿ Bitcoin Mining Block Rewards

This repository includes a powerful Bitcoin mining data fetcher that provides real-time and historical mining statistics from the mempool.space API.

### Quick Start

```javascript
const BitcoinMiningFetcher = require('./src/bitcoin-mining.js');

// Create a fetcher instance
const fetcher = new BitcoinMiningFetcher();

// Fetch 1-day block rewards
const rewards = await fetcher.getBlockRewards('1d');
console.log(fetcher.formatBlockRewards(rewards));

// Get mining pool statistics
const pools = await fetcher.getMiningPools('1w');

// Get network hashrate
const hashrate = await fetcher.getHashrate('1w');

// Get difficulty adjustments
const difficulty = await fetcher.getDifficultyAdjustment();
```

### Features

- 📊 **Block Rewards**: Fetch historical block reward data for various time periods
- ⛏️ **Mining Pools**: Get statistics about mining pool performance and market share
- 💪 **Hashrate Data**: Access network hashrate information over time
- 🎯 **Difficulty Adjustments**: Track Bitcoin network difficulty changes
- 💾 **Smart Caching**: Automatic caching with configurable timeout (default: 60 seconds)
- 📝 **Data Formatting**: Built-in formatting utilities for display
- ✅ **Error Handling**: Robust error handling with informative messages

### Available Functions

- `getBlockRewards(period)` - Fetch mining block rewards for a time period ('1d', '3d', '1w', '1m', '3m', '6m', '1y', '2y', '3y', 'all')
- `getMiningPools(period)` - Get mining pool statistics
- `getHashrate(period)` - Get network hashrate data
- `getDifficultyAdjustment()` - Get difficulty adjustment information
- `formatBlockRewards(data)` - Format data for display
- `clearCache()` - Clear cached data
- `getCacheStats()` - Get cache statistics

### Testing & Demo

```bash
npm run test:bitcoin-mining     # Run Bitcoin mining tests
npm run bitcoin-mining:demo     # See the Bitcoin mining fetcher in action
```

### Documentation

For complete documentation, see [src/BITCOIN-MINING.md](./src/BITCOIN-MINING.md)

### Example Output

```
Bitcoin Mining Block Rewards
================================

Total entries: 144

Entry 1:
  Average Rewards: 6.25 BTC
  Timestamp: 2024-02-21T00:00:00.000Z
  Total Rewards: 625 BTC
  Block Count: 100

Entry 2:
  Average Rewards: 6.24 BTC
  Timestamp: 2024-02-21T01:00:00.000Z
  Total Rewards: 624 BTC
  Block Count: 100
```

---

## 🪙 Litecoin Blockchair

This repository includes a comprehensive Litecoin blockchain data fetcher that provides real-time and historical blockchain statistics from the Blockchair API.

### Quick Start

```javascript
const LitecoinBlockchairFetcher = require('./src/litecoin-blockchair.js');

// Create a fetcher instance
const fetcher = new LitecoinBlockchairFetcher();

// Fetch blockchain statistics
const stats = await fetcher.getStats();
console.log(fetcher.formatStats(stats));

// Get specific block information
const block = await fetcher.getBlock(2500000);
console.log(fetcher.formatBlock(block));

// Get address information
const address = await fetcher.getAddress('LhKTpQgfcNPy3aL4xG3HCVc8mXb9qTbKJ1');
console.log(fetcher.formatAddress(address));

// Get recent blocks
const recentBlocks = await fetcher.getRecentBlocks(10);
```

### Features

- 📊 **Blockchain Statistics**: Comprehensive Litecoin blockchain stats including block count, transactions, and market data
- 🧱 **Block Information**: Get detailed information about specific blocks by height or hash
- 💼 **Address Data**: Query address balances, transaction counts, and history
- 📝 **Transaction Details**: Access detailed transaction information
- 📚 **Recent Blocks**: Fetch the most recent blocks on the blockchain
- 💾 **Smart Caching**: Automatic caching with configurable timeout (default: 60 seconds)
- ✅ **Validation**: Robust input validation for addresses and transaction hashes
- 📋 **Data Formatting**: Built-in formatting utilities for display

### Available Functions

- `getStats()` - Fetch general Litecoin blockchain statistics
- `getBlock(blockId)` - Get information about a specific block (by height or hash)
- `getAddress(address)` - Get address information (balance, transactions)
- `getTransaction(txHash)` - Get transaction details
- `getRecentBlocks(limit)` - Fetch recent blocks (1-100)
- `formatStats(data)` - Format statistics for display
- `formatBlock(data)` - Format block information for display
- `formatAddress(data)` - Format address information for display
- `clearCache()` - Clear cached data
- `getCacheStats()` - Get cache statistics

### Testing & Demo

```bash
npm run test:litecoin-blockchair     # Run Litecoin Blockchair tests
npm run litecoin-blockchair:demo     # See the Litecoin fetcher in action
```

### Documentation

For complete documentation, see [src/LITECOIN-BLOCKCHAIR.md](./src/LITECOIN-BLOCKCHAIR.md)

### Example Output

```
Litecoin Blockchain Statistics
================================

Latest Block: 2,500,000
Total Transactions: 50,000,000
Circulating Supply: 70,000,000 LTC
Difficulty: 15,000,000
24h Hashrate: 500 TH/s
Blockchain Size: 46.57 GB
Network Nodes: 1500
Market Price: $75.50 USD
Market Cap: $5500.00M USD
```

---

## 🔗 Consensus Mechanism Tracker

This repository includes a comprehensive consensus mechanism tracker that monitors Proof of Work (PoW) and Proof of Stake (PoS) across multiple blockchain networks.

### Quick Start

```javascript
const { ConsensusTracker } = require('./src/consensus-tracker.js');

// Create a consensus tracker
const tracker = new ConsensusTracker();

// Get all Proof of Work networks
const powNetworks = tracker.getPowNetworks();
console.log(`PoW: ${powNetworks.map(n => n.name).join(', ')}`);

// Get all Proof of Stake networks
const posNetworks = tracker.getPosNetworks();
console.log(`PoS: ${posNetworks.map(n => n.name).join(', ')}`);

// Compare networks
const comparison = tracker.compareNetworks('bitcoin', 'ethereum');
console.log(`Consensus: ${comparison.consensus.join(' vs ')}`);
```

### Supported Networks

**Proof of Work (PoW):**
- Bitcoin (SHA-256)
- Litecoin (Scrypt)

**Proof of Stake (PoS):**
- Ethereum (Post-Merge)
- Ethereum Beacon Chain
- Base (Layer 2)
- Polygon

### Features

- 🔍 **Multi-Chain Support**: Track consensus across Bitcoin, Ethereum, Base, Litecoin, Polygon, and more
- ⚡ **PoW/PoS Classification**: Easily identify which networks use Proof of Work vs Proof of Stake
- 📊 **Network Comparison**: Compare consensus mechanisms, block times, and energy efficiency
- 📈 **Statistics**: Get comprehensive statistics about tracked networks
- 🌐 **Network Details**: Access detailed information about each blockchain's consensus mechanism

### Available Functions

- `getNetworkInfo(networkName)` - Get detailed network information
- `getPowNetworks()` - Get all Proof of Work networks
- `getPosNetworks()` - Get all Proof of Stake networks
- `getAllNetworks()` - Get all tracked networks
- `getConsensusStatistics()` - Get comprehensive statistics
- `compareNetworks(network1, network2)` - Compare two networks
- `isProofOfWork(networkName)` - Check if network uses PoW
- `isProofOfStake(networkName)` - Check if network uses PoS
- `getConsensusSummary()` - Get formatted consensus summary

### Testing & Demo

```bash
npm run test:consensus-tracker      # Run consensus tracker tests
npm run consensus-tracker:demo      # See the tracker in action
```

### Documentation

For complete documentation, see [src/CONSENSUS-TRACKER.md](./src/CONSENSUS-TRACKER.md)

### Example Output

```
Blockchain Consensus Mechanism Summary
==================================================

Total Networks Tracked: 6
Average Block Time: 128 seconds

Consensus Distribution:
  Proof of Work (PoW): 2 networks
    - Bitcoin, Litecoin
  
  Proof of Stake (PoS): 4 networks
    - Ethereum, Ethereum Beacon Chain, Base, Polygon

Energy Profile:
  Energy Efficient: 4 networks
  Energy Intensive: 2 networks
```

---

## 📍 Crypto Address Tracker

This repository includes a powerful address tracking module for monitoring crypto addresses and owner token tracking across multiple blockchain networks.

### Quick Start

```javascript
const { AddressTracker } = require('./src/address-tracker.js');

// Create an address tracker
const tracker = new AddressTracker('kushmanmb');

// Add addresses to track
tracker.addAddress(
  '0x1234567890123456789012345678901234567890',
  'ethereum',
  'Main Ethereum Wallet'
);

// Record tokens
tracker.recordToken('0x1234567890123456789012345678901234567890', {
  tokenId: '123',
  contract: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  name: 'Bored Ape Yacht Club',
  symbol: 'BAYC'
});

// Get tokens for an address
const tokens = tracker.getTokensForAddress('0x1234567890123456789012345678901234567890');
console.log(`Tokens owned: ${tokens.length}`);

// Get statistics
const stats = tracker.getStatistics();
console.log(`Tracking ${stats.totalAddresses} addresses`);
```

### Features

- 🔍 **Multi-Chain Address Tracking**: Track addresses across Ethereum, Base, Polygon, and other networks
- 🎨 **Token Management**: Record and track NFT tokens owned by addresses
- 💸 **Transaction History**: Monitor transaction activity for tracked addresses
- 📊 **Statistics**: Get comprehensive statistics about tracked addresses
- 🏷️ **Address Labeling**: Label addresses for easy identification
- 💾 **JSON Import/Export**: Save and restore tracking data
- 🌐 **Network Organization**: Group addresses by blockchain network

### Available Functions

- `addAddress(address, network, label)` - Add an address to track
- `removeAddress(address)` - Remove an address from tracking
- `getAddress(address)` - Get information about a tracked address
- `isTracking(address)` - Check if an address is being tracked
- `getAllAddresses()` - Get all tracked addresses
- `getAddressesByNetwork(network)` - Get addresses on a specific network
- `recordToken(address, tokenInfo)` - Record a token for an address
- `recordTransaction(address, transactionInfo)` - Record a transaction
- `getTokensForAddress(address)` - Get all tokens owned by an address
- `getTransactionCount(address)` - Get transaction count for an address
- `getStatistics()` - Get comprehensive statistics

### Testing & Demo

```bash
npm run test:address-tracker      # Run address tracker tests
npm run address-tracker:demo      # See the tracker in action
```

### Documentation

For complete documentation, see [src/ADDRESS-TRACKER.md](./src/ADDRESS-TRACKER.md)

### Use Cases

- **NFT Portfolio Tracking**: Track NFT holdings across multiple addresses and chains
- **Multi-Chain Wallet Monitoring**: Monitor wallet activity across different blockchains
- **Transaction History**: Record and monitor transaction activity
- **Portfolio Export/Import**: Save and restore tracking data

---

## 🏛️ Blockchain Council Governance

This repository includes a comprehensive governance and council management module for blockchain projects, DAOs, and decentralized organizations. Manage council members, create proposals, conduct voting, and track governance outcomes.

### Quick Start

```javascript
const { BlockchainCouncil, MEMBER_ROLES, PROPOSAL_STATUS } = require('./src/blockchain-council.js');

// Create a blockchain council
const council = new BlockchainCouncil('DAO Council', {
  votingThreshold: 0.6,    // 60% approval needed
  quorumPercentage: 0.4    // 40% participation required
});

// Add council members
council.addMember(
  '0x1234567890123456789012345678901234567890',
  'Alice Johnson',
  MEMBER_ROLES.FOUNDER
);

council.addMember(
  '0x2222222222222222222222222222222222222222',
  'Bob Smith',
  MEMBER_ROLES.CORE_DEVELOPER
);

// Create a proposal
const proposal = council.createProposal(
  '0x1234567890123456789012345678901234567890',
  'Upgrade Protocol to V2',
  'Proposal to upgrade the protocol with improved features'
);

// Vote on the proposal
council.vote(proposal.id, '0x2222222222222222222222222222222222222222', 'for');

// Close voting and check outcome
const result = council.closeVoting(proposal.id);
console.log(`Proposal ${result.status}: ${result.outcome}`);

// Execute passed proposals
if (result.status === PROPOSAL_STATUS.PASSED) {
  council.executeProposal(proposal.id);
}

// Get statistics
const stats = council.getStatistics();
console.log(`Council has ${stats.activeMembers} active members`);
console.log(`${stats.totalProposals} proposals created`);
```

### Features

- 👥 **Member Management**: Add, remove, update council members with different roles
- 📝 **Proposal System**: Create and manage governance proposals
- 🗳️ **Democratic Voting**: Vote on proposals with configurable thresholds
- 🎯 **Quorum Requirements**: Set minimum participation requirements
- 📊 **Role-Based System**: Multiple roles (Founder, Core Developer, Validator, Advisor, etc.)
- 📈 **Participation Tracking**: Monitor member engagement and voting patterns
- ⚡ **Proposal Execution**: Execute passed proposals with audit trail
- 💾 **JSON Export/Import**: Save and restore council state

### Member Roles

- **Founder**: Project founders and creators
- **Core Developer**: Main protocol developers
- **Validator**: Network validators
- **Advisor**: Strategic advisors
- **Community Lead**: Community engagement leaders
- **Security Auditor**: Security researchers and auditors
- **Documentation Lead**: Documentation maintainers

### Proposal Status

- **Active**: Currently open for voting
- **Passed**: Approved by council (met threshold and quorum)
- **Rejected**: Did not meet approval requirements
- **Executed**: Passed proposal that has been executed
- **Cancelled**: Proposal cancelled before completion

### Available Functions

- `addMember(address, name, role, metadata)` - Add a council member
- `removeMember(address)` - Remove a member
- `getMember(address)` - Get member information
- `getAllMembers(filters)` - Get all members (optionally filtered)
- `updateMember(address, updates)` - Update member information
- `createProposal(creator, title, description, options)` - Create a proposal
- `vote(proposalId, voterAddress, vote)` - Cast a vote ('for', 'against', 'abstain')
- `closeVoting(proposalId)` - Close voting and determine outcome
- `executeProposal(proposalId)` - Execute a passed proposal
- `getProposal(proposalId)` - Get proposal information
- `getAllProposals(filters)` - Get all proposals (optionally filtered)
- `getStatistics()` - Get council statistics
- `getMemberParticipation(address)` - Get member participation statistics
- `toJSON()` - Export council data as JSON

### Testing & Demo

```bash
npm run test:blockchain-council      # Run blockchain council tests
npm run blockchain-council:demo      # See the council in action
```

### Documentation

For complete documentation, see [src/BLOCKCHAIN-COUNCIL.md](./src/BLOCKCHAIN-COUNCIL.md)

### Use Cases

- **DAO Governance**: Decentralized autonomous organization management
- **Protocol Governance**: Blockchain protocol upgrade decisions
- **Treasury Management**: Multi-sig treasury fund allocation voting
- **Community Voting**: Community-driven project decisions
- **Multi-Stakeholder Coordination**: Coordinating multiple parties with different roles

---

## 🤖 ChatOps & Feature Flags

This repository includes a powerful ChatOps system for managing feature flags directly from GitHub issues and pull requests.

### Quick Start

Use these commands in any issue or PR comment:

- **Enable a feature:** `/chatops run feature set <flag_name>`
- **Disable a feature:** `/chatops run feature unset <flag_name>`
- **List all flags:** `/chatops run feature list`

**Example:**
```
/chatops run feature set dark_mode
```

### Why Feature Flags?

- 🎯 Toggle features without code changes
- 🚀 Gradual feature rollouts
- 🔬 A/B testing capabilities
- 🛡️ Emergency feature disable
- 🖊️ **Web Editor Integration**: Control editor themes and UI dynamically

### Supported Feature Flags

The following feature flags are currently supported:

- **`dark_mode`**: Enables dark mode theme in the web editor
- **`new_ui`**: Enables enhanced UI styling in the web editor  
- **`test_chatops`**: Test flag for ChatOps workflow validation

### Web Editor Integration

The web editor (`editor.html`) automatically loads feature flags from `feature-flags.json` and applies them:

- When `dark_mode` is enabled, the editor switches to a dark theme
- When `new_ui` is enabled, enhanced styling is applied
- Active features are displayed in the editor header
- Changes take effect on page reload

### Documentation

For complete documentation on ChatOps and feature flags, see [CHATOPS.md](./CHATOPS.md)

### Testing

```bash
npm test                    # Run all tests
npm run test:feature-flags  # Test feature flags only
npm run feature-flags:demo  # See feature flags in action
```

---

## 🔍 Contract ABI Fetcher

This repository includes a Contract ABI Fetcher module for fetching contract ABIs (Application Binary Interfaces) from the Etherscan API.

## 🪙 Etherscan Token Balance Fetcher

This repository includes an Etherscan Token Balance Fetcher module for fetching ERC-20 and ERC-721 token balances from the Etherscan API.

### Quick Start

```javascript
const EtherscanTokenBalanceFetcher = require('./src/etherscan-token-balance');

// Create a fetcher with your API key
const fetcher = new EtherscanTokenBalanceFetcher('YOUR_ETHERSCAN_API_KEY', 1);

// Fetch token balances for an address
const address = '0x983e3660c0bE01991785F80f266A84B911ab59b0';
const balances = await fetcher.getTokenBalances(address, 1, 100);

console.log(`Total tokens: ${balances.tokens.length}`);

// Filter by token type
const erc20Tokens = EtherscanTokenBalanceFetcher.filterTokensByType(
  balances.tokens,
  'ERC-20'
);
console.log(`ERC-20 tokens: ${erc20Tokens.length}`);
```

### Features

- 🔌 **Etherscan API Integration**: Fetch token balances directly from Etherscan API v2
- ✅ **Address Validation**: Built-in Ethereum address validation
- 📄 **Pagination Support**: Handle large token lists with page and offset parameters
- 🔍 **Token Filtering**: Filter tokens by type (ERC-20, ERC-721, etc.)
- 💾 **Automatic Caching**: Built-in 60-second cache to reduce API calls
- 🌐 **Multi-Chain Support**: Works with Ethereum, Base, Polygon, and more

### API Methods

- `getTokenBalances(address, page, offset)` - Fetch token balances for an address
- `validateAddress(address)` - Validate and normalize Ethereum addresses
- `formatTokenBalances(data)` - Format balance data for display
- `filterTokensByType(tokens, type)` - Filter tokens by type (static method)
- `getTotalTokenCount(data)` - Get total token count (static method)

For complete documentation, see [ETHERSCAN-TOKEN-BALANCE.md](src/ETHERSCAN-TOKEN-BALANCE.md)

## 📜 Token Ownership History Tracker

This repository includes a powerful git-style ownership history tracker for ERC-721 tokens, designed specifically for tracking NFT ownership changes over time.

### Quick Start

```javascript
const ContractABIFetcher = require('./src/contract-abi');

// Create a fetcher with your API key
const fetcher = new ContractABIFetcher('YOUR_ETHERSCAN_API_KEY', 1);

// Fetch contract ABI
const result = await fetcher.getContractABI('0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43');
console.log(`Functions: ${result.abi.filter(item => item.type === 'function').length}`);

// Extract function signatures
const functions = ContractABIFetcher.extractFunctionSignatures(result.abi);
functions.forEach(func => console.log(func.signature));
const { TokenHistoryTracker } = require('./src/token-history');

// Create a history tracker for kushmanmb
const tracker = new TokenHistoryTracker(
  '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',  // Contract address
  'kushmanmb'  // Owner identifier
);

// Record token transfers
tracker.recordTransfer(
  '1234',  // Token ID
  '0x0000000000000000000000000000000000000000',  // From address
  '0x1234567890123456789012345678901234567890',  // To address (kushmanmb)
  1609459200,  // Timestamp
  '0xabc123...',  // Transaction hash
  11565019  // Block number
);

// View git-style history
console.log(tracker.toGitLog());

// Get tokens owned by kushmanmb
const ownedTokens = tracker.getTokensByOwner('0x1234567890...');
```

### Features

- 🔌 **Etherscan API Integration**: Direct integration with Etherscan API
- ✅ **Address Validation**: Built-in Ethereum address validation
- 🌐 **Multi-Chain Support**: Works with Ethereum, Base, Polygon, and more
- 💾 **Automatic Caching**: Caches ABIs for improved performance
- 📝 **Signature Extraction**: Extract function and event signatures from ABIs
- 🛡️ **Error Handling**: Comprehensive error handling for API failures

### Available Functions

- `getContractABI(address)` - Fetch contract ABI from Etherscan
- `validateAddress(address)` - Validate Ethereum address format
- `clearCache()` - Clear the internal cache
- `getAPIInfo()` - Get API configuration information
- `extractFunctionSignatures(abi)` - Extract function signatures (static)
- `extractEventSignatures(abi)` - Extract event signatures (static)
- 🔍 **Git-Style History**: Track ownership changes like git commits
- 📊 **Comprehensive Tracking**: Monitor all token transfers for a specific owner
- 🎯 **Ownership Verification**: Verify current and historical token ownership
- 📈 **Statistics**: Get insights into transfer patterns and ownership
- 💾 **JSON Export/Import**: Save and restore history data
- ✅ **Address Validation**: Built-in Ethereum address validation
- 📝 **Multiple Formats**: View history in git log, short log, or JSON format

### Available Functions

- `recordTransfer(tokenId, from, to, timestamp, txHash, blockNumber)` - Record a token transfer event
- `getTokenHistory(tokenId)` - Get complete ownership history for a token
- `getTokensByOwner(address)` - Get all tokens currently owned by an address
- `getCurrentOwner(tokenId)` - Get the current owner of a token
- `getHistoryForOwner(address)` - Get all transfers involving an owner
- `toGitLog(limit)` - Format history as git-style log
- `toShortLog(limit)` - Format history in compact format
- `getStatistics()` - Get comprehensive statistics about the history
- `toJSON()` - Export history as JSON
- `fromJSON(data)` - Import history from JSON

### Testing & Demo

```bash
npm run test:contract-abi   # Run Contract ABI tests
npm run contract-abi:demo   # See the Contract ABI fetcher in action
```

### Documentation

For complete documentation, see [src/CONTRACT-ABI.md](./src/CONTRACT-ABI.md)

### Testing

```bash
npm run test:etherscan-token-balance   # Run Etherscan Token Balance tests
npm run etherscan-token-balance:demo   # See the token balance fetcher in action
```


### Chain Support

Works with any EVM-compatible blockchain with an Etherscan-compatible API:

```javascript
// Ethereum Mainnet
const ethFetcher = new ContractABIFetcher('YOUR_API_KEY', 1);

// Base Mainnet
const baseFetcher = new ContractABIFetcher('YOUR_API_KEY', 8453);

// Polygon Mainnet
const polygonFetcher = new ContractABIFetcher('YOUR_API_KEY', 137);
npm run test:token-history      # Run token history tests
npm run token-history:demo      # See the tracker in action
```

### Example Output

**Git-Style Log:**
```
commit 0000000059141cf6
Author: 0x1234567890123456789012345678901234567890
Date:   2021-01-01T00:00:00.000Z

    Transfer token #1234 from 0x0000... to 0x1234...
    
    Transaction: 0xabc123...
    Block: 11565019
```

**Short Log:**
```
00000000 - Token #1234: 0x00000000... → 0x12345678...
00000000 - Token #5678: 0xabcdefab... → 0x12345678...
```

**Statistics:**
```json
{
  "totalTransfers": 4,
  "uniqueTokens": 3,
  "uniqueAddresses": 5,
  "currentOwners": 3,
  "contract": "0xbc4ca0...",
  "trackedOwner": "kushmanmb"
}
```

---

## 🎨 ERC-721 Token Fetcher

This repository includes a comprehensive ERC-721 (NFT) token fetching module for interacting with Non-Fungible Tokens on blockchain networks.

### Quick Start

```javascript
const ERC721Fetcher = require('./src/erc721');

// Create a fetcher for an NFT contract
const fetcher = new ERC721Fetcher('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');

// Get token owner
const owner = await fetcher.getOwner(123);
console.log(`Token #123 owner: ${owner.owner}`);

// Get token metadata
const metadata = await fetcher.getTokenMetadata(123);
console.log(`Token name: ${metadata.name}`);

// Check balance
const balance = await fetcher.getBalance('0xYourAddress');
console.log(`Balance: ${balance.balance} tokens`);
```

### Features

- 🎯 **ERC-721 Standard**: Full support for ERC-721 read functions
- 🔍 **Token Information**: Fetch owner, URI, metadata, and more
- 📊 **Collection Data**: Get name, symbol, and total supply
- ✅ **Validation**: Built-in address and token ID validation
- 💾 **Caching**: Automatic metadata caching for performance
- 🌐 **Network Agnostic**: Works with Ethereum, Base, Polygon, and more
- 📚 **ABI Access**: Direct access to function ABIs and signatures

### Available Functions

- `getBalance(address)` - Get token balance for an address
- `getOwner(tokenId)` - Get the owner of a specific token
- `getTokenURI(tokenId)` - Get the metadata URI for a token
- `getTokenMetadata(tokenId)` - Fetch and parse token metadata
- `getCollectionName()` - Get the NFT collection name
- `getCollectionSymbol()` - Get the collection symbol
- `getTotalSupply()` - Get total supply of tokens
- `verifyOwnership(address, tokenId)` - Verify if an address owns a token
- `getTokenInfo(tokenId)` - Get comprehensive token information

### Testing & Demo

```bash
npm run test:erc721   # Run ERC-721 tests
npm run erc721:demo   # See the ERC-721 fetcher in action
```

### Documentation

For complete documentation, see [src/ERC721.md](./src/ERC721.md)

### Network Support

Works with any EVM-compatible blockchain:

```javascript
// Ethereum Mainnet
const ethFetcher = new ERC721Fetcher(
  '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  'https://ethereum.publicnode.com'
);

// Base Mainnet
const baseFetcher = new ERC721Fetcher(
  '0x1234567890123456789012345678901234567890',
  'https://mainnet.base.org'
);
```

---

## 🔐 Ownership Status & Verification
**Name:** Matthew Brace  
**GitHub:** [@kushmanmb](https://github.com/kushmanmb)  
**Verification:** kushmanmb.eth | [kushmanmb.org](https://kushmanmb.org)  
**Contact:** [kushmanmb@gmx.com](mailto:kushmanmb@gmx.com)

**Mission Statement:** *Empowering crypto clarity, fueled by innovation and style—relaxing, investing and leveling up, one stat at a time*

---

## 🔗 External Projects & Integrations

### Octant V2 Core

[Octant V2 Core](https://github.com/golemfoundation/octant-v2-core) is an advanced blockchain protocol developed by the Golem Foundation, providing yield strategies, allocation mechanisms, and Safe integration through the Dragon Protocol.

**Quick Clone:**
```bash
git clone https://github.com/golemfoundation/octant-v2-core.git
cd octant-v2-core
```

📖 **See [OCTANT-V2-CORE.md](./OCTANT-V2-CORE.md)** for complete setup guide, architecture overview, and integration instructions.

**Key Features:**
- Multi-strategy yield generation vaults (Lido, Morpho, Sky)
- Democratic allocation mechanisms
- Dragon Protocol for Safe integration
- ERC-4626 compliant tokenized strategies
- Comprehensive factory contracts for deployment

### kywmahmb

A related repository by kushmanmb for blockchain development and utilities.

**Quick Clone:**
```bash
git clone https://github.com/Kushmanmb/kywmahmb.git
cd kywmahmb
```

---

## 📡 Blockchain Network Documentation

### Base Chain (Chain ID: 8453)
**Network:** Base Mainnet  
**Chain ID:** 8453  
**Network Type:** Layer 2 (Optimistic Rollup)  
**Built on:** Ethereum  
**Developed by:** Coinbase

**Verified RPC Endpoints:**
- `https://mainnet.base.org`
- `https://base.llamarpc.com`
- `https://base-mainnet.public.blastapi.io`

**Block Explorers:**
- [BaseScan](https://basescan.org) - Official Block Explorer
- [Base Explorer](https://base.blockscout.com)

**Network Details:**
- Native Currency: ETH (Ether)
- Block Time: ~2 seconds
- Status: Production (Mainnet)
- Launch Date: August 2023

**Key Features:**
- Low transaction fees
- Fast confirmation times
- EVM-compatible
- Secured by Ethereum mainnet
- Developer-friendly infrastructure

---

### Ethereum Mainnet
**Network:** Ethereum Mainnet  
**Chain ID:** 1  
**Consensus:** Proof of Stake (PoS)  
**Launch Date:** July 30, 2015

**Verified RPC Endpoints:**
- `https://ethereum.publicnode.com`
- `https://eth.llamarpc.com`
- `https://rpc.ankr.com/eth`
- `https://cloudflare-eth.com`

**Block Explorers:**
- [Etherscan](https://etherscan.io) - Primary Block Explorer
- [Blockscout](https://eth.blockscout.com)
- [Etherchain](https://etherchain.org)

**Network Details:**
- Native Currency: ETH (Ether)
- Block Time: ~12 seconds
- Total Supply: No fixed cap
- Consensus Layer: Beacon Chain

**Key Features:**
- Most established smart contract platform
- Largest developer ecosystem
- Proof of Stake consensus (post-Merge)
- Home to thousands of dApps and DeFi protocols
- EVM (Ethereum Virtual Machine) standard

---

### Beacon Chain (Ethereum Consensus Layer)
**Network:** Ethereum Beacon Chain  
**Type:** Consensus Layer (Proof of Stake)  
**Launch Date:** December 1, 2020  
**Merge Date:** September 15, 2022

**Verified Endpoints:**
- Beacon Chain API: `https://beaconcha.in`
- Consensus Node: Various client implementations (Prysm, Lighthouse, Teku, Nimbus, Lodestar)

**Block Explorers:**
- [Beaconcha.in](https://beaconcha.in) - Official Beacon Chain Explorer
- [BeaconScan](https://beaconscan.com)

**Network Details:**
- Consensus Mechanism: Proof of Stake (PoS)
- Slot Time: 12 seconds
- Epoch: 32 slots (~6.4 minutes)
- Minimum Stake: 32 ETH per validator
- Annual Staking Rewards: Variable (see [Beaconcha.in](https://beaconcha.in) for current APR)

**Key Features:**
- Coordinates network validators
- Manages staking and rewards
- Provides finality to Ethereum blocks
- Energy-efficient consensus (99.95% reduction vs PoW)
- Active validator network (see [Beaconcha.in](https://beaconcha.in) for current count)

**Staking Information:**
- Minimum: 32 ETH to run a validator
- Liquid Staking: Available through protocols (Lido, Rocket Pool, etc.)
- Withdrawal Address: Must be set for validator rewards
- Slashing: Penalties for validator misbehavior

---

## ✅ Verification Sources

All blockchain information has been verified through official documentation:
- **Base:** [base.org/docs](https://docs.base.org)
- **Ethereum:** [ethereum.org](https://ethereum.org)
- **Beacon Chain:** [ethereum.org/upgrades](https://ethereum.org/en/upgrades/)

**Chain Registry:**
- [ChainList](https://chainlist.org) - Verified chain IDs and RPC endpoints
- [Ethereum Lists](https://github.com/ethereum-lists/chains)

---

## 📢 Repository Announcement

**This repository is owned, maintained, and curated by kushmanmb (Matthew Brace)**

All content, documentation, and blockchain information presented here represents verified research and careful curation by the owner. This project demonstrates commitment to:

- 🎯 **Accurate blockchain documentation**
- 🔒 **Verified network information**
- 🚀 **Innovation in crypto clarity**
- 📚 **Educational resources for the community**

For questions, collaborations, or inquiries, please reach out via:
- 📧 Email: [kushmanmb@gmx.com](mailto:kushmanmb@gmx.com)
- 🌐 Website: [kushmanmb.org](https://kushmanmb.org)
- 🏷️ ENS: kushmanmb.eth

---

<div align="center">

**-Big-world-Bigger-ideas-**  
*WWJD*

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)
![By kushmanmb](https://img.shields.io/badge/By-kushmanmb-blue?style=flat-square&logo=github)

**© 2024-2026 Matthew Brace (kushmanmb) | All Rights Reserved**

</div>
