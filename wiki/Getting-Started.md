# Getting Started with Big World Bigger Ideas

This guide will help you get started with the Big World Bigger Ideas blockchain utilities platform.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** version 14.0.0 or higher
- **npm** (comes with Node.js)
- A code editor (VS Code, Sublime Text, etc.)
- Basic knowledge of JavaScript and blockchain concepts

## 📦 Installation

### Option 1: NPM Package (Recommended)

Install the package from npm:

```bash
npm install big-world-bigger-ideas
```

### Option 2: Clone Repository

Clone the repository for development:

```bash
git clone https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-.git
cd -Big-world-Bigger-ideas-
npm install
```

## 🚀 Quick Start

### Using as NPM Package

```javascript
// Import the entire package
const bigWorld = require('big-world-bigger-ideas');

// Or import specific modules
const { 
  ERC721Fetcher, 
  BitcoinMiningFetcher,
  TokenHistoryTracker,
  FeatureFlags 
} = require('big-world-bigger-ideas');
```

### Basic Examples

#### Example 1: Fetch NFT Owner

```javascript
const { ERC721Fetcher } = require('big-world-bigger-ideas');

async function getNFTOwner() {
  // Create fetcher for Bored Ape Yacht Club contract
  const fetcher = new ERC721Fetcher('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');
  
  // Get owner of token #1
  const result = await fetcher.getOwner(1);
  console.log(`Token #1 owner: ${result.owner}`);
}

getNFTOwner();
```

#### Example 2: Bitcoin Mining Data

```javascript
const { BitcoinMiningFetcher } = require('big-world-bigger-ideas');

async function getMiningStats() {
  const fetcher = new BitcoinMiningFetcher();
  
  // Get last week's hash rate
  const hashRate = await fetcher.getHashRate('1w');
  console.log(`Average Hash Rate: ${hashRate.avgHashRate} TH/s`);
}

getMiningStats();
```

#### Example 3: Feature Flags

```javascript
const featureFlags = require('big-world-bigger-ideas').featureFlags;

// Check if a feature is enabled
if (featureFlags.getFlag('dark_mode')) {
  console.log('Dark mode is enabled!');
}

// Set a feature flag
featureFlags.setFlag('beta_feature', true);

// List all flags
const flags = featureFlags.listFlags();
console.log('All flags:', flags);
```

## 🏗️ Project Structure

```
big-world-bigger-ideas/
├── src/                      # Source code modules
│   ├── erc721.js            # ERC-721 token fetcher
│   ├── bitcoin-mining.js    # Bitcoin mining data
│   ├── token-history.js     # Token ownership history
│   ├── wallet.js            # Wallet utilities
│   ├── feature-flags.js     # Feature flag management
│   └── ...                  # Other modules
├── index.js                 # Main entry point
├── package.json             # Package configuration
├── README.md                # Main documentation
└── tests/                   # Test files
```

## 🧪 Running Tests

Run all tests:

```bash
npm test
```

Run specific module tests:

```bash
npm run test:erc721
npm run test:bitcoin-mining
npm run test:feature-flags
```

## 🎮 Running Demos

Each module includes a demo script:

```bash
# ERC-721 demo
npm run erc721:demo

# Bitcoin mining demo
npm run bitcoin-mining:demo

# Feature flags demo
npm run feature-flags:demo
```

## 📚 Next Steps

Now that you have the basics, explore more:

1. **[Module Documentation](Home#core-modules)** - Learn about each module in detail
2. **[API Reference](API-Reference)** - Complete API documentation
3. **[Examples & Use Cases](Examples-and-Use-Cases)** - Real-world implementation examples
4. **[Testing Guide](Testing-Guide)** - Learn how to test your code

## 🆘 Getting Help

- **Issues**: [GitHub Issues](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/issues)
- **Email**: mattbrace92@gmail.com
- **Documentation**: [Wiki Home](Home)

## 💡 Tips

- Always validate blockchain addresses before using them
- Use caching features to improve performance
- Check the demo scripts for usage examples
- Run tests before deploying to production
- Keep your dependencies updated

## 🔐 Security Best Practices

- Never commit private keys or sensitive data
- Use environment variables for API keys
- Validate all user inputs
- Keep dependencies up to date
- Follow the security guidelines in our documentation

---

**Next**: [ERC-721 Module Documentation](ERC721-Module)
