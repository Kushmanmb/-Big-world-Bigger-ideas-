# Ethereum Blockchair Module

## Overview

The Ethereum Blockchair module provides a comprehensive interface for fetching and analyzing Ethereum blockchain data from the Blockchair API. This module enables developers to access real-time and historical Ethereum blockchain statistics, including block information, address data, transactions, network statistics, and ERC-20 token balances. It fully supports ENS name resolution, including **kushmanmb.eth**.

## Features

- 📊 **Blockchain Statistics**: Fetch comprehensive Ethereum blockchain stats
- 🧱 **Block Information**: Get detailed information about specific blocks
- 💼 **Address Data**: Query address balances, transactions, and history
- 🏷️ **ENS Support**: Full support for ENS names like kushmanmb.eth, vitalik.eth
- 📝 **Transaction Details**: Access detailed transaction information
- 🪙 **ERC-20 Tokens**: Fetch ERC-20 token balances for any address
- 📚 **Recent Blocks**: Fetch the most recent blocks on the blockchain
- 💾 **Smart Caching**: Automatic caching with configurable timeout (default: 60 seconds)
- 📋 **Data Formatting**: Built-in formatting utilities for display
- ✅ **Validation**: Robust input validation with informative error messages
- 🌐 **Flexible Configuration**: Support for custom API endpoints

## Installation

No additional dependencies required beyond Node.js standard library. The module uses the built-in `https` module for API requests.

## Quick Start

```javascript
const EthereumBlockchairFetcher = require('./src/ethereum-blockchair.js');

// Create a fetcher instance
const fetcher = new EthereumBlockchairFetcher();

// Fetch blockchain statistics
const stats = await fetcher.getStats();
console.log(fetcher.formatStats(stats));

// Fetch data for kushmanmb.eth (ENS name resolution)
const addressData = await fetcher.getAddress('kushmanmb.eth');
console.log(fetcher.formatAddress(addressData));

// Fetch ERC-20 token balances
const tokens = await fetcher.getTokenBalances('kushmanmb.eth');
console.log(fetcher.formatTokenBalances(tokens));
```

## API Reference

### Constructor

#### `new EthereumBlockchairFetcher(baseUrl)`

Creates a new Ethereum Blockchair fetcher instance.

**Parameters:**
- `baseUrl` (string, optional): The base API URL. Default: `'api.blockchair.com'`

**Example:**
```javascript
// Use default endpoint
const fetcher = new EthereumBlockchairFetcher();

// Use custom endpoint
const customFetcher = new EthereumBlockchairFetcher('custom.api.blockchair.com');
```

### Methods

#### `getStats()`

Fetches general Ethereum blockchain statistics.

**Returns:** `Promise<object>` - Blockchain statistics including block count, transactions, circulation, difficulty, hashrate, and more

**Example:**
```javascript
const stats = await fetcher.getStats();
console.log(stats.data.blocks); // Latest block number
console.log(stats.data.difficulty); // Current difficulty
console.log(stats.data.market_price_usd); // ETH price in USD
```

**Throws:** `Error` if request fails

---

#### `getBlock(blockId)`

Fetches information about a specific Ethereum block.

**Parameters:**
- `blockId` (number|string): Block height (number) or block hash (string)

**Returns:** `Promise<object>` - Block information including hash, timestamp, transactions, size, and difficulty

**Example:**
```javascript
// By block height
const block = await fetcher.getBlock(18000000);

// By block hash
const block2 = await fetcher.getBlock('0xabc123...');

console.log(block.data.id); // Block height
console.log(block.data.transaction_count); // Number of transactions
```

**Throws:** `Error` if blockId is invalid or request fails

---

#### `getAddress(address)`

Fetches information about a specific Ethereum address. **Fully supports ENS names** like kushmanmb.eth.

**Parameters:**
- `address` (string): Ethereum address (0x...) or ENS name (.eth)

**Returns:** `Promise<object>` - Address information including balance, transaction count, total received, and total spent

**Example:**
```javascript
// Using ENS name
const kushmanmb = await fetcher.getAddress('kushmanmb.eth');

// Using regular address
const address = await fetcher.getAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

console.log(kushmanmb.data); // Address data
```

**Throws:** `Error` if address is invalid or request fails

---

#### `getTransaction(txHash)`

Fetches information about a specific transaction.

