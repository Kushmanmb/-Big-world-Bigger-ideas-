# FAQ - Frequently Asked Questions

Common questions and answers about Big World Bigger Ideas.

## General Questions

### What is Big World Bigger Ideas?

Big World Bigger Ideas is a comprehensive blockchain utilities and crypto clarity platform. It provides tools for interacting with multiple blockchain networks including Ethereum, Bitcoin, Litecoin, and other EVM-compatible chains. The platform includes NFT utilities, mining data, governance tools, and security features.

### Who created this project?

Created by [Matthew Brace (kushmanmb)](https://github.com/kushmanmb). All blockchain utilities, crypto clarity tools, and documentation were designed and maintained by the owner.

### Is this project open source?

Yes, the project is open source under the ISC license. You can find the repository at [github.com/kushmanmb-org/-Big-world-Bigger-ideas-](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-).

### How do I install it?

```bash
npm install big-world-bigger-ideas
```

See the [Getting Started](Getting-Started) guide for more details.

## Technical Questions

### What version of Node.js do I need?

Node.js version 14.0.0 or higher is required.

### Does it work with TypeScript?

The project is written in JavaScript (CommonJS), but you can use it in TypeScript projects. Type definitions are not currently included but can be added.

### Which blockchains are supported?

- **Ethereum** - Full support
- **Bitcoin** - Mining data and statistics
- **Litecoin** - Blockchain data via Blockchair
- **Base** - Full EVM support
- **Polygon** - Full EVM support
- **Arbitrum** - Full EVM support
- **Optimism** - Full EVM support
- **Any EVM-compatible chain** - Can be used with custom RPC

### Can I use custom RPC endpoints?

Yes! Most modules accept custom RPC URLs:

```javascript
const fetcher = new ERC721Fetcher(
  contractAddress,
  'https://your-custom-rpc.com'
);
```

### Does it require API keys?

Most features work without API keys:
- ✅ **No API key needed**: ERC-721, Bitcoin Mining, Token History
- ⚠️ **Optional API key**: Litecoin Blockchair (higher rate limits with key)
- ❌ **API key required**: None currently

## Usage Questions

### How do I fetch NFT data?

```javascript
const { ERC721Fetcher } = require('big-world-bigger-ideas');

const fetcher = new ERC721Fetcher('0xContractAddress...');
const owner = await fetcher.getOwner(tokenId);
```

See [ERC-721 Module](ERC721-Module) for complete documentation.

### How do I track Bitcoin mining stats?

```javascript
const { BitcoinMiningFetcher } = require('big-world-bigger-ideas');

const fetcher = new BitcoinMiningFetcher();
const hashRate = await fetcher.getHashRate('1w');
```

See [Bitcoin Mining Module](Bitcoin-Mining-Module) for details.

### How do feature flags work?

Feature flags can be managed via code:

```javascript
const featureFlags = require('big-world-bigger-ideas').featureFlags;
featureFlags.setFlag('my_feature', true);
```

See the [Feature Flags Module](Feature-Flags-Module) for more information.

### Can I track NFT ownership history?

Yes, use the Token History Tracker:

```javascript
const { TokenHistoryTracker } = require('big-world-bigger-ideas');

const tracker = new TokenHistoryTracker(contractAddress, tokenId);
const history = await tracker.trackOwnership();
```

### How do I create a DAO?

Use the Blockchain Council module:

```javascript
const { BlockchainCouncil } = require('big-world-bigger-ideas');

const dao = new BlockchainCouncil('My DAO');
dao.addMember(address, name, role);
const proposalId = dao.createProposal(proposer, title, description);
```

## Error Messages

### "Invalid address format"

**Cause**: Blockchain address is not in correct format

**Solution**: 
- Ethereum addresses must start with `0x` and be 42 characters total
- Use checksummed addresses when possible
- Verify the address is valid

### "Invalid token ID"

**Cause**: Token ID is not a valid non-negative integer

**Solution**:
- Ensure token ID is a number or numeric string
- Token ID must be >= 0
- Large numbers are supported (BigInt compatible)

### "Rate limit exceeded"

**Cause**: Too many API requests in a short time

**Solution**:
- Use built-in caching features
- Add delays between requests
- Consider using your own RPC endpoint

### "Network error"

**Cause**: Unable to reach blockchain network or API

**Solution**:
- Check internet connection
- Verify RPC endpoint is accessible
- Try alternative RPC endpoints
- Check if the blockchain network is experiencing issues

## Performance Questions

### Are API calls cached?

Yes, most modules include built-in caching:
- **Bitcoin Mining**: 60 seconds default cache
- **ERC-721 Metadata**: Cached per instance
- **Litecoin**: 30 seconds default cache

You can clear caches manually:
```javascript
fetcher.clearCache();
```

### How fast is it?

Performance depends on:
- Network latency to RPC endpoints
- Blockchain network speed
- Whether data is cached

Typical response times:
- **Cached data**: < 1ms
- **ERC-721 queries**: 100-500ms
- **Bitcoin mining data**: 200-800ms

### Can I use it in production?

Yes, but consider:
- Use reliable RPC endpoints
- Implement proper error handling
- Add monitoring and logging
- Test thoroughly before deployment
- Keep dependencies updated

## Feature Flags Questions

### Where are feature flags stored?

In `feature-flags.json` at the repository root.

### Can I use feature flags without a CI/CD system?

Yes, you can use the Feature Flags module programmatically:

```javascript
const featureFlags = require('big-world-bigger-ideas').featureFlags;
featureFlags.setFlag('my_feature', true);
```

### How do I delete a feature flag?

```javascript
featureFlags.removeFlag('flag_name');
```

Or it will be removed when you unset it and later clean up manually.

## Testing Questions

### How do I run tests?

```bash
# All tests
npm test

# Specific module
npm run test:erc721
```

See [Testing Guide](Testing-Guide) for details.

### Are there example scripts?

Yes! Each module has a demo script:

```bash
npm run erc721:demo
npm run bitcoin-mining:demo
```

### Do tests require internet?

Some tests make real API calls and require internet connectivity. If API tests fail, check:
- Internet connection
- API availability
- Rate limits

## Troubleshooting

### Module not found

**Problem**: `Cannot find module 'big-world-bigger-ideas'`

**Solution**:
```bash
npm install big-world-bigger-ideas
```

### Import errors

**Problem**: Import statement not working

**Solution**: This project uses CommonJS. Use `require()`, not `import`:
```javascript
// ✅ Correct
const bigWorld = require('big-world-bigger-ideas');

// ❌ Wrong
import bigWorld from 'big-world-bigger-ideas';
```

### Tests failing

**Problem**: Tests fail when running `npm test`

**Solutions**:
1. Check Node.js version (must be >= 14.0.0)
2. Run `npm install` to install dependencies
3. Check internet connection for API tests
4. Review error messages for specific issues

## Contributing Questions

### How can I contribute?

See the [Contributing](Contributing) guide for details on:
- Reporting issues
- Submitting pull requests
- Code style guidelines
- Development workflow

### I found a bug, what should I do?

1. Check if the bug is already reported in [GitHub Issues](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/issues)
2. If not, create a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (Node.js version, OS, etc.)

### Can I add a new feature?

Yes! Please:
1. Open an issue first to discuss the feature
2. Follow the existing code style
3. Add tests for your feature
4. Update documentation
5. Submit a pull request

## Security Questions

### Is it safe to use?

The project follows security best practices:
- No hardcoded credentials
- Input validation on all user inputs
- Regular dependency updates
- Security scanning in CI/CD

### How should I store private keys?

**Never** commit private keys to code. Use:
- Environment variables
- Secure key management systems
- Encrypted storage (use the Wallet module)

```javascript
const { encryptWallet } = require('big-world-bigger-ideas').wallet;
const encrypted = encryptWallet(privateKey, password);
```

### Are there known vulnerabilities?

Check the [Security tab](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/security) on GitHub for current security status.

## Support

### Where can I get help?

- **Documentation**: Start with [Getting Started](Getting-Started)
- **GitHub Issues**: [Report issues or ask questions](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/issues)
- **Email**: kushmanmb@gmx.com

### Is there a community?

Join the discussion on GitHub! Open issues, participate in discussions, and connect with other users.

---

**Still have questions?** Open an [issue on GitHub](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/issues) or email kushmanmb@gmx.com.
