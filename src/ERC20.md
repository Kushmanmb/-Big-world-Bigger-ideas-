# ERC-20 Token Balance Module

A comprehensive module for fetching and managing ERC-20 token balances for Ethereum addresses. Supports ENS names and provides consolidated token tracking across multiple addresses.

## Features

- ✅ Fetch ERC-20 token balances for any Ethereum address
- ✅ Support for ENS name resolution (e.g., `kushmanmb.eth`, `yaketh.eth`)
- ✅ Consolidate token holdings across multiple addresses
- ✅ Built-in caching for improved performance
- ✅ No API key required (uses Blockchair API)
- ✅ Complete ERC-20 ABI reference
- ✅ Formatted output for easy display

## Installation

```bash
npm install big-world-bigger-ideas
```

## Quick Start

```javascript
const ERC20Fetcher = require('./src/erc20.js');

// Create a fetcher instance
const fetcher = new ERC20Fetcher();

// Fetch token balances for an address
async function getBalances() {
  const balances = await fetcher.getTokenBalances('kushmanmb.eth');
  console.log(fetcher.formatTokenBalances(balances));
}

getBalances();
```

## API Reference

### Constructor

```javascript
const fetcher = new ERC20Fetcher(baseUrl);
```

**Parameters:**
- `baseUrl` (string, optional): Custom API base URL. Default: `'api.blockchair.com'`

### Methods

#### `validateAddress(address)`

Validates and normalizes an Ethereum address or ENS name.

```javascript
const address = fetcher.validateAddress('kushmanmb.eth');
// Returns: 'kushmanmb.eth'

const address2 = fetcher.validateAddress('0x1234...');
// Returns: '0x1234...' (lowercase)
```

**Parameters:**
- `address` (string): Ethereum address (with or without 0x prefix) or ENS name

**Returns:** `string` - Validated and normalized address

**Throws:** `Error` if address is invalid

---

#### `getTokenBalances(address)`

Fetches all ERC-20 token balances for a given address.

```javascript
const balances = await fetcher.getTokenBalances('kushmanmb.eth');
```

**Parameters:**
- `address` (string): Ethereum address or ENS name

**Returns:** `Promise<object>` - Token balance data:
```javascript
{
  address: '0x...',
  tokenCount: 5,
  tokens: [
    {
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      tokenDecimals: 6,
      balance: '1000000000',
      balanceApproximate: 1000,
      usdValue: 1000.00
    },
    // ... more tokens
  ],
  timestamp: 1708800000000
}
```

**Throws:** `Error` if address is invalid or request fails

---

#### `consolidateTokens(addresses)`

Consolidates token balances across multiple addresses.

```javascript
const addresses = ['kushmanmb.eth', 'yaketh.eth'];
const consolidated = await fetcher.consolidateTokens(addresses);
```

**Parameters:**
- `addresses` (Array<string>): Array of Ethereum addresses or ENS names

**Returns:** `Promise<object>` - Consolidated token data:
```javascript
{
  addresses: ['kushmanmb.eth', 'yaketh.eth'],
  uniqueTokens: 10,
  totalAddresses: 2,
  tokens: [
    {
      tokenAddress: '0x...',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      tokenDecimals: 6,
      totalBalance: 2500,
      totalUsdValue: 2500.00,
      holders: [
        { address: 'kushmanmb.eth', balance: '1500', usdValue: 1500 },
        { address: 'yaketh.eth', balance: '1000', usdValue: 1000 }
      ]
    },
    // ... more tokens
  ],
  byAddress: {
    'kushmanmb.eth': [...tokens],
    'yaketh.eth': [...tokens]
  },
  timestamp: 1708800000000
}
```

**Throws:** `Error` if addresses array is empty or not an array

---

#### `formatTokenBalances(data)`

Formats token balance data for display.

```javascript
const balances = await fetcher.getTokenBalances('kushmanmb.eth');
const formatted = fetcher.formatTokenBalances(balances);
console.log(formatted);
```

