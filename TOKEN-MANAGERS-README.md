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
        "setBy": "yaketh.eth",
        "notes": "Additional information"
      },
      "setAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ],
  "deprecated": [
    {
      "tokenAddress": "0x...",
      "managerAddress": "0x...",
      "deprecatedAt": "ISO 8601 timestamp",
      "reason": "Reason for deprecation"
    }
  ],
  "transferAddress": "yaketh.eth",
  "transferAddressHex": "0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17",
  "lastUpdated": "ISO 8601 timestamp",
  "version": "1.1.0"
}
```

## Transfer Address

All active token manager assignments now point to **yaketh.eth** as the designated transfer/manager address:

- **ENS Name**: `yaketh.eth`
- **Hex Address**: `0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17`

## Active Managers

### USDC (USD Coin)
- **Token Address**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **Manager Address**: `0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17` (yaketh.eth)
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Type**: Stablecoin
- **Decimals**: 6

### USDT (Tether USD)
- **Token Address**: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- **Manager Address**: `0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17` (yaketh.eth)
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Type**: Stablecoin
- **Decimals**: 6

### WETH (Wrapped Ether)
- **Token Address**: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`
- **Manager Address**: `0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17` (yaketh.eth)
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Type**: Wrapped Native Token
- **Decimals**: 18

### Token Contract
- **Token Address**: `0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055`
- **Manager Address**: `0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17` (yaketh.eth)
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Type**: Token Contract

## Deprecated Tokens

The following tokens have been removed from active configuration:

| Token Address | Reason |
|---|---|
| `0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B` | Unknown token with no valid symbol or name |
| `0x0000000000000000000000000000000000000000` | Zero address is not a valid token contract |

Deprecated entries are preserved in the `deprecated` array in `token-managers.json` for audit purposes but are not loaded into the active manager configuration.

## Usage

### Viewing Configuration

```bash
node apply-token-managers.js
```

This will:
1. Load the configuration from `token-managers.json`
2. Display all active configured managers
3. List deprecated entries
4. Verify the manager assignments point to yaketh.eth

### Adding New Managers

1. Edit `token-managers.json`
2. Add a new entry to the `managers` array:

```json
{
  "tokenAddress": "0xNewTokenAddress...",
  "managerAddress": "0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17",
  "metadata": {
    "tokenName": "Your Token",
    "tokenSymbol": "YT",
    "network": "Ethereum Mainnet",
    "setBy": "yaketh.eth",
    "notes": "Description"
  },
  "setAt": "2026-03-08T21:52:56.156Z",
  "updatedAt": "2026-03-08T21:52:56.156Z"
}
```

3. Update the `lastUpdated` field
4. Run `node apply-token-managers.js` to verify

### Deprecating a Token

1. Move the entry from `managers` to `deprecated` in `token-managers.json`
2. Add `deprecatedAt` (ISO 8601 timestamp) and `reason` fields
3. Update the `lastUpdated` field
4. Run `node apply-token-managers.js` to verify it no longer appears in the active list

### Programmatic Usage

```javascript
const TokenManager = require('./src/token-manager');
const fs = require('fs');

// Load configuration
const config = JSON.parse(fs.readFileSync('token-managers.json', 'utf8'));

// Create manager and import (only loads active managers array)
const manager = new TokenManager('My Manager');
manager.fromJSON(config);

// Get manager for a token — will return yaketh.eth address
const usdcManager = manager.getManager('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
console.log(usdcManager.managerAddress);
// => '0xa14373a2209fad5cdcc22841e9176e0ce4c50c17'
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
- Deprecated entries are preserved in `token-managers.json` for audit history

## Version History

- **v1.1.0** (2026-03-08): Updated all active token manager addresses to yaketh.eth (`0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17`); deprecated Unknown Token and Zero Address entries; added `transferAddress`, `transferAddressHex`, `deprecated`, and `updatedAt` fields
- **v1.0.0** (2026-02-25): Initial configuration with USDC manager assignment
