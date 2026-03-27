# Token Manager Configuration

This file contains the manager address assignments for token contracts.

## Structure

```json
{
  "managers": [
    {
      "tokenAddress": "0x...",
      "managerAddress": "0x...",
      "metadata": {
        "tokenName": "Token Name",
        "tokenSymbol": "SYMBOL",
        "network": "Network Name",
        "chainId": 1,
        "notes": "Additional information"
      },
      "setAt": "ISO 8601 timestamp"
    }
  ],
  "lastUpdated": "ISO 8601 timestamp",
  "version": "1.0.0"
}
```

## Current Managers

### USDC (USD Coin)
- **Token Address**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **Manager Address**: `0x6fb9e80dDd0f5DC99D7cB38b07e8b298A57bF253`
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Type**: Stablecoin
- **Decimals**: 6

## Usage

### Viewing Configuration

```bash
node apply-token-managers.js
```

This will:
1. Load the configuration from `token-managers.json`
2. Display all configured managers
3. Verify the manager assignments

### Adding New Managers

1. Edit `token-managers.json`
2. Add a new entry to the `managers` array:

```json
{
  "tokenAddress": "0xNewTokenAddress...",
  "managerAddress": "0xNewManagerAddress...",
  "metadata": {
    "tokenName": "Your Token",
    "tokenSymbol": "YT",
    "network": "Ethereum Mainnet",
    "notes": "Description"
  },
  "setAt": "2026-02-25T16:00:00.000Z"
}
```

3. Update the `lastUpdated` field
4. Run `node apply-token-managers.js` to verify

### Programmatic Usage

```javascript
const TokenManager = require('./src/token-manager');
const fs = require('fs');

// Load configuration
const config = JSON.parse(fs.readFileSync('token-managers.json', 'utf8'));

// Create manager and import
const manager = new TokenManager('My Manager');
manager.fromJSON(config);

// Get manager for a token
const usdcManager = manager.getManager('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
console.log(usdcManager.managerAddress);
```

## Validation

All addresses are automatically:
- Validated for correct Ethereum address format (40 hex characters)
- Normalized to lowercase with `0x` prefix
- Case-insensitive for lookups

## Documentation

For more information about the Token Manager module, see:
- [TOKEN-MANAGER.md](./src/TOKEN-MANAGER.md) - Full module documentation
- [token-manager.js](./src/token-manager.js) - Source code
- [token-manager-example.js](./src/token-manager-example.js) - Usage examples

## Testing

Run the test suite:

```bash
npm run test:token-manager
```

Run the demo:

```bash
npm run token-manager:demo
```

## Notes

- This configuration is loaded at runtime and does not directly interact with the blockchain
- Manager assignments are application-level and should be coordinated with on-chain permissions
- Keep this file in version control to track manager changes over time
- Always verify addresses before adding them to the configuration

## Version History

- **v1.0.0** (2026-02-25): Initial configuration with USDC manager assignment
