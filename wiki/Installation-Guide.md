# Installation Guide

Detailed instructions for installing Big World Bigger Ideas.

## 📋 System Requirements

### Minimum Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 6.0.0 or higher (comes with Node.js)
- **Operating System**: Windows, macOS, or Linux
- **Memory**: 512 MB RAM minimum
- **Disk Space**: 100 MB for dependencies

### Recommended Requirements
- **Node.js**: 18.0.0 or higher (LTS)
- **npm**: 8.0.0 or higher
- **Memory**: 1 GB RAM or more
- **Internet**: Required for blockchain API calls

## 🚀 Installation Methods

### Method 1: NPM Package (Production Use)

Install the package from npm registry:

```bash
npm install big-world-bigger-ideas
```

#### Verify NPM Installation

```javascript
const bigWorld = require('big-world-bigger-ideas');
console.log('Installation successful!');
```

### Method 2: Clone Repository (Development)

Clone the repository for development:

```bash
# Clone repository
git clone https://github.com/Kushmanmb/-Big-world-Bigger-ideas-.git

# Navigate to directory
cd -Big-world-Bigger-ideas-

# Install dependencies
npm install
```

#### Verify Repository Installation

```bash
# Run tests
npm test

# Run a demo
npm run erc721:demo
```

### Method 3: Yarn (Alternative Package Manager)

If you prefer Yarn:

```bash
yarn add big-world-bigger-ideas
```

### Method 4: pnpm (Alternative Package Manager)

If you prefer pnpm:

```bash
pnpm add big-world-bigger-ideas
```

## 🔧 Setup

### Basic Setup

After installation, you can start using the modules:

```javascript
// Import entire package
const bigWorld = require('big-world-bigger-ideas');

// Access modules
const erc721 = bigWorld.ERC721Fetcher;
const bitcoin = bigWorld.BitcoinMiningFetcher;
const featureFlags = bigWorld.featureFlags;
```

### Import Specific Modules

```javascript
// Import only what you need
const { ERC721Fetcher, BitcoinMiningFetcher } = require('big-world-bigger-ideas');
```

### Direct Module Import

```javascript
// Import specific module directly
const ERC721Fetcher = require('big-world-bigger-ideas/src/erc721');
```

## 🌐 Network Configuration

### Default Configuration

Most modules work out of the box with default settings:

```javascript
// Uses default Ethereum RPC
const fetcher = new ERC721Fetcher(contractAddress);
```

### Custom RPC Endpoints

Configure custom RPC endpoints for your needs:

```javascript
// Ethereum mainnet
const ethFetcher = new ERC721Fetcher(
  contractAddress,
  'https://ethereum.publicnode.com'
);

// Base network
const baseFetcher = new ERC721Fetcher(
  contractAddress,
  'https://base.publicnode.com'
);

// Your own RPC endpoint
const customFetcher = new ERC721Fetcher(
  contractAddress,
  'https://your-rpc-endpoint.com'
);
```

### Environment Variables

Store configuration in environment variables:

```bash
# .env file
ETHEREUM_RPC_URL=https://your-rpc-endpoint.com
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

```javascript
// Load from environment
require('dotenv').config();

const fetcher = new ERC721Fetcher(
  process.env.CONTRACT_ADDRESS,
  process.env.ETHEREUM_RPC_URL
);
```

## 🧪 Verifying Installation

### Run Tests

```bash
# All tests
npm test

# Specific module
npm run test:erc721
npm run test:bitcoin-mining
npm run test:feature-flags
```

Expected output:
```text
✓ Constructor accepts valid address
✓ getOwner returns correct owner
✓ getBalance validates address
...
Tests: 15 passed, 0 failed
```

### Run Demo Scripts

```bash
# ERC-721 demo
npm run erc721:demo

# Bitcoin mining demo
npm run bitcoin-mining:demo

