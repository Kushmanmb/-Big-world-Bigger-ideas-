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

### Zero Address
- **Token Address**: `0x0000000000000000000000000000000000000000`
- **Manager Address**: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0` (kushmanmb.base.eth)
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Type**: Special Address
- **Notes**: Immutable access permissions write for kushmanmb

**Architectural Note:** While the zero address is not a valid token contract in standard Ethereum usage, it is used here as a special sentinel value for application-level access control. This allows the token manager system to grant kushmanmb immutable write permissions for system-level operations. This is an application-layer construct and does not interact with on-chain contracts.

### Address One
- **Token Address**: `0x0000000000000000000000000000000000000001`
- **Manager Address**: `0x6fb9e80dDd0f5DC99D7cB38b07e8b298A57bF253`
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Type**: Special Address
- **Notes**: Full permissions write for system operations

**Architectural Note:** Similar to the zero address, address 1 is used as a sentinel value for application-level access control. This grants the manager address full write permissions for system-level operations without blockchain interaction.

## Deprecated Tokens

The following tokens have been removed from active configuration:

| Token Address | Reason |
|---|---|
| `0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B` | Unknown token with no valid symbol or name |

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

## Contract Consolidation

The repository includes a Contract Consolidation system to automatically identify and deprecate token contracts with zero balances, reducing management overhead.

### Overview

The consolidation system:
1. Analyzes token balances across all tracked addresses
2. Identifies contracts with zero or minimal balances
3. Generates recommendations for deprecation
4. Automatically deprecates zero-balance contracts
5. Maintains an audit trail in the `deprecated` array

### Running Consolidation

#### Upgrade Deprecated Tokens

To restore deprecated tokens and run consolidation analysis:

```bash
npm run upgrade-tokens
```

This command will:
1. Upgrade all deprecated tokens back to active status
2. Fetch current token balances from blockchain
3. Analyze contracts to identify zero-balance tokens
4. Automatically deprecate contracts with no balances
5. Update `token-managers.json` with the results

#### Manual Consolidation Analysis

To analyze contracts without making changes:

```bash
npm run contract-consolidator:demo
```

#### Using the Contract Consolidator API

```javascript
const ContractConsolidator = require('./src/contract-consolidator');
const { AddressConsolidator } = require('./src/address-consolidator');

// Fetch consolidated balances
const addressConsolidator = new AddressConsolidator();
const consolidated = await addressConsolidator.fetchConsolidatedBalances();

// Analyze contracts
const contractConsolidator = new ContractConsolidator({
  minBalanceThreshold: 0.001  // Balances below this are considered minimal
});

const analysis = contractConsolidator.analyzeContracts(consolidated);

// Generate report
const report = contractConsolidator.generateReport(analysis);
console.log(report);

// Preview deprecations (dry run)
const dryRun = contractConsolidator.applyDeprecations(null, true);
console.log(contractConsolidator.formatDeprecationResults(dryRun));

// Apply deprecations
const results = contractConsolidator.applyDeprecations(null, false);
console.log(contractConsolidator.formatDeprecationResults(results));
```

### Consolidation Workflow

1. **Initial State**: Tokens may be in `managers` (active) or `deprecated` arrays
2. **Upgrade**: Run `npm run upgrade-tokens` to restore all deprecated tokens
3. **Analysis**: System fetches live balance data and analyzes each contract
4. **Recommendations**: Generates action items:
   - **Deprecate**: Zero-balance contracts (automatically applied)
   - **Review**: Minimal-balance contracts (manual review recommended)
   - **Active**: Contracts with balances above threshold (no action)
5. **Application**: Zero-balance contracts automatically moved to `deprecated`
6. **Audit Trail**: All deprecations tracked with timestamps and reasons

### Configuration

The `minBalanceThreshold` determines what's considered "minimal":
- `0` (default): Only zero balances trigger deprecation
- `0.001`: Balances below 0.001 are flagged for review
- `0.01`: Balances below 0.01 are flagged for review

### Testing

Run the contract consolidator tests:

```bash
npm run test:contract-consolidator
```

## Notes

- This configuration is loaded at runtime and does not directly interact with the blockchain
- Manager assignments are application-level and should be coordinated with on-chain permissions
- Keep this file in version control to track manager changes over time
- Always verify addresses before adding them to the configuration
- Deprecated entries are preserved in `token-managers.json` for audit history
- **Sentinel Addresses**: Special addresses like `0x0000000000000000000000000000000000000000` (zero address) and `0x0000000000000000000000000000000000000001` (address one) are used as sentinel values for application-level access control, not as valid token contracts. This enables immutable and full permissions management at the application layer.
- **Consolidation**: Use `npm run upgrade-tokens` to restore deprecated tokens and automatically deprecate zero-balance contracts

## Version History

- **v1.4.0** (2026-04-08): Upgraded deprecated tokens and added contract consolidation system; restored 1 previously deprecated token
- **v1.3.0** (2026-04-06): Added address one (`0x0000000000000000000000000000000000000001`) with `0x6fb9e80dDd0f5DC99D7cB38b07e8b298A57bF253` as manager with full write permissions
- **v1.2.0** (2026-04-06): Added zero address (`0x0000000000000000000000000000000000000000`) with kushmanmb (`0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0`) as manager with immutable access permissions write
- **v1.1.0** (2026-03-08): Updated all active token manager addresses to yaketh.eth (`0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17`); deprecated Unknown Token and Zero Address entries; added `transferAddress`, `transferAddressHex`, `deprecated`, and `updatedAt` fields
- **v1.0.0** (2026-02-25): Initial configuration with USDC manager assignment
