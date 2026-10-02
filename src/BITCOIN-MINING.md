# Bitcoin Mining Block Rewards Module

## Overview

The Bitcoin Mining Block Rewards module provides a comprehensive interface for fetching and analyzing Bitcoin mining data from the mempool.space API. This module enables developers to access real-time and historical Bitcoin mining statistics, including block rewards, mining pool information, network hashrate, and difficulty adjustments.

## Features

- 📊 **Block Rewards**: Fetch historical block reward data for various time periods
- ⛏️ **Mining Pools**: Get statistics about mining pool performance and market share
- 💪 **Hashrate Data**: Access network hashrate information over time
- 🎯 **Difficulty Adjustments**: Track Bitcoin network difficulty changes
- 💾 **Smart Caching**: Automatic caching with configurable timeout (default: 60 seconds)
- 📝 **Data Formatting**: Built-in formatting utilities for display
- ✅ **Error Handling**: Robust error handling with informative messages
- 🌐 **Flexible Configuration**: Support for custom API endpoints

## Installation

No additional dependencies required beyond Node.js standard library. The module uses the built-in `https` module for API requests.

## Quick Start

```javascript
const BitcoinMiningFetcher = require('./src/bitcoin-mining.js');

// Create a fetcher instance
const fetcher = new BitcoinMiningFetcher();

// Fetch 1-day block rewards
const rewards = await fetcher.getBlockRewards('1d');

// Format and display the data
console.log(fetcher.formatBlockRewards(rewards));
```

## API Reference

### Constructor

#### `new BitcoinMiningFetcher(baseUrl)`

Creates a new Bitcoin Mining fetcher instance.

**Parameters:**
- `baseUrl` (string, optional): The base API URL. Default: `'mempool.space'`

**Example:**
```javascript
// Use default endpoint
const fetcher = new BitcoinMiningFetcher();

// Use custom endpoint
const customFetcher = new BitcoinMiningFetcher('custom.mempool.space');
```

### Methods

#### `getBlockRewards(period)`

Fetches mining block rewards for a specified time period.

**Parameters:**
- `period` (string): Time period - one of: `'1d'`, `'3d'`, `'1w'`, `'1m'`, `'3m'`, `'6m'`, `'1y'`, `'2y'`, `'3y'`, `'all'`

**Returns:** `Promise<object>` - Block rewards data

**Example:**
```javascript
const rewards1d = await fetcher.getBlockRewards('1d');
const rewards1w = await fetcher.getBlockRewards('1w');
const rewardsAll = await fetcher.getBlockRewards('all');
```

**Throws:** `Error` if period is invalid or request fails

---

#### `getMiningPools(period)`

Fetches mining pool statistics for a specified time period.

**Parameters:**
- `period` (string): Time period - one of: `'24h'`, `'3d'`, `'1w'`, `'1m'`, `'3m'`, `'6m'`, `'1y'`, `'2y'`, `'3y'`, `'all'`

**Returns:** `Promise<object>` - Mining pool statistics

**Example:**
```javascript
const pools = await fetcher.getMiningPools('1w');
console.log(pools);
```

---

#### `getHashrate(period)`

Fetches mining hashrate data for a specified time period.

**Parameters:**
- `period` (string): Time period - one of: `'1d'`, `'3d'`, `'1w'`, `'1m'`, `'3m'`, `'6m'`, `'1y'`, `'2y'`, `'3y'`, `'all'`

**Returns:** `Promise<object>` - Hashrate data

**Example:**
```javascript
const hashrate = await fetcher.getHashrate('1w');
console.log(hashrate);
```

---

#### `getDifficultyAdjustment()`

Fetches network difficulty adjustment data.

**Returns:** `Promise<object>` - Difficulty adjustment data

**Example:**
```javascript
const difficulty = await fetcher.getDifficultyAdjustment();
console.log(difficulty);
```

---

#### `formatBlockRewards(data)`

Formats block rewards data for display.

**Parameters:**
- `data` (object|array): Raw block rewards data from the API

**Returns:** `string` - Formatted output string

**Example:**
```javascript
const rewards = await fetcher.getBlockRewards('1d');
const formatted = fetcher.formatBlockRewards(rewards);
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

## Time Periods

The module supports the following time periods:

| Period | Description |
|--------|-------------|
| `1d` | Last 24 hours |
| `3d` | Last 3 days |
| `1w` | Last week |
| `1m` | Last month |
| `3m` | Last 3 months |
| `6m` | Last 6 months |
| `1y` | Last year |
| `2y` | Last 2 years |
| `3y` | Last 3 years |
| `all` | All time |

## Data Structure Examples

### Block Rewards Response

```json
[
  {
    "avgRewards": 6.25,
    "timestamp": 1609459200,
    "totalRewards": 625,
    "blockCount": 100
  },
  {
    "avgRewards": 6.24,
    "timestamp": 1609545600,
    "totalRewards": 624,
    "blockCount": 100
  }
]
```

### Formatted Output

```
Bitcoin Mining Block Rewards
================================