**Parameters:**
- `txHash` (string): Transaction hash (64 hexadecimal characters, with or without 0x prefix)

**Returns:** `Promise<object>` - Transaction information

**Example:**
```javascript
const tx = await fetcher.getTransaction('0x1234567890abcdef...');
console.log(tx);
```

**Throws:** `Error` if txHash is invalid or request fails

---

#### `getRecentBlocks(limit)`

Fetches recent blocks from the Ethereum blockchain.

**Parameters:**
- `limit` (number, optional): Number of blocks to fetch. Default: 10, Range: 1-100

**Returns:** `Promise<object>` - Recent blocks data

**Example:**
```javascript
const recentBlocks = await fetcher.getRecentBlocks(10);
console.log(recentBlocks);
```

**Throws:** `Error` if limit is invalid or request fails

---

#### `getTokenBalances(address)`

Fetches ERC-20 token balances for an Ethereum address. **Supports ENS names**.

**Parameters:**
- `address` (string): Ethereum address (0x...) or ENS name (.eth)

**Returns:** `Promise<object>` - Token balances including token names, symbols, and amounts

**Example:**
```javascript
// Fetch token balances for kushmanmb.eth
const tokens = await fetcher.getTokenBalances('kushmanmb.eth');
console.log(fetcher.formatTokenBalances(tokens));
```

**Throws:** `Error` if address is invalid or request fails

---

#### `formatStats(data)`

Formats blockchain statistics for display.

**Parameters:**
- `data` (object): Raw statistics data from the API

**Returns:** `string` - Formatted output string

**Example:**
```javascript
const stats = await fetcher.getStats();
const formatted = fetcher.formatStats(stats);
console.log(formatted);
```

---

#### `formatBlock(data)`

Formats block information for display.

**Parameters:**
- `data` (object): Raw block data from the API

**Returns:** `string` - Formatted output string

**Example:**
```javascript
const block = await fetcher.getBlock(18000000);
const formatted = fetcher.formatBlock(block);
console.log(formatted);
```

---

#### `formatAddress(data)`

Formats address information for display.

**Parameters:**
- `data` (object): Raw address data from the API

**Returns:** `string` - Formatted output string

**Example:**
```javascript
const address = await fetcher.getAddress('kushmanmb.eth');
const formatted = fetcher.formatAddress(address);
console.log(formatted);
```

---

#### `formatTokenBalances(data)`

Formats ERC-20 token balance information for display.

**Parameters:**
- `data` (object): Raw token data from the API

**Returns:** `string` - Formatted output string

**Example:**
```javascript
const tokens = await fetcher.getTokenBalances('kushmanmb.eth');
const formatted = fetcher.formatTokenBalances(tokens);
console.log(formatted);
```

---

#### `clearCache()`

Clears the internal cache.

**Example:**
```javascript
fetcher.clearCache();
```

---

#### `getCacheStats()`

Gets cache statistics.

**Returns:** `object` - Cache statistics including size, timeout, and keys

**Example:**
```javascript
const stats = fetcher.getCacheStats();
console.log(`Cache size: ${stats.size}`);
console.log(`Cache timeout: ${stats.timeout}ms`);
console.log(`Cached keys: ${stats.keys.join(', ')}`);
```

## ENS Name Support

The module fully supports Ethereum Name Service (ENS) resolution. You can use ENS names like `kushmanmb.eth` anywhere a regular Ethereum address is accepted.

**Supported ENS names:**
- kushmanmb.eth
- vitalik.eth
- Any valid .eth domain

**Example:**
```javascript
// Fetch address data using ENS
const data = await fetcher.getAddress('kushmanmb.eth');

// Fetch token balances using ENS
const tokens = await fetcher.getTokenBalances('kushmanmb.eth');
```

The Blockchair API automatically resolves ENS names to their corresponding Ethereum addresses.

## Ethereum Address Format

Ethereum addresses must match one of these formats:
- **Standard Address**: Starts with `0x`, followed by 40 hexadecimal characters
- **ENS Name**: Any valid .eth domain name

Valid character set for addresses: `[a-fA-F0-9]` (hexadecimal)

**Examples:**
- `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` (Standard address)
- `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0` (Standard address)
- `kushmanmb.eth` (ENS name)
- `vitalik.eth` (ENS name)

