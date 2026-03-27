# Blockchair Multi-Chain Module

## Overview

The Blockchair Multi-Chain module provides a unified interface for fetching and analyzing blockchain data across multiple blockchains from the Blockchair API. This module enables developers to access real-time and historical blockchain statistics, including block information, address data, transactions, and network statistics for Bitcoin, Ethereum, Litecoin, and many other chains.

## Features

- 🌐 **Multi-Chain Support**: Works with Bitcoin, Ethereum, Litecoin, and 10+ other blockchains
- 📝 **Transaction Dashboard**: Primary focus on transaction data retrieval
- 📊 **Blockchain Statistics**: Fetch comprehensive blockchain stats for any supported chain
- 🧱 **Block Information**: Get detailed information about specific blocks
- 💼 **Address Data**: Query address balances, transactions, and history
- 📚 **Recent Data**: Fetch the most recent blocks and transactions
- 💾 **Smart Caching**: Automatic caching with configurable timeout (default: 60 seconds)
- 📋 **Data Formatting**: Built-in formatting utilities for display
- ✅ **Validation**: Robust input validation with informative error messages
- 🔄 **Independent Instances**: Create separate instances for different chains

## Installation

No additional dependencies required beyond Node.js standard library. The module uses the built-in `https` module for API requests.

## Quick Start

```javascript
const BlockchairFetcher = require('./src/blockchair.js');

// Create a fetcher instance for Bitcoin
const btcFetcher = new BlockchairFetcher('bitcoin');

// Fetch a transaction (primary feature)
const txHash = 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d';
const txInfo = await btcFetcher.getTransaction(txHash);
console.log(btcFetcher.formatTransaction(txInfo));

// Create a fetcher for Ethereum
const ethFetcher = new BlockchairFetcher('ethereum');
const ethStats = await ethFetcher.getStats();
console.log(ethFetcher.formatStats(ethStats));
```

## API Reference

### Constructor

#### `new BlockchairFetcher(chain, baseUrl)`

Creates a new Blockchair fetcher instance for a specific blockchain.

**Parameters:**
- `chain` (string, required): The blockchain to query (e.g., 'bitcoin', 'ethereum', 'litecoin')
- `baseUrl` (string, optional): The base API URL. Default: `'api.blockchair.com'`

**Example:**
```javascript
// Bitcoin instance
const btcFetcher = new BlockchairFetcher('bitcoin');

// Ethereum instance
const ethFetcher = new BlockchairFetcher('ethereum');

// Custom endpoint
const customFetcher = new BlockchairFetcher('bitcoin', 'custom.api.blockchair.com');
```

**Throws:** `Error` if chain is not provided

---

### Methods

#### `getTransaction(txHash)`

**Primary Feature**: Fetches information about a specific transaction using the transaction dashboard endpoint.

**API Endpoint**: `/{chain}/dashboards/transaction/{hash}`

**Parameters:**
- `txHash` (string): Transaction hash (64 hexadecimal characters, with or without 0x prefix)

**Returns:** `Promise<object>` - Transaction information including hash, time, block, size, fees, inputs, and outputs

**Example:**
```javascript
const fetcher = new BlockchairFetcher('bitcoin');
const txHash = 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d';
const txInfo = await fetcher.getTransaction(txHash);
console.log(fetcher.formatTransaction(txInfo));

// Ethereum example with 0x prefix
const ethFetcher = new BlockchairFetcher('ethereum');
const ethHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const ethTx = await ethFetcher.getTransaction(ethHash);
```

**Throws:** `Error` if txHash is invalid or request fails

---

#### `getStats()`

Fetches general blockchain statistics for the configured chain.

**API Endpoint**: `/{chain}/stats`

**Returns:** `Promise<object>` - Blockchain statistics including block count, transactions, circulation, difficulty, hashrate, and more