**Parameters:**
- `data` (object): Token balance data from `getTokenBalances()`

**Returns:** `string` - Formatted text output

---

#### `formatConsolidatedTokens(data)`

Formats consolidated token data for display.

```javascript
const consolidated = await fetcher.consolidateTokens(['kushmanmb.eth', 'yaketh.eth']);
const formatted = fetcher.formatConsolidatedTokens(consolidated);
console.log(formatted);
```

**Parameters:**
- `data` (object): Consolidated token data from `consolidateTokens()`

**Returns:** `string` - Formatted text output

---

#### `clearCache()`

Clears the internal cache.

```javascript
fetcher.clearCache();
```

---

#### `getCacheStats()`

Gets cache statistics.

```javascript
const stats = fetcher.getCacheStats();
console.log(stats);
// { size: 3, timeout: 60000, keys: ['erc20-balances-0x...'] }
```

**Returns:** `object` - Cache statistics

---

### Static Methods

#### `ERC20Fetcher.getABI(functionName)`

Gets the ABI definition for a specific ERC-20 function.

```javascript
const balanceOfABI = ERC20Fetcher.getABI('balanceOf');
console.log(balanceOfABI);
```

**Parameters:**
- `functionName` (string): Name of the ERC-20 function

**Returns:** `object|null` - ABI definition or null if not found

**Available Functions:**
- `balanceOf`
- `totalSupply`
- `name`
- `symbol`
- `decimals`

---

#### `ERC20Fetcher.getAllABIs()`

Gets all ERC-20 standard ABI definitions.

```javascript
const allABIs = ERC20Fetcher.getAllABIs();
console.log(allABIs);
```

**Returns:** `object` - Object containing all ABI definitions

## Usage Examples

### Example 1: Fetch Balances for a Single Address

```javascript
const ERC20Fetcher = require('./src/erc20.js');

async function fetchBalances() {
  const fetcher = new ERC20Fetcher();
  
  try {
    // Fetch token balances
    const balances = await fetcher.getTokenBalances('kushmanmb.eth');
    
    // Display formatted output
    console.log(fetcher.formatTokenBalances(balances));
    
    // Access individual tokens
    balances.tokens.forEach(token => {
      console.log(`${token.tokenSymbol}: ${token.balance}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchBalances();
```

### Example 2: Consolidate Multiple Addresses

```javascript
const ERC20Fetcher = require('./src/erc20.js');