## Transaction Hash Format

Transaction hashes must be 64 hexadecimal characters (256 bits), with optional `0x` prefix.

**Example:**
```
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```
or
```
1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## Data Structure Examples

### Blockchain Statistics Response

```json
{
  "data": {
    "blocks": 18000000,
    "transactions": 2000000000,
    "circulation": 120000000000000000000000000,
    "difficulty": 0,
    "hashrate_24h": "1000 TH/s",
    "blockchain_size": 800000000000,
    "nodes": 8000,
    "market_price_usd": 2000.50,
    "market_cap_usd": 240000000000
  }
}
```

### Formatted Statistics Output

```
Ethereum Blockchain Statistics
================================

Latest Block: 18,000,000
Total Transactions: 2,000,000,000
Circulating Supply: 120,000,000 ETH
24h Hashrate: 1000 TH/s
Blockchain Size: 745.06 GB
Network Nodes: 8000
Market Price: $2000.50 USD
Market Cap: $240.00B USD
```

### Address Information Response

```json
{
  "data": {
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045": {
      "address": {
        "balance": 1000000000000000000,
        "transaction_count": 100,
        "received_approximate": 5000000000000000000,
        "spent_approximate": 4000000000000000000,
        "first_seen_receiving": "2020-01-01T00:00:00Z"
      }
    }
  }
}
```

### ERC-20 Token Balances Response

```json
{
  "data": {
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045": {
      "layer_2": {
        "erc_20": [
          {
            "token_name": "Wrapped Ether",
            "token_symbol": "WETH",
            "balance": "1000000000000000000",
            "token_address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          },
          {
            "token_name": "USD Coin",
            "token_symbol": "USDC",
            "balance": "1000000",
            "token_address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
          }
        ]
      }
    }
  }
}
```

## Caching

The module implements automatic caching to reduce API calls:

- **Default Timeout**: 60 seconds (60,000ms)
- **Cache Key Format**: Based on endpoint and parameters
- **Cache Storage**: In-memory Map structure
- **Auto-Expiration**: Cached data expires after the timeout period

### Cache Management

```javascript
// Get cache statistics
const stats = fetcher.getCacheStats();
console.log(`Cached entries: ${stats.size}`);

// Clear cache manually
fetcher.clearCache();

