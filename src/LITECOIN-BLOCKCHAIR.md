# Litecoin Blockchair Module

## Overview

The Litecoin Blockchair module provides a comprehensive interface for fetching and analyzing Litecoin blockchain data from the Blockchair API. This module enables developers to access real-time and historical Litecoin blockchain statistics, including block information, address data, transactions, and network statistics.

## Features

- 📊 **Blockchain Statistics**: Fetch comprehensive Litecoin blockchain stats
- 🧱 **Block Information**: Get detailed information about specific blocks
- 💼 **Address Data**: Query address balances, transactions, and history
- 📝 **Transaction Details**: Access detailed transaction information
- 📚 **Recent Blocks**: Fetch the most recent blocks on the blockchain
- 💾 **Smart Caching**: Automatic caching with configurable timeout (default: 60 seconds)
- 📋 **Data Formatting**: Built-in formatting utilities for display
- ✅ **Validation**: Robust input validation with informative error messages
- 🌐 **Flexible Configuration**: Support for custom API endpoints

## Installation

No additional dependencies required beyond Node.js standard library. The module uses the built-in `https` module for API requests.

## Quick Start

```javascript
const LitecoinBlockchairFetcher = require('./src/litecoin-blockchair.js');

// Create a fetcher instance
const fetcher = new LitecoinBlockchairFetcher();

// Fetch blockchain statistics
const stats = await fetcher.getStats();

// Format and display the data
console.log(fetcher.formatStats(stats));
```

## API Reference

### Constructor

#### `new LitecoinBlockchairFetcher(baseUrl)`

Creates a new Litecoin Blockchair fetcher instance.

**Parameters:**
- `baseUrl` (string, optional): The base API URL. Default: `'api.blockchair.com'`

**Example:**
```javascript
// Use default endpoint
const fetcher = new LitecoinBlockchairFetcher();

// Use custom endpoint
const customFetcher = new LitecoinBlockchairFetcher('custom.api.blockchair.com');
```

### Methods

#### `getStats()`

Fetches general Litecoin blockchain statistics.

**Returns:** `Promise<object>` - Blockchain statistics including block count, transactions, circulation, difficulty, hashrate, and more

**Example:**
```javascript
const stats = await fetcher.getStats();
console.log(stats.data.blocks); // Latest block number
console.log(stats.data.difficulty); // Current difficulty
console.log(stats.data.hashrate_24h); // 24-hour hashrate
```

**Throws:** `Error` if request fails

---

#### `getBlock(blockId)`

Fetches information about a specific Litecoin block.

**Parameters:**
- `blockId` (number|string): Block height (number) or block hash (string)

**Returns:** `Promise<object>` - Block information including hash, timestamp, transactions, size, and difficulty

**Example:**
```javascript
// By block height
const block = await fetcher.getBlock(2500000);

// By block hash
const block2 = await fetcher.getBlock('abc123...');

console.log(block.data.id); // Block height
console.log(block.data.transaction_count); // Number of transactions
```

**Throws:** `Error` if blockId is invalid or request fails

---

#### `getAddress(address)`

Fetches information about a specific Litecoin address.

**Parameters:**
- `address` (string): Litecoin address (must start with L, M, or 3)

**Returns:** `Promise<object>` - Address information including balance, transaction count, total received, and total spent

**Example:**
```javascript
const address = await fetcher.getAddress('LhKTpQgfcNPy3aL4xG3HCVc8mXb9qTbKJ1');
console.log(address.data.balance); // Balance in satoshis
console.log(address.data.transaction_count); // Number of transactions
```

**Throws:** `Error` if address is invalid or request fails

---

#### `getTransaction(txHash)`

Fetches information about a specific transaction.

**Parameters:**
- `txHash` (string): Transaction hash (64 hexadecimal characters)

**Returns:** `Promise<object>` - Transaction information

**Example:**
```javascript
const tx = await fetcher.getTransaction('abc123def456...');
console.log(tx);
```

**Throws:** `Error` if txHash is invalid or request fails

---

#### `getRecentBlocks(limit)`

Fetches recent blocks from the Litecoin blockchain.

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
const block = await fetcher.getBlock(2500000);
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
const address = await fetcher.getAddress('LhKT...');
const formatted = fetcher.formatAddress(address);
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

## Litecoin Address Format

Litecoin addresses must match one of these formats:
- **Legacy (P2PKH)**: Starts with `L`, 33-34 characters
- **Legacy (P2SH)**: Starts with `M`, 33-34 characters
- **SegWit**: Starts with `3`, 33-34 characters

Valid character set: `[a-km-zA-HJ-NP-Z1-9]` (Base58 encoding, excludes 0, O, I, l)

**Examples:**
- `LhKTpQgfcNPy3aL4xG3HCVc8mXb9qTbKJ1` (Legacy P2PKH)
- `MHxgS2XMXjeJ4if2CmKpMJwLR5JTeMRqWr` (Legacy P2SH)
- `3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy` (SegWit)

## Transaction Hash Format

Transaction hashes must be 64 hexadecimal characters (256 bits).

**Example:**
```
a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
```

## Data Structure Examples

### Blockchain Statistics Response

```json
{
  "data": {
    "blocks": 2500000,
    "transactions": 50000000,
    "circulation": 7000000000000000,
    "difficulty": 15000000,
    "hashrate_24h": "500 TH/s",
    "blockchain_size": 50000000000,
    "nodes": 1500,
    "market_price_usd": 75.50,
    "market_cap_usd": 5500000000
  }
}
```

