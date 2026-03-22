# Git Fetch Rewards Module

Fetches blockchain block rewards using **git-style commands and log formatting**.

Inspired by `git fetch`: pulls reward data from remote blockchain sources and stores it locally as "commits" — a history of reward events that can be viewed with familiar `log` / `shortLog` commands.

## Supported Sources

| Source     | API                      | Requires key? |
|------------|--------------------------|---------------|
| `bitcoin`  | mempool.space REST API   | No            |
| `ethereum` | Placeholder (extendable) | No            |

## Installation

```js
const { GitFetchRewards, RewardCommit } = require('./src/git-fetch-rewards');
```

## Quick Start

```js
const { GitFetchRewards } = require('./src/git-fetch-rewards');

const gfr = new GitFetchRewards();

// Fetch last week of Bitcoin block rewards (like `git fetch origin`)
await gfr.fetch('bitcoin', '1w');

// Display git-style log
console.log(gfr.log());

// Display compact one-line log (like `git log --oneline`)
console.log(gfr.shortLog());
```

## API Reference

### `new GitFetchRewards(options?)`

Creates a new instance.

| Option            | Type     | Default         | Description                            |
|-------------------|----------|-----------------|----------------------------------------|
| `bitcoinBaseUrl`  | `string` | `'mempool.space'` | Bitcoin API hostname                 |
| `cacheTimeout`    | `number` | `60000`         | Cache TTL in milliseconds             |

---

### `fetch(source?, period?)`

Fetches block rewards from the specified source and appends them to the local history. Returns the newly added `RewardCommit[]`.

**Parameters:**

| Parameter | Type     | Default      | Description                                                              |
|-----------|----------|--------------|--------------------------------------------------------------------------|
| `source`  | `string` | `'bitcoin'`  | `'bitcoin'` or `'ethereum'`                                              |
| `period`  | `string` | `'1w'`       | Time period — see valid periods below (Bitcoin only)                     |

**Valid periods (Bitcoin):** `'1d'`, `'3d'`, `'1w'`, `'1m'`, `'3m'`, `'6m'`, `'1y'`, `'2y'`, `'3y'`, `'all'`

**Example:**

```js
const commits = await gfr.fetch('bitcoin', '1m');
console.log(`Fetched ${commits.length} reward commits`);
```

**Throws:** `Error` if `source` or `period` is invalid, or the API request fails.

---

### `log(limit?)`

Returns the full git-style log of all fetched reward commits (most-recent first). Analogous to `git log`.

```js
console.log(gfr.log());      // all commits
console.log(gfr.log(5));     // latest 5 commits
```

**Returns:** `string`

---

### `shortLog(limit?)`

Returns a compact one-line-per-commit log. Analogous to `git log --oneline`.

```js
console.log(gfr.shortLog());    // all commits, one line each
console.log(gfr.shortLog(10));  // latest 10 commits
```

**Returns:** `string`

---

### `getStats()`

Returns statistics about the locally stored reward commits.

```js
const stats = gfr.getStats();
// {
//   totalCommits: 7,
//   bySource: {
//     bitcoin: { count: 7, totalAmount: 43.75, unit: 'BTC' }
//   },
//   cacheSize: 1
// }
```

---

### `clearHistory()`

Clears both the local commit history and the API response cache.

---

### `clearCache()`

Clears only the API response cache (local commit history is preserved).

---

### `getCacheStats()`

Returns information about the current cache state.

```js
const cacheStats = gfr.getCacheStats();
// { size: 1, timeout: 60000, keys: ['btc-rewards-1w'] }
```

---

### `validatePeriod(period)` / `validateSource(source)`

Utility methods used internally that throw descriptive `Error`s on invalid input. Can be called directly for pre-validation.

---

## `RewardCommit` class

Each fetched reward is stored as a `RewardCommit` object — analogous to a git commit.

| Property      | Type     | Description                              |
|---------------|----------|------------------------------------------|
| `hash`        | `string` | 8-character deterministic hex hash       |
| `source`      | `string` | `'bitcoin'` or `'ethereum'`              |
| `timestamp`   | `number` | Unix timestamp of the reward event       |
| `blockHeight` | `number` | Block height                             |
| `amount`      | `string` | Reward amount (formatted string)         |
| `unit`        | `string` | Currency unit (`'BTC'`, `'ETH'`, …)      |
| `extra`       | `object` | Additional metadata (e.g. `blockCount`)  |

### `toGitLog()` → `string`

Returns a multi-line git-style commit entry:

```
commit a1b2c3d4
Source: bitcoin
Date:   2021-01-01T00:00:00.000Z

    Block reward at height #665000
    Amount: 6.25000000 BTC
```

### `toShortLog()` → `string`

Returns a compact one-liner:

```
a1b2c3d4 [2021-01-01] Block #665000 — 6.25000000 BTC (bitcoin)
```

---

## Error Handling

```js
try {
  await gfr.fetch('bitcoin', '5d');
} catch (error) {
  if (error.message.includes('Invalid period')) {
    console.error('Invalid time period');
  } else if (error.message.includes('Unsupported source')) {
    console.error('Unsupported blockchain source');
  } else if (error.message.includes('Request failed')) {
    console.error('Network error:', error.message);
  }
}
```

---

## Testing

```bash
# Run Git Fetch Rewards tests only
npm run test:git-fetch-rewards

# Run all tests
npm test
```

---

## Demo

```bash
npm run git-fetch-rewards:demo
```
