# Etherscan Token Balance Fetcher

This module provides functionality to fetch ERC-20 and ERC-721 token balances from the Etherscan API for Ethereum and other EVM-compatible blockchains.

## Features

- **Etherscan API Integration**: Fetch token balances directly from Etherscan API v2
- **Address Validation**: Validates Ethereum addresses with proper formatting
- **Token Filtering**: Filter tokens by type (ERC-20, ERC-721, etc.)
- **Caching**: Built-in caching to reduce API calls and improve performance
- **Pagination Support**: Handle large token lists with page and offset parameters
- **Multi-Chain Support**: Works with Ethereum mainnet, Base, and other EVM chains

## Installation

This module is part of the Big World Bigger Ideas blockchain utilities package.

```javascript
const EtherscanTokenBalanceFetcher = require('./etherscan-token-balance.js');
```

## Quick Start

```javascript
const EtherscanTokenBalanceFetcher = require('./etherscan-token-balance.js');

// Initialize with your Etherscan API key
const apiKey = 'YOUR_ETHERSCAN_API_KEY';
const chainId = 1; // 1 = Ethereum mainnet

const fetcher = new EtherscanTokenBalanceFetcher(apiKey, chainId);

// Fetch token balances for an address
const address = '0x983e3660c0bE01991785F80f266A84B911ab59b0';
const balances = await fetcher.getTokenBalances(address, 1, 100);

console.log(`Total tokens: ${balances.tokens.length}`);
```

## API Reference

### Constructor

```javascript
new EtherscanTokenBalanceFetcher(apiKey, chainId)
```

Creates a new Etherscan Token Balance Fetcher instance.

**Parameters:**
- `apiKey` (string, optional): Your Etherscan API key. Default: `null`
- `chainId` (number, optional): Chain ID of the blockchain. Default: `1` (Ethereum mainnet)

**Example:**
```javascript
const fetcher = new EtherscanTokenBalanceFetcher('my-api-key', 1);
```

### getTokenBalances(address, page, offset)

Fetches token balances for a specific address.

**Parameters:**
- `address` (string, required): The wallet address to query
- `page` (number, optional): Page number for pagination. Default: `1`
- `offset` (number, optional): Number of results per page (1-100). Default: `100`

**Returns:** Promise that resolves to an object containing:
- `address`: The validated address
- `chainId`: The chain ID used
- `page`: The page number
- `offset`: The offset used
- `tokens`: Array of token objects
- `status`: API response status
- `message`: API response message
- `timestamp`: Timestamp of the fetch

**Example:**
```javascript
const balances = await fetcher.getTokenBalances(
  '0x983e3660c0bE01991785F80f266A84B911ab59b0',
  1,
  100
);

console.log(`Found ${balances.tokens.length} tokens`);
```

### validateAddress(address)

Validates and normalizes an Ethereum address.

**Parameters:**
- `address` (string, required): The address to validate

**Returns:** Validated address with 0x prefix

**Throws:** Error if address is invalid

**Example:**
```javascript
const validated = fetcher.validateAddress('983e3660c0bE01991785F80f266A84B911ab59b0');
// Returns: "0x983e3660c0be01991785f80f266a84b911ab59b0"
```

### formatTokenBalances(data)

Formats token balance data for display.

**Parameters:**
- `data` (object, required): Token balance data from `getTokenBalances()`

**Returns:** Formatted string for console output

**Example:**
```javascript
const balances = await fetcher.getTokenBalances(address);
console.log(fetcher.formatTokenBalances(balances));
```

### Static Methods

#### filterTokensByType(tokens, tokenType)

Filters an array of tokens by their type.

**Parameters:**
- `tokens` (array, required): Array of token objects
- `tokenType` (string, required): Type to filter by (e.g., "ERC-20", "ERC-721")

**Returns:** Filtered array of tokens

**Example:**
```javascript
const erc20Tokens = EtherscanTokenBalanceFetcher.filterTokensByType(
  balances.tokens,
  'ERC-20'
);
console.log(`Found ${erc20Tokens.length} ERC-20 tokens`);
```

#### getTotalTokenCount(data)

Gets the total number of tokens in the balance data.

**Parameters:**
- `data` (object, required): Token balance data

**Returns:** Number of tokens

**Example:**
```javascript
const count = EtherscanTokenBalanceFetcher.getTotalTokenCount(balances);
console.log(`Total tokens: ${count}`);
```

### Cache Methods

#### clearCache()

Clears the internal cache.

**Example:**
```javascript
fetcher.clearCache();
```

#### getCacheStats()

Gets statistics about the cache.