// Cache is automatically used for subsequent identical requests
const data1 = await fetcher.getStats(); // API call
const data2 = await fetcher.getStats(); // From cache (if within timeout)
```

## Error Handling

The module provides detailed error messages for common issues:

```javascript
try {
  const stats = await fetcher.getStats();
} catch (error) {
  if (error.message.includes('Invalid Ethereum address')) {
    console.error('Invalid address provided');
  } else if (error.message.includes('Request failed')) {
    console.error('Network error:', error.message);
  } else if (error.message.includes('timeout')) {
    console.error('Request timed out');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Testing

Run the module tests:

```bash
# Run Ethereum Blockchair tests only
npm run test:ethereum-blockchair

# Run all tests (includes Ethereum Blockchair)
npm test
```

## Demo

Run the interactive demo:

```bash
npm run ethereum-blockchair:demo
```

The demo demonstrates:
- Creating a fetcher instance
- Fetching blockchain statistics
- Fetching address info for kushmanmb.eth
- Fetching ERC-20 token balances
- Fetching specific block information
- Fetching recent blocks
- Formatting data for display
- Cache management
- Address and ENS validation examples

## Use Cases

### 1. Monitor Ethereum Network Statistics

```javascript
const fetcher = new EthereumBlockchairFetcher();

// Get current network stats
const stats = await fetcher.getStats();
console.log(fetcher.formatStats(stats));
```

### 2. Track kushmanmb.eth Activity

```javascript
const fetcher = new EthereumBlockchairFetcher();

// Get address information
const address = await fetcher.getAddress('kushmanmb.eth');
console.log(fetcher.formatAddress(address));

// Get token balances
const tokens = await fetcher.getTokenBalances('kushmanmb.eth');
console.log(fetcher.formatTokenBalances(tokens));
```

### 3. Track Specific Blocks

```javascript
const fetcher = new EthereumBlockchairFetcher();

// Get information about a specific block
const block = await fetcher.getBlock(18000000);
console.log(fetcher.formatBlock(block));
```

### 4. Monitor Address Activity with ENS

```javascript
const fetcher = new EthereumBlockchairFetcher();

// Check balance and activity using ENS name
const address = await fetcher.getAddress('vitalik.eth');
console.log(fetcher.formatAddress(address));
```

### 5. Analyze Recent Blocks

```javascript
const fetcher = new EthereumBlockchairFetcher();

// Get the 20 most recent blocks
const recentBlocks = await fetcher.getRecentBlocks(20);
console.log('Recent Blocks:', recentBlocks);
```

## API Endpoints

The module uses the following Blockchair API endpoints:

- **Statistics**: `/ethereum/stats`
- **Block Information**: `/ethereum/dashboards/block/{id}`
- **Address Information**: `/ethereum/dashboards/address/{address}` (supports ENS)
- **Transaction Information**: `/ethereum/dashboards/transaction/{hash}`
- **Recent Blocks**: `/ethereum/blocks?limit={limit}`
- **Token Balances**: `/ethereum/dashboards/address/{address}?erc_20=true`

For complete API documentation, visit: [blockchair.com/api/docs](https://blockchair.com/api/docs)

## Best Practices

1. **Use ENS Names**: The module fully supports ENS names - use them for better readability
2. **Validate Input**: Always validate addresses and transaction hashes before querying
3. **Leverage Caching**: The built-in cache reduces API calls and improves performance
4. **Handle Errors Gracefully**: Always wrap API calls in try-catch blocks
5. **Monitor Cache Size**: Use `getCacheStats()` to monitor cache usage
6. **Clear Cache When Needed**: Use `clearCache()` to free memory if needed
7. **Respect Rate Limits**: Be mindful of Blockchair API rate limits
8. **Use Appropriate Limits**: When fetching recent blocks, use only the limit you need

## Limitations

- **Network Dependency**: Requires internet connectivity to fetch data from Blockchair
- **API Rate Limits**: Subject to Blockchair API rate limits (free tier: 30 requests/minute)
- **Memory Usage**: Cache is stored in memory; large caches may consume significant memory
- **Timeout**: Requests timeout after 10 seconds
- **Network**: Only supports Ethereum mainnet (not testnets)
- **ENS Resolution**: ENS names are resolved by the Blockchair API, not locally

## Troubleshooting

### Network Errors

If you encounter network errors:
- Check internet connectivity
- Verify the API endpoint is accessible
- Check for firewall or proxy restrictions
- Ensure you're not exceeding rate limits

### Invalid Address Errors

Valid Ethereum addresses:
- Start with 0x and are 42 characters long (40 hex chars + 0x)
- Use hexadecimal characters (0-9, a-f, A-F)
- OR are valid ENS names ending in .eth

### Invalid Transaction Hash Errors

Valid transaction hashes:
- Must be exactly 64 hexadecimal characters
- Only contain characters: 0-9, a-f, A-F
- Optional 0x prefix

### Timeout Errors

If requests timeout:
- Check network speed
- Try increasing the timeout in the code (currently 10 seconds)
- Verify the API is not experiencing issues

### ENS Resolution Errors

If ENS names don't resolve:
- Ensure the ENS name is registered and valid
- Check that the ENS name ends with .eth
- The Blockchair API handles ENS resolution - if it fails, the name may not exist

## Comparison with Litecoin Module

| Feature | Ethereum Blockchair | Litecoin Blockchair |
|---------|---------------------|---------------------|
| API Source | Blockchair | Blockchair |
| ENS Support | Yes | No |
| Token Balances | Yes (ERC-20) | No |
| Focus | General blockchain + tokens | General blockchain |
| Cache Timeout | 60 seconds | 60 seconds |
| Address Support | Full + ENS | Full |
| Block Queries | Yes | Yes |
| Transaction Queries | Yes | Yes |
| Statistics | Comprehensive | Comprehensive |

## Contributing

To contribute to this module:
1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## License

ISC License - See repository root for details

## Author

**Matthew Brace (kushmanmb)**
- GitHub: [@Kushmanmb](https://github.com/Kushmanmb)
- Website: [kushmanmb.org](https://kushmanmb.org)
- Email: kushmanmb@gmx.com
- ENS: kushmanmb.eth

---

**Part of the Big World Bigger Ideas project**  
*Empowering crypto clarity, fueled by innovation and style*