**Example:**
```javascript
const fetcher = new BlockchairFetcher('bitcoin');
const stats = await fetcher.getStats();
console.log(stats.data.blocks); // Latest block number
console.log(stats.data.difficulty); // Current difficulty
console.log(stats.data.hashrate_24h); // 24-hour hashrate
```

**Throws:** `Error` if request fails

---

#### `getBlock(blockId)`

Fetches information about a specific block.

**API Endpoint**: `/{chain}/dashboards/block/{id}`

**Parameters:**
- `blockId` (number|string): Block height (number) or block hash (string)

**Returns:** `Promise<object>` - Block information including hash, timestamp, transactions, size, and difficulty

**Example:**
```javascript
const fetcher = new BlockchairFetcher('bitcoin');

// By block height
const block = await fetcher.getBlock(800000);

// By block hash
const block2 = await fetcher.getBlock('00000000000000000001c...');

console.log(fetcher.formatBlock(block));
```

**Throws:** `Error` if blockId is invalid or request fails

---

#### `getAddress(address)`

Fetches information about a specific blockchain address.

**API Endpoint**: `/{chain}/dashboards/address/{address}`

**Parameters:**
- `address` (string): Blockchain address

**Returns:** `Promise<object>` - Address information including balance, transaction count, total received, and total spent

**Example:**
```javascript
const fetcher = new BlockchairFetcher('bitcoin');
const address = await fetcher.getAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
console.log(fetcher.formatAddress(address));

// Ethereum example
const ethFetcher = new BlockchairFetcher('ethereum');
const ethAddress = await ethFetcher.getAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
```

**Throws:** `Error` if address is invalid or request fails

---

#### `getRecentBlocks(limit)`

Fetches recent blocks from the blockchain.

**API Endpoint**: `/{chain}/blocks?limit={limit}`

**Parameters:**
- `limit` (number, optional): Number of blocks to fetch. Default: 10, Range: 1-100

**Returns:** `Promise<object>` - Recent blocks data

**Example:**
```javascript
const fetcher = new BlockchairFetcher('ethereum');
const recentBlocks = await fetcher.getRecentBlocks(20);
console.log(recentBlocks);
```

**Throws:** `Error` if limit is invalid or request fails

---

#### `getRecentTransactions(limit)`

Fetches recent transactions from the blockchain.

**API Endpoint**: `/{chain}/transactions?limit={limit}`

**Parameters:**
- `limit` (number, optional): Number of transactions to fetch. Default: 10, Range: 1-100

**Returns:** `Promise<object>` - Recent transactions data

**Example:**
```javascript
const fetcher = new BlockchairFetcher('bitcoin');
const recentTxs = await fetcher.getRecentTransactions(50);
console.log(recentTxs);
```

**Throws:** `Error` if limit is invalid or request fails

---

#### `formatStats(data)`

Formats blockchain statistics for display.

**Parameters:**
- `data` (object): Raw statistics data from the API

**Returns:** `string` - Formatted output string

**Example:**
```javascript
const fetcher = new BlockchairFetcher('bitcoin');
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

---

#### `formatAddress(data)`

Formats address information for display.

**Parameters:**
- `data` (object): Raw address data from the API

**Returns:** `string` - Formatted output string

---

#### `formatTransaction(data)`

Formats transaction information for display.

**Parameters:**
- `data` (object): Raw transaction data from the API

**Returns:** `string` - Formatted output string

**Example:**
```javascript
const fetcher = new BlockchairFetcher('bitcoin');
const txHash = 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d';
const tx = await fetcher.getTransaction(txHash);
const formatted = fetcher.formatTransaction(tx);
console.log(formatted);
```

---

#### `getSupportedChains()`

Gets the list of supported blockchain chains.

**Returns:** `Array<string>` - List of supported chain names

**Example:**
```javascript
const fetcher = new BlockchairFetcher('bitcoin');
const chains = fetcher.getSupportedChains();
console.log('Supported chains:', chains);
// Output: ['bitcoin', 'ethereum', 'litecoin', 'bitcoin-cash', ...]
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

