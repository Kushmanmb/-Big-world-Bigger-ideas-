# Beaconchain Validator Rewards Module

A comprehensive module for fetching Ethereum validator rewards data from the beaconcha.in API. This module provides easy-to-use functions for retrieving validator performance metrics, rewards history, and aggregated statistics.

## Features

- ✅ Fetch validator rewards list by epoch
- ✅ Get aggregated rewards over time periods
- ✅ Retrieve validator information and balances
- ✅ Support for multiple validators in a single request
- ✅ Built-in caching to reduce API calls
- ✅ Gwei to ETH conversion utility
- ✅ Data formatting helpers
- ✅ Support for validator indices and public keys

## Installation

This module is part of the Big World Bigger Ideas package:

```bash
npm install big-world-bigger-ideas
```

## Quick Start

```javascript
const BeaconchainRewardsFetcher = require('./src/beaconchain-rewards');

// Create fetcher with API key (recommended)
const fetcher = new BeaconchainRewardsFetcher({
  apiKey: 'YOUR_API_KEY_HERE',
  network: 'mainnet'
});

// Fetch rewards for a validator
const rewards = await fetcher.getRewardsList(12345, {
  epoch: 100000,
  pageSize: 10
});

// Format and display
console.log(fetcher.formatRewardsList(rewards));
```

## API Key

Most endpoints require an API key from beaconcha.in. You can get a free API key with the following limits:
- 1 request per second
- 1000 requests per month

Get your API key at: https://beaconcha.in/pricing

## Constructor

```javascript
const fetcher = new BeaconchainRewardsFetcher(options);
```

### Options

- `apiKey` (string): Your beaconcha.in API key (required for most endpoints)
- `baseUrl` (string): The base API URL (default: `'beaconcha.in'`)
- `network` (string): The Ethereum network (default: `'mainnet'`)

### Example

```javascript
const fetcher = new BeaconchainRewardsFetcher({
  apiKey: 'your-api-key',
  baseUrl: 'beaconcha.in',
  network: 'mainnet'
});
```

## Methods

### getRewardsList(validators, options)

Fetches detailed rewards list for specific validators and epochs.

**Parameters:**
- `validators` (number|string|Array): Validator index(es) or public key(s)
- `options` (Object):
  - `epoch` (number): Specific epoch to query (optional)
  - `pageSize` (number): Number of results per page (1-100, default: 10)

**Returns:** Promise<object> - Validator rewards data

**Example:**

```javascript
// Single validator
const rewards = await fetcher.getRewardsList(12345, {
  epoch: 100000,
  pageSize: 20
});

// Multiple validators
const rewards = await fetcher.getRewardsList([1, 2, 3], {
  pageSize: 10
});

// Using public key
const pubkey = '0xabcd...'; // 96-character hex string
const rewards = await fetcher.getRewardsList(pubkey);
```

### getRewardsAggregate(validators, options)

Fetches aggregated rewards over a time period.

**Parameters:**
- `validators` (number|string|Array): Validator index(es) or public key(s)
- `options` (Object):
  - `period` (string): Time period - `'24h'`, `'7d'`, or `'30d'` (default: `'24h'`)

**Returns:** Promise<object> - Aggregated rewards data

**Example:**

```javascript
// 24-hour aggregated rewards
const rewards24h = await fetcher.getRewardsAggregate(12345, {
  period: '24h'
});

// 7-day aggregated rewards for multiple validators
const rewards7d = await fetcher.getRewardsAggregate([1, 2, 3], {
  period: '7d'
});
```

### getValidatorInfo(validators)

Fetches detailed validator information including balances.

**Parameters:**
- `validators` (number|string|Array): Validator index(es) or public key(s)

**Returns:** Promise<object> - Validator information

**Example:**

```javascript
// Single validator
const info = await fetcher.getValidatorInfo(12345);

// Multiple validators
const info = await fetcher.getValidatorInfo([1, 2, 3]);
```

### getTotalRewards(validators)

Fetches total rewards using V1 API (no authentication required).

**Parameters:**
- `validators` (number|string|Array): Validator index(es)

**Returns:** Promise<object> - Total rewards data

**Example:**

```javascript
const totalRewards = await fetcher.getTotalRewards([1, 2, 3]);
```

### formatRewardsList(data)

Formats rewards list data for human-readable display.

**Parameters:**
- `data` (object): Raw rewards list data from API

**Returns:** string - Formatted output

**Example:**

```javascript
const rewards = await fetcher.getRewardsList(12345);
console.log(fetcher.formatRewardsList(rewards));
```

### formatRewardsAggregate(data)

Formats aggregated rewards data for human-readable display.

**Parameters:**
- `data` (object): Raw aggregated rewards data from API

**Returns:** string - Formatted output

**Example:**