### Formatted Statistics Output

```
Litecoin Blockchain Statistics
================================

Latest Block: 2500000
Total Transactions: 50,000,000
Circulating Supply: 70,000,000 LTC
Difficulty: 15,000,000
24h Hashrate: 500 TH/s
Blockchain Size: 46.57 GB
Network Nodes: 1500
Market Price: $75.50 USD
Market Cap: $5500.00M USD
```

### Block Information Response

```json
{
  "data": {
    "id": 2500000,
    "hash": "abc123def456...",
    "time": "2024-01-01T00:00:00Z",
    "transaction_count": 250,
    "size": 512000,
    "difficulty": 15000000
  }
}
```

### Address Information Response

```json
{
  "data": {
    "address": "LhKTpQgfcNPy3aL4xG3HCVc8mXb9qTbKJ1",
    "balance": 100000000,
    "transaction_count": 50,
    "received": 500000000,
    "spent": 400000000
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
  if (error.message.includes('Invalid Litecoin address format')) {
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
# Run Litecoin Blockchair tests only
npm run test:litecoin-blockchair

# Run all tests (includes Litecoin Blockchair)
npm test
```

## Demo

Run the interactive demo:

```bash
npm run litecoin-blockchair:demo
```

The demo demonstrates:
- Creating a fetcher instance
- Fetching blockchain statistics
- Fetching specific block information
- Fetching recent blocks
- Formatting data for display
- Cache management
- Address validation examples

## Use Cases

### 1. Monitor Litecoin Network Statistics

```javascript
const fetcher = new LitecoinBlockchairFetcher();

// Get current network stats
const stats = await fetcher.getStats();
console.log(fetcher.formatStats(stats));
```

### 2. Track Specific Blocks

```javascript
const fetcher = new LitecoinBlockchairFetcher();

// Get information about a specific block
const block = await fetcher.getBlock(2500000);
console.log(fetcher.formatBlock(block));
```

### 3. Monitor Address Activity

```javascript
const fetcher = new LitecoinBlockchairFetcher();

// Check address balance and activity
const address = await fetcher.getAddress('LhKTpQgfcNPy3aL4xG3HCVc8mXb9qTbKJ1');
console.log(fetcher.formatAddress(address));
```

### 4. Analyze Recent Blocks

```javascript
const fetcher = new LitecoinBlockchairFetcher();

// Get the 20 most recent blocks
const recentBlocks = await fetcher.getRecentBlocks(20);
console.log('Recent Blocks:', recentBlocks);
```

## API Endpoints

The module uses the following Blockchair API endpoints:

- **Statistics**: `/litecoin/stats`
- **Block Information**: `/litecoin/dashboards/block/{id}`
- **Address Information**: `/litecoin/dashboards/address/{address}`
- **Transaction Information**: `/litecoin/dashboards/transaction/{hash}`
- **Recent Blocks**: `/litecoin/blocks?limit={limit}`

For complete API documentation, visit: [blockchair.com/api/docs](https://blockchair.com/api/docs)

## Best Practices

1. **Validate Input**: Always validate addresses and transaction hashes before querying
2. **Leverage Caching**: The built-in cache reduces API calls and improves performance
3. **Handle Errors Gracefully**: Always wrap API calls in try-catch blocks
4. **Monitor Cache Size**: Use `getCacheStats()` to monitor cache usage
5. **Clear Cache When Needed**: Use `clearCache()` to free memory if needed
6. **Respect Rate Limits**: Be mindful of Blockchair API rate limits
7. **Use Appropriate Limits**: When fetching recent blocks, use only the limit you need

## Limitations

- **Network Dependency**: Requires internet connectivity to fetch data from Blockchair
- **API Rate Limits**: Subject to Blockchair API rate limits (free tier: 30 requests/minute)
- **Memory Usage**: Cache is stored in memory; large caches may consume significant memory
- **Timeout**: Requests timeout after 10 seconds
- **Address Format**: Only supports Litecoin mainnet addresses (not testnet)

## Troubleshooting

### Network Errors

If you encounter network errors:
- Check internet connectivity
- Verify the API endpoint is accessible
- Check for firewall or proxy restrictions
- Ensure you're not exceeding rate limits

### Invalid Address Errors

Valid Litecoin addresses:
- Start with L (P2PKH), M (P2SH), or 3 (SegWit)
- Are 33-34 characters long (26-33 for some legacy formats)
- Use Base58 encoding (no 0, O, I, or l)

### Invalid Transaction Hash Errors

Valid transaction hashes:
- Must be exactly 64 hexadecimal characters
- Only contain characters: 0-9, a-f, A-F

### Timeout Errors

If requests timeout:
- Check network speed
- Try increasing the timeout in the code (currently 10 seconds)
- Verify the API is not experiencing issues

## Comparison with Bitcoin Module

| Feature | Litecoin Blockchair | Bitcoin Mining |
|---------|---------------------|----------------|
| API Source | Blockchair | mempool.space |
| Focus | General blockchain data | Mining statistics |
| Cache Timeout | 60 seconds | 60 seconds |
| Address Support | Full address queries | N/A |
| Block Queries | Yes | Limited |
| Transaction Queries | Yes | No |
| Statistics | Comprehensive | Mining-focused |

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
- Email: mattbrace92@gmail.com
- ENS: kushmanmb.base.eth

---

**Part of the Big World Bigger Ideas project**  
*Empowering crypto clarity, fueled by innovation and style*