**Returns:** `object` - Cache statistics including size, timeout, chain, and keys

**Example:**
```javascript
const stats = fetcher.getCacheStats();
console.log(`Cache size: ${stats.size}`);
console.log(`Chain: ${stats.chain}`);
console.log(`Timeout: ${stats.timeout}ms`);
```

---

## Supported Chains

The module supports the following blockchain networks:

1. **Bitcoin** (`bitcoin`)
2. **Ethereum** (`ethereum`)
3. **Litecoin** (`litecoin`)
4. **Bitcoin Cash** (`bitcoin-cash`)
5. **Dogecoin** (`dogecoin`)
6. **Dash** (`dash`)
7. **Ripple** (`ripple`)
8. **Groestlcoin** (`groestlcoin`)
9. **Stellar** (`stellar`)
10. **Monero** (`monero`)
11. **Cardano** (`cardano`)
12. **Zcash** (`zcash`)
13. **Mixin** (`mixin`)

**Note:** Chain names are case-insensitive. The module will convert them to lowercase automatically.

## Transaction Hash Formats

### Bitcoin, Litecoin, and similar UTXO-based chains
- **Format**: 64 hexadecimal characters
- **Example**: `a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d`

### Ethereum and EVM-compatible chains
- **Format**: 64 hexadecimal characters (with optional `0x` prefix)
- **Example**: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

The module accepts both formats and validates the hash before making API requests.

## Caching

The module implements automatic caching to reduce API calls:

- **Default Timeout**: 60 seconds (60,000ms)
- **Cache Key Format**: `{chain}-{endpoint}-{params}`
- **Cache Storage**: In-memory Map structure
- **Auto-Expiration**: Cached data expires after the timeout period

### Cache Management

```javascript
// Get cache statistics
const stats = fetcher.getCacheStats();
console.log(`Cached entries: ${stats.size}`);
console.log(`Chain: ${stats.chain}`);

// Clear cache manually
fetcher.clearCache();

// Cache is automatically used for subsequent identical requests
const data1 = await fetcher.getTransaction(hash); // API call
const data2 = await fetcher.getTransaction(hash); // From cache (if within timeout)
```

## Error Handling

The module provides detailed error messages for common issues:

```javascript
try {
  const fetcher = new BlockchairFetcher('bitcoin');
  const tx = await fetcher.getTransaction(txHash);
} catch (error) {
  if (error.message.includes('Invalid transaction hash format')) {
    console.error('Invalid hash provided');
  } else if (error.message.includes('Request failed')) {
    console.error('Network error:', error.message);
  } else if (error.message.includes('timeout')) {
    console.error('Request timed out');
  } else if (error.message.includes('HTTP')) {
    console.error('API error:', error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Testing

Run the module tests:

```bash
# Run Blockchair tests only
npm run test:blockchair

# Run all tests (includes Blockchair)
npm test
```

## Demo

Run the interactive demo:

```bash
npm run blockchair:demo
```

The demo demonstrates:
- Creating fetcher instances for multiple chains
- Fetching transaction data (primary feature)
- Fetching blockchain statistics
- Fetching block and address information
- Managing cache
- Error handling
- Working with multiple chains

## Use Cases

### 1. Retrieve Transaction Information (Primary Use Case)

```javascript
const fetcher = new BlockchairFetcher('bitcoin');

// Get transaction details
const txHash = 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d';
const txInfo = await fetcher.getTransaction(txHash);
console.log(fetcher.formatTransaction(txInfo));
```

### 2. Monitor Multiple Chains Simultaneously

```javascript
const btc = new BlockchairFetcher('bitcoin');
const eth = new BlockchairFetcher('ethereum');
const ltc = new BlockchairFetcher('litecoin');