```javascript
const rewards = await fetcher.getRewardsAggregate(12345);
console.log(fetcher.formatRewardsAggregate(rewards));
```

### gweiToEth(gwei)

Converts Gwei to ETH.

**Parameters:**
- `gwei` (number|string): Amount in Gwei

**Returns:** string - Amount in ETH

**Example:**

```javascript
const eth = fetcher.gweiToEth(1000000000); // "1.000000000"
const halfEth = fetcher.gweiToEth(500000000); // "0.500000000"
```

### clearCache()

Clears all cached API responses.

**Example:**

```javascript
fetcher.clearCache();
```

### getCacheStats()

Gets cache statistics.

**Returns:** object - Cache statistics including size, timeout, and keys

**Example:**

```javascript
const stats = fetcher.getCacheStats();
console.log(`Cache size: ${stats.size}`);
console.log(`Cache timeout: ${stats.timeout}ms`);
console.log(`Cache keys: ${stats.keys.join(', ')}`);
```

## Validator Identifiers

The module supports two types of validator identifiers:

### 1. Validator Index (number)

```javascript
const rewards = await fetcher.getRewardsList(12345);
```

### 2. Validator Public Key (hex string)

```javascript
const pubkey = '0xabcdef...'; // 96-character hex string (48 bytes)
const rewards = await fetcher.getRewardsList(pubkey);
```

## Time Periods

The `getRewardsAggregate` method supports the following time periods:

- `'24h'` - Last 24 hours
- `'7d'` - Last 7 days
- `'30d'` - Last 30 days

## Caching

The module includes built-in caching with a 1-minute timeout to reduce redundant API calls:

- Cache is automatically used for repeated requests
- Cache timeout: 60 seconds (configurable via `cacheTimeout` property)
- Manual cache clearing available via `clearCache()`

## Error Handling

The module validates inputs and provides descriptive error messages:

```javascript
try {
  const rewards = await fetcher.getRewardsList(12345);
} catch (error) {
  if (error.message.includes('Invalid validator identifier')) {
    console.error('Invalid validator provided');
  } else if (error.message.includes('HTTP 401')) {
    console.error('Authentication failed - check API key');
  } else {
    console.error('API request failed:', error.message);
  }
}
```

## Response Format

### Rewards List Response

```json
{
  "data": [
    {
      "validator_index": 12345,
      "epoch": 100,
      "attestation_reward": 15000000,
      "sync_committee_reward": 5000000,
      "total_reward": 20000000
    }
  ]
}
```

### Aggregated Rewards Response

```json
{
  "data": [
    {
      "validator_index": 12345,
      "total_attestation_rewards": 450000000,
      "total_sync_rewards": 150000000,
      "total_rewards": 600000000
    }
  ]
}
```

## Unit Conversions

Rewards are typically returned in Gwei:
- 1 ETH = 1,000,000,000 Gwei (1 billion)
- Use `gweiToEth()` for easy conversion

```javascript
const gweiAmount = 20000000; // from API
const ethAmount = fetcher.gweiToEth(gweiAmount); // "0.020000000"
```

## Examples

### Example 1: Monitor Single Validator

```javascript
const fetcher = new BeaconchainRewardsFetcher({
  apiKey: 'your-api-key'
});

// Get 24h aggregated rewards
const rewards = await fetcher.getRewardsAggregate(12345, {
  period: '24h'
});

console.log(fetcher.formatRewardsAggregate(rewards));
```

### Example 2: Track Multiple Validators

```javascript
const validators = [1, 2, 3, 4, 5];

// Get rewards for all validators
const rewards = await fetcher.getRewardsList(validators, {
  pageSize: 50
});

console.log(fetcher.formatRewardsList(rewards));
```

### Example 3: Historical Analysis

```javascript
// Get rewards for specific epoch
const historicalRewards = await fetcher.getRewardsList(12345, {
  epoch: 95000,
  pageSize: 100
});

// Convert to ETH
for (const entry of historicalRewards.data) {
  const ethReward = fetcher.gweiToEth(entry.total_reward);
  console.log(`Epoch ${entry.epoch}: ${ethReward} ETH`);
}
```

## Testing

Run the test suite:

```bash
npm run test:beaconchain-rewards
```

Run the example:

```bash
npm run beaconchain-rewards:demo
```

## Limitations

- API key required for most endpoints
- Rate limits apply based on your subscription tier
- Cache timeout is 60 seconds by default
- Maximum page size is 100

## API Documentation

For more details about the beaconcha.in API:
- Documentation: https://docs.beaconcha.in/
- API Pricing: https://beaconcha.in/pricing

## License

ISC

## Author

Matthew Brace <mattbrace92@gmail.com>

## Contributing

This module is part of the Big World Bigger Ideas project. For contributions and issues, visit:
https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-