Total entries: 2

Entry 1:
  Average Rewards: 6.25 BTC
  Timestamp: 2021-01-01T00:00:00.000Z
  Total Rewards: 625 BTC
  Block Count: 100

Entry 2:
  Average Rewards: 6.24 BTC
  Timestamp: 2021-01-02T00:00:00.000Z
  Total Rewards: 624 BTC
  Block Count: 100
```

## Caching

The module implements automatic caching to reduce API calls:

- **Default Timeout**: 60 seconds (60,000ms)
- **Cache Key Format**: `{endpoint}-{period}` (e.g., `block-rewards-1d`)
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
const data1 = await fetcher.getBlockRewards('1d'); // API call
const data2 = await fetcher.getBlockRewards('1d'); // From cache (if within timeout)
```

## Error Handling

The module provides detailed error messages for common issues:

```javascript
try {
  const rewards = await fetcher.getBlockRewards('1d');
} catch (error) {
  if (error.message.includes('Invalid period')) {
    console.error('Invalid time period specified');
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
# Run Bitcoin mining tests only
npm run test:bitcoin-mining

# Run all tests (includes Bitcoin mining)
npm test
```

## Demo

Run the interactive demo:

```bash
npm run bitcoin-mining:demo
```

The demo demonstrates:
- Creating a fetcher instance
- Fetching block rewards
- Fetching mining pool data
- Fetching hashrate data
- Fetching difficulty adjustments
- Formatting data for display
- Cache management
- Supported time periods

## Use Cases

### 1. Monitor Mining Rewards

```javascript
const fetcher = new BitcoinMiningFetcher();

// Get daily rewards
const dailyRewards = await fetcher.getBlockRewards('1d');
console.log(fetcher.formatBlockRewards(dailyRewards));
```

### 2. Track Mining Pool Performance

```javascript
const fetcher = new BitcoinMiningFetcher();

// Get weekly pool statistics
const pools = await fetcher.getMiningPools('1w');
console.log('Mining Pool Statistics:', pools);
```

### 3. Analyze Network Hashrate

```javascript
const fetcher = new BitcoinMiningFetcher();

// Get monthly hashrate trends
const hashrate = await fetcher.getHashrate('1m');
console.log('Hashrate Data:', hashrate);
```

### 4. Monitor Difficulty Changes

```javascript
const fetcher = new BitcoinMiningFetcher();

// Get difficulty adjustment data
const difficulty = await fetcher.getDifficultyAdjustment();
console.log('Difficulty Adjustment:', difficulty);
```

## API Endpoints

The module uses the following mempool.space API endpoints:

- **Block Rewards**: `/api/v1/mining/blocks/rewards/{period}`
- **Mining Pools**: `/api/v1/mining/pools/{period}`
- **Hashrate**: `/api/v1/mining/hashrate/{period}`
- **Difficulty**: `/api/v1/mining/difficulty-adjustments/1m`

For complete API documentation, visit: [mempool.space/docs/api](https://mempool.space/docs/api/rest)

## Best Practices

1. **Use Appropriate Time Periods**: Choose the time period that matches your use case to avoid unnecessary data transfer
2. **Leverage Caching**: The built-in cache reduces API calls and improves performance
3. **Handle Errors Gracefully**: Always wrap API calls in try-catch blocks
4. **Monitor Cache Size**: Use `getCacheStats()` to monitor cache usage
5. **Clear Cache When Needed**: Use `clearCache()` to free memory if needed

## Limitations

- **Network Dependency**: Requires internet connectivity to fetch data from mempool.space
- **API Rate Limits**: Subject to mempool.space API rate limits
- **Memory Usage**: Cache is stored in memory; large caches may consume significant memory
- **Timeout**: Requests timeout after 10 seconds

## Troubleshooting

### Network Errors

If you encounter network errors:
- Check internet connectivity
- Verify the API endpoint is accessible
- Check for firewall or proxy restrictions

### Invalid Period Errors

Valid periods are: `'1d'`, `'3d'`, `'1w'`, `'1m'`, `'3m'`, `'6m'`, `'1y'`, `'2y'`, `'3y'`, `'all'`

### Timeout Errors

If requests timeout:
- Check network speed
- Try increasing the timeout in the code (currently 10 seconds)
- Verify the API is not experiencing issues

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