// Fetch data from all chains in parallel
const [btcStats, ethStats, ltcStats] = await Promise.all([
  btc.getStats(),
  eth.getStats(),
  ltc.getStats()
]);
```

### 3. Track Blockchain Statistics

```javascript
const fetcher = new BlockchairFetcher('ethereum');
const stats = await fetcher.getStats();

console.log(`Latest Block: ${stats.data.blocks}`);
console.log(`Total Transactions: ${stats.data.transactions}`);
console.log(`Market Price: $${stats.data.market_price_usd}`);
```

### 4. Analyze Address Activity

```javascript
const fetcher = new BlockchairFetcher('bitcoin');
const address = await fetcher.getAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');

console.log(fetcher.formatAddress(address));
```

### 5. Get Recent Network Activity

```javascript
const fetcher = new BlockchairFetcher('ethereum');

// Get recent blocks
const blocks = await fetcher.getRecentBlocks(10);

// Get recent transactions
const txs = await fetcher.getRecentTransactions(20);
```

## API Endpoints

The module uses the following Blockchair API endpoints:

- **Transaction Dashboard**: `/{chain}/dashboards/transaction/{hash}` ⭐ Primary Feature
- **Statistics**: `/{chain}/stats`
- **Block Information**: `/{chain}/dashboards/block/{id}`
- **Address Information**: `/{chain}/dashboards/address/{address}`
- **Recent Blocks**: `/{chain}/blocks?limit={limit}`
- **Recent Transactions**: `/{chain}/transactions?limit={limit}`

For complete API documentation, visit: [blockchair.com/api/docs](https://blockchair.com/api/docs)

## Best Practices

1. **Choose the Right Chain**: Always specify the correct chain for your use case
2. **Validate Input**: The module validates inputs, but pre-validation can improve UX
3. **Leverage Caching**: The built-in cache reduces API calls and improves performance
4. **Handle Errors Gracefully**: Always wrap API calls in try-catch blocks
5. **Respect Rate Limits**: Be mindful of Blockchair API rate limits (30 requests/minute for free tier)
6. **Use Appropriate Limits**: When fetching recent data, use only the limit you need
7. **Independent Instances**: Create separate instances for different chains to maintain independent caches

## Limitations

- **Network Dependency**: Requires internet connectivity to fetch data from Blockchair
- **API Rate Limits**: Subject to Blockchair API rate limits (free tier: 30 requests/minute)
- **Memory Usage**: Cache is stored in memory; large caches may consume significant memory
- **Timeout**: Requests timeout after 10 seconds
- **Chain Support**: Limited to chains supported by Blockchair API

## Troubleshooting

### Network Errors

If you encounter network errors:
- Check internet connectivity
- Verify the API endpoint is accessible
- Check for firewall or proxy restrictions
- Ensure you're not exceeding rate limits

### Invalid Hash Errors

Valid transaction hashes:
- Must be exactly 64 hexadecimal characters
- May optionally include `0x` prefix for Ethereum-based chains
- Only contain characters: 0-9, a-f, A-F

### Timeout Errors

If requests timeout:
- Check network speed
- Verify the API is not experiencing issues
- Consider retry logic with exponential backoff

### Chain Not Supported

If you get warnings about unsupported chains:
- Check the list of supported chains using `getSupportedChains()`
- Verify the chain name spelling
- Consult Blockchair API documentation for the latest supported chains

## Comparison with Litecoin-Only Module

| Feature | Blockchair Multi-Chain | Litecoin Blockchair |
|---------|------------------------|---------------------|
| Chains Supported | 13+ blockchains | Litecoin only |
| Transaction Dashboard | ✅ Yes | ✅ Yes |
| Multi-Chain | ✅ Yes | ❌ No |
| Cache Per Instance | Chain-specific | N/A |
| Recent Transactions | ✅ Yes | ❌ No |
| Address Format | Chain-specific | Litecoin only |

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
