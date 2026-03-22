# Etherscan Stats Module

Fetch blockchain statistics from the [Etherscan API v2](https://docs.etherscan.io/etherscan-v2), including daily block rewards per date range.

## Features

- Fetch daily ETH block rewards by date range
- Configurable sort order (`asc` / `desc`)
- Built-in response caching (60-second TTL)
- Input validation for dates and sort parameters
- Compatible with Ethereum mainnet and other EVM chains supported by Etherscan

## Quick Start

```javascript
const EtherscanStats = require('./src/etherscan-stats');

const stats = new EtherscanStats('YourApiKeyToken', 1);

const data = await stats.getDailyBlockRewards('2019-02-01', '2019-02-28', 'desc');
console.log(stats.formatDailyBlockRewards(data));
```

This mirrors the following curl request from the Etherscan API:

```bash
curl "https://api.etherscan.io/v2/api?chainid=1&module=stats&action=dailyblockrewards&startdate=2019-02-01&enddate=2019-02-28&sort=desc&apikey=YourApiKeyToken"
```

## 📖 API Reference

### Constructor

#### `new EtherscanStats(apiKey, chainId?)`

Creates a new Etherscan Stats instance.

**Parameters:**
- `apiKey` (string, required): Your Etherscan API key
- `chainId` (number, optional): Chain ID (default: 1)

**Throws:** `Error` if `apiKey` is not provided.

---

### `getDailyBlockRewards(startdate, enddate, sort?)`

Fetches daily block rewards for a given date range.

**Parameters:**
- `startdate` (string, required): Start date in `YYYY-MM-DD` format
- `enddate` (string, required): End date in `YYYY-MM-DD` format
- `sort` (string, optional): Sort order — `'asc'` or `'desc'` (default: `'asc'`)

**Returns:** `Promise<object>`

```json
{
  "chainId": 1,
  "startdate": "2019-02-01",
  "enddate": "2019-02-28",
  "sort": "desc",
  "rewards": [
    {
      "UTCDate": "2019-02-28",
      "unixTimeStamp": "1551312000",
      "blockRewards_Eth": "13500.123456789",
      "blockCount": "5760",
      "uncleInclusionRewards_Eth": "50.123456789"
    }
  ],
  "status": "1",
  "message": "OK",
  "timestamp": 1234567890
}
```

**Throws:** `Error` if dates are invalid, `startdate > enddate`, or the API call fails.

---

### `formatDailyBlockRewards(data)`

Formats daily block rewards data as a human-readable string.

**Parameters:**
- `data` (object): Result from `getDailyBlockRewards()`

**Returns:** `string`

---

### `validateDate(date)`

Validates a date string.

**Parameters:**
- `date` (string): Date in `YYYY-MM-DD` format

**Returns:** `string` — the validated date

**Throws:** `Error` if the format is invalid.

---

### `validateSort(sort)`

Validates a sort parameter.

**Parameters:**
- `sort` (string): `'asc'` or `'desc'`

**Returns:** `string` — the validated sort value

**Throws:** `Error` if the value is not `'asc'` or `'desc'`.

---

### `clearCache()`

Clears the internal response cache.

---

### `getCacheStats()`

Returns cache statistics.

```json
{
  "size": 1,
  "timeout": 60000,
  "keys": ["daily-block-rewards_1_2019-02-01_2019-02-28_desc"]
}
```

---

### `getAPIInfo()`

Returns API configuration details.

```json
{
  "baseUrl": "api.etherscan.io",
  "chainId": 1,
  "hasApiKey": true,
  "cacheTimeout": 60000
}
```

## Error Handling

| Scenario | Error Message |
|---|---|
| Missing API key | `API key is required for Etherscan stats.` |
| Invalid date format | `Date must be in YYYY-MM-DD format` |
| `startdate` after `enddate` | `startdate must be before or equal to enddate` |
| Invalid sort value | `Invalid sort value. Must be one of: asc, desc` |
| API error | `Error fetching daily block rewards: <message>` |

## Getting an API Key

1. Visit [https://etherscan.io/](https://etherscan.io/)
2. Create a free account
3. Go to **My Account → API Keys**
4. Generate a new API key