**Returns:** Object with cache statistics:
- `size`: Number of cached entries
- `timeout`: Cache timeout in milliseconds
- `keys`: Array of cached keys

**Example:**
```javascript
const stats = fetcher.getCacheStats();
console.log(`Cache size: ${stats.size}`);
```

### Configuration Methods

#### getAPIInfo()

Gets current API configuration.

**Returns:** Object with API information:
- `baseUrl`: API base URL
- `chainId`: Current chain ID
- `hasApiKey`: Whether API key is set
- `cacheTimeout`: Cache timeout in milliseconds

**Example:**
```javascript
const info = fetcher.getAPIInfo();
// { baseUrl: 'api.etherscan.io', chainId: 1, hasApiKey: true, cacheTimeout: 60000 }
```

## Supported Blockchains

The module supports any EVM-compatible blockchain that has an Etherscan-compatible API:

| Network | Chain ID | API Base URL |
|---------|----------|--------------|
| Ethereum Mainnet | 1 | api.etherscan.io |
| Base | 8453 | api.basescan.org |
| Polygon | 137 | api.polygonscan.com |
| Arbitrum | 42161 | api.arbiscan.io |
| Optimism | 10 | api-optimistic.etherscan.io |

Any chain with an Etherscan-compatible API can be used by providing the appropriate chain ID and customizing the base URL if needed.

## Token Data Format

Each token object in the `tokens` array contains:

```javascript
{
  "TokenAddress": "0x...",        // Contract address
  "TokenName": "Token Name",      // Token name
  "TokenSymbol": "SYMBOL",        // Token symbol
  "TokenQuantity": "1000...",     // Balance (as string)
  "TokenDivisor": "18",           // Decimals (for ERC-20)
  "TokenType": "ERC-20"           // Token type (ERC-20, ERC-721, etc.)
}
```

For ERC-721 (NFT) tokens, additional fields may include:
- `TokenId`: The specific NFT token ID

## Getting an API Key

To use this module, you need an Etherscan API key:

1. Visit [Etherscan.io](https://etherscan.io/)
2. Create a free account
3. Navigate to your account settings
4. Generate an API key under the "API Keys" section

## Best Practices

1. **Environment Variables**: Store your API key in environment variables, not in code:
   ```javascript
   const apiKey = process.env.ETHERSCAN_API_KEY;
   ```

2. **Rate Limiting**: Respect Etherscan's rate limits to avoid being blocked.
   - Free tier: 5 calls/second, 100,000 calls/day
   - Use caching to reduce API calls

3. **Error Handling**: Always wrap API calls in try-catch blocks:
   ```javascript
   try {
     const balances = await fetcher.getTokenBalances(address);
   } catch (error) {
     console.error('Failed to fetch balances:', error.message);
   }
   ```

4. **Cache Management**: Clear cache periodically if you need fresh data:
   ```javascript
   fetcher.clearCache();
   ```

## Examples

### Fetch All ERC-20 Tokens

```javascript
const balances = await fetcher.getTokenBalances(address, 1, 100);
const erc20Tokens = EtherscanTokenBalanceFetcher.filterTokensByType(
  balances.tokens,
  'ERC-20'
);

erc20Tokens.forEach(token => {
  console.log(`${token.TokenSymbol}: ${token.TokenQuantity}`);
});
```

### Fetch All NFTs (ERC-721)

```javascript
const balances = await fetcher.getTokenBalances(address, 1, 100);
const nfts = EtherscanTokenBalanceFetcher.filterTokensByType(
  balances.tokens,
  'ERC-721'
);

console.log(`Found ${nfts.length} NFTs`);
```

### Paginate Through Large Token Lists

```javascript
let page = 1;
let allTokens = [];

while (true) {
  const balances = await fetcher.getTokenBalances(address, page, 100);
  
  if (balances.tokens.length === 0) {
    break;
  }
  
  allTokens = allTokens.concat(balances.tokens);
  page++;
}

console.log(`Total tokens: ${allTokens.length}`);
```

## Error Handling

The module throws errors for:
- Invalid address format
- Missing API key
- Invalid pagination parameters (page < 1, offset > 100)
- Network errors
- API errors (rate limiting, invalid key, etc.)

Always handle these errors appropriately in your application.

## Testing

Run the test suite:

```bash
npm run test:etherscan-token-balance
```

Run the demo:

```bash
npm run etherscan-token-balance:demo
```

## Related Modules

- **contract-abi.js**: Fetch contract ABIs from Etherscan
- **erc721.js**: Fetch ERC-721 NFT metadata
- **address-tracker.js**: Track multiple addresses across chains

## License

ISC

## Author

Matthew Brace <mattbrace92@gmail.com>