# Feature flags demo
npm run feature-flags:demo
```

## 📦 Dependencies

### Production Dependencies

The package currently has no direct production dependencies.

### Development Dependencies

For development, additional tools are included:

```json
{
  "autoprefixer": "^10.4.24",
  "postcss": "^8.5.6",
  "tailwindcss": "^4.2.1"
}
```

### Peer Dependencies

None currently required.

## 🔒 Security Setup

### Private Key Management

**Never hardcode private keys!** Use secure methods:

#### Method 1: Environment Variables

```bash
# .env file
PRIVATE_KEY=your_private_key_here
```

```javascript
require('dotenv').config();
const privateKey = process.env.PRIVATE_KEY;
```

#### Method 2: Encrypted Storage

```javascript
const { encryptWallet, decryptWallet } = require('big-world-bigger-ideas').wallet;

// Encrypt
const encrypted = encryptWallet(privateKey, password);
// Store encrypted data safely

// Decrypt when needed
const decrypted = decryptWallet(encrypted, password);
```

#### Method 3: Key Management Services

Use services like:
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault

## 🐛 Troubleshooting Installation

### Issue: "Cannot find module"

**Problem:** Module not found after installation

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Permission denied"

**Problem:** Permission errors during installation

**Solution (macOS/Linux):**
```bash
# Don't use sudo with npm
# Fix npm permissions instead
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

**Solution (Windows):**
Run as Administrator or fix Node.js installation permissions.

### Issue: "Unsupported engine"

**Problem:** Node.js version too old

**Solution:**
```bash
# Check Node.js version
node --version

# Update Node.js
# Visit https://nodejs.org and install latest LTS
```

### Issue: Network errors during installation

**Problem:** Can't download dependencies

**Solution:**
```bash
# Check internet connection
ping npmjs.org

# Try different registry
npm config set registry https://registry.npmjs.org/

# Use proxy if needed
npm config set proxy http://proxy.company.com:8080
```

### Issue: Build errors

**Problem:** Native module build failures

**Solution:**
```bash
# Ensure build tools are installed

# Windows
npm install --global windows-build-tools

# macOS
xcode-select --install

# Linux
sudo apt-get install build-essential
```

## 🔄 Updating

### Update to Latest Version

```bash
# Update package
npm update big-world-bigger-ideas

# Or specify version
npm install big-world-bigger-ideas@latest
```

### Check Current Version

```bash
npm list big-world-bigger-ideas
```

### Version History

Check available versions:
```bash
npm view big-world-bigger-ideas versions
```

## 🎯 Quick Start Projects

### Starter Template

Create a new project with this template:

```bash
mkdir my-blockchain-app
cd my-blockchain-app
npm init -y
npm install big-world-bigger-ideas
```

Create `index.js`:

```javascript
const { ERC721Fetcher } = require('big-world-bigger-ideas');

async function main() {
  const fetcher = new ERC721Fetcher('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');
  const owner = await fetcher.getOwner(1);
  console.log('Token owner:', owner.owner);
}

main();
```

Run:
```bash
node index.js
```

## 📚 Next Steps

After installation:

1. **[Getting Started Guide](Getting-Started)** - Learn the basics
2. **[API Reference](API-Reference)** - Explore available methods
3. **[Examples & Use Cases](Examples-and-Use-Cases)** - See real implementations
4. **[Testing Guide](Testing-Guide)** - Learn how to test your code

## 💡 Tips

- Use LTS versions of Node.js for stability
- Keep dependencies updated regularly
- Use `npm ci` in CI/CD environments
- Cache `node_modules` in CI for faster builds
- Review security advisories: `npm audit`

## 📞 Support

Need help with installation?

- **Documentation**: Check the [Getting Started](Getting-Started) guide
- **GitHub Issues**: [Report installation issues](https://github.com/Kushmanmb/-Big-world-Bigger-ideas-/issues)
- **Email**: [mattbrace92@gmail.com](mailto:mattbrace92@gmail.com)

---

**Successfully installed?** Head to the [Getting Started](Getting-Started) guide!