async function consolidateAddresses() {
  const fetcher = new ERC20Fetcher();
  
  const addresses = [
    'kushmanmb.eth',
    'yaketh.eth',
    '0x1234567890123456789012345678901234567890'
  ];
  
  try {
    const consolidated = await fetcher.consolidateTokens(addresses);
    
    console.log(fetcher.formatConsolidatedTokens(consolidated));
    
    // Access consolidated data
    console.log(`Total unique tokens: ${consolidated.uniqueTokens}`);
    console.log(`Total addresses: ${consolidated.totalAddresses}`);
    
    // Find tokens with highest total value
    const sortedByValue = [...consolidated.tokens]
      .sort((a, b) => b.totalUsdValue - a.totalUsdValue);
    
    console.log('\nTop 5 tokens by value:');
    sortedByValue.slice(0, 5).forEach((token, i) => {
      console.log(`${i + 1}. ${token.tokenSymbol}: $${token.totalUsdValue.toFixed(2)}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

consolidateAddresses();
```

### Example 3: Filter Tokens by Symbol

```javascript
const ERC20Fetcher = require('./src/erc20.js');

async function filterTokens() {
  const fetcher = new ERC20Fetcher();
  
  const balances = await fetcher.getTokenBalances('kushmanmb.eth');
  
  // Filter for stablecoins
  const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD'];
  const stablecoinBalances = balances.tokens.filter(token => 
    stablecoins.includes(token.tokenSymbol)
  );
  
  console.log('Stablecoin Holdings:');
  stablecoinBalances.forEach(token => {
    console.log(`${token.tokenSymbol}: ${token.balance} ($${token.usdValue?.toFixed(2) || 'N/A'})`);
  });
}

filterTokens();
```

### Example 4: Export to JSON

```javascript
const ERC20Fetcher = require('./src/erc20.js');
const fs = require('fs');

async function exportToJSON() {
  const fetcher = new ERC20Fetcher();
  
  const addresses = ['kushmanmb.eth', 'yaketh.eth'];
  const consolidated = await fetcher.consolidateTokens(addresses);
  
  // Save to JSON file
  fs.writeFileSync(
    'token-balances.json',
    JSON.stringify(consolidated, null, 2)
  );
  
  console.log('Token balances exported to token-balances.json');
}

exportToJSON();
```

### Example 5: Using ABI Definitions

```javascript
const ERC20Fetcher = require('./src/erc20.js');

// Get specific ABI
const balanceOfABI = ERC20Fetcher.getABI('balanceOf');
console.log('Function signature:', balanceOfABI.signature);

// Get all ABIs
const allABIs = ERC20Fetcher.getAllABIs();
Object.keys(allABIs).forEach(func => {
  console.log(`${func}: ${allABIs[func].signature}`);
});

// Use ABI for contract interaction (with ethers.js)
// const contract = new ethers.Contract(tokenAddress, [balanceOfABI], provider);
// const balance = await contract.balanceOf(address);
```

## Error Handling

The module throws descriptive errors for common issues:

```javascript
const fetcher = new ERC20Fetcher();

// Invalid address format
try {
  await fetcher.getTokenBalances('invalid-address');
} catch (error) {
  console.error(error.message); // "Invalid Ethereum address format"
}

// Empty addresses array
try {
  await fetcher.consolidateTokens([]);
} catch (error) {
  console.error(error.message); // "Addresses must be a non-empty array"
}

// API request failure
try {
  await fetcher.getTokenBalances('0x...');
} catch (error) {
  console.error(error.message); // "Error fetching token balances: ..."
}
```

## Caching

The module implements automatic caching with a 1-minute timeout to improve performance and reduce API calls.

```javascript
const fetcher = new ERC20Fetcher();

// First call - fetches from API
const balances1 = await fetcher.getTokenBalances('kushmanmb.eth');

// Second call within 1 minute - returns cached data
const balances2 = await fetcher.getTokenBalances('kushmanmb.eth');

// Check cache statistics
console.log(fetcher.getCacheStats());

// Clear cache if needed
fetcher.clearCache();
```

## ERC-20 Standard Reference

### Function Signatures

| Function | Signature | Description |
|----------|-----------|-------------|
| `balanceOf(address)` | `0x70a08231` | Returns token balance of an address |
| `totalSupply()` | `0x18160ddd` | Returns total token supply |
| `name()` | `0x06fdde03` | Returns token name |
| `symbol()` | `0x95d89b41` | Returns token symbol |
| `decimals()` | `0x313ce567` | Returns token decimals |

## Data Sources

This module uses the [Blockchair API](https://blockchair.com/api/docs) to fetch token balance data. No API key is required for basic usage.

## Related Modules

- **[ERC-721 Module](./ERC721.md)** - NFT token utilities
- **[Ethereum Blockchair Module](./ETHEREUM-BLOCKCHAIR.md)** - General Ethereum blockchain data
- **[Address Tracker Module](./ADDRESS-TRACKER.md)** - Multi-address tracking
- **[Etherscan Token Balance Module](./ETHERSCAN-TOKEN-BALANCE.md)** - Alternative token balance fetcher

## Testing

Run the test suite:

```bash
npm run test:erc20
```

Run the demo:

```bash
npm run erc20:demo
```

## Contributing

Contributions are welcome! Please ensure:
- All tests pass
- New features include tests
- Documentation is updated
- Code follows existing style

## License

ISC

## Author

**Matthew Brace (kushmanmb)**
- Email: kushmanmb@gmx.com
- Website: https://kushmanmb.org
- ENS: kushmanmb.eth

---

*Part of the [Big World Bigger Ideas](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-) project*
