# BTCK — BtcTurk API Module

Fetches all public market data from the [BtcTurk](https://www.btcturk.com/) cryptocurrency exchange API.

API Documentation: https://docs.btcturk.com/

---

## Overview

`BTCKFetcher` provides convenient access to every public endpoint on the BtcTurk REST API:

| Method | BtcTurk endpoint |
|---|---|
| `getExchangeInfo()` | `GET /api/v2/server/exchangeinfo` |
| `getTickers(pairSymbol?)` | `GET /api/v2/ticker` |
| `getOrderBook(pairSymbol, limit?)` | `GET /api/v2/orderbook` |
| `getTrades(pairSymbol, last?)` | `GET /api/v1/trades` |
| `getOHLC(pair)` | `GET /api/v2/ohlc` |
| `getKlines(symbol, resolution, from, to)` | `GET /api/v2/klines/history` |
| `fetchAll()` | All of the above (concurrently) |

Responses are cached for **60 seconds** by default to avoid unnecessary API calls.

---

## Installation

```bash
npm install
```

---

## Usage

```javascript
const BTCKFetcher = require('./src/btck');

const fetcher = new BTCKFetcher();

// Fetch all exchange info + tickers in one call
const all = await fetcher.fetchAll();
console.log(all.exchangeInfo);
console.log(fetcher.formatTickers(all.tickers));
```

---

## API Reference

### Constructor

```javascript
const fetcher = new BTCKFetcher(baseUrl?);
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | `string` | `'api.btcturk.com'` | BtcTurk API hostname |

---

### `getExchangeInfo()`

Returns the list of all supported currencies and trading pairs.

**Returns:** `Promise<object>`

```javascript
const info = await fetcher.getExchangeInfo();
```

---

### `getTickers(pairSymbol?)`

Returns ticker snapshots (last trade price, best bid/ask, 24 h volume).

| Parameter | Type | Default | Description |
|---|---|---|---|
| `pairSymbol` | `string\|null` | `null` | Trading pair (e.g. `'BTCTRY'`). Omit to get all pairs. |

**Returns:** `Promise<object>`

```javascript
const all    = await fetcher.getTickers();          // all pairs
const btcTry = await fetcher.getTickers('BTCTRY'); // single pair
```

---

### `getOrderBook(pairSymbol, limit?)`

Returns the current order book for a trading pair.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `pairSymbol` | `string` | **required** | Trading pair (e.g. `'BTCTRY'`) |
| `limit` | `number` | `25` | Number of bids/asks to return |

**Returns:** `Promise<object>`

```javascript
const book = await fetcher.getOrderBook('BTCTRY', 10);
```

---

### `getTrades(pairSymbol, last?)`

Returns the most recent trades for a trading pair.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `pairSymbol` | `string` | **required** | Trading pair (e.g. `'BTCTRY'`) |
| `last` | `number` | `50` | Number of trades to return |

**Returns:** `Promise<object>`

```javascript
const trades = await fetcher.getTrades('BTCTRY', 20);
```

---

### `getOHLC(pair)`

Returns OHLC (Open, High, Low, Close) daily candlestick data.

| Parameter | Type | Description |
|---|---|---|
| `pair` | `string` | Trading pair (e.g. `'BTCTRY'`) |

**Returns:** `Promise<object>`

```javascript
const ohlc = await fetcher.getOHLC('BTCTRY');
```

---

### `getKlines(symbol, resolution, from, to)`

Returns historical kline/candlestick data.

| Parameter | Type | Description |
|---|---|---|
| `symbol` | `string` | Trading pair (e.g. `'BTCTRY'`) |
| `resolution` | `number` | Candle size in minutes (e.g. `1`, `5`, `15`, `30`, `60`, `240`, `1440`) |
| `from` | `number` | Start time as Unix timestamp (seconds) |
| `to` | `number` | End time as Unix timestamp (seconds) |

**Returns:** `Promise<object>`

```javascript
const now       = Math.floor(Date.now() / 1000);
const yesterday = now - 86400;
const klines    = await fetcher.getKlines('BTCTRY', 60, yesterday, now);
```

---

### `fetchAll()`

Fetches exchange info and all tickers concurrently and returns them in a single object.

**Returns:** `Promise<{ exchangeInfo: object, tickers: object }>`

```javascript
const { exchangeInfo, tickers } = await fetcher.fetchAll();
```

---

### `formatTickers(data)`

Formats raw ticker data for human-readable console output.

| Parameter | Type | Description |
|---|---|---|
| `data` | `object\|Array` | Raw ticker response from the API |

**Returns:** `string`

```javascript
const tickers  = await fetcher.getTickers();
const display  = fetcher.formatTickers(tickers);
console.log(display);
```

---

### `clearCache()`

Clears all cached responses.

```javascript
fetcher.clearCache();
```

---

### `getCacheStats()`

Returns current cache statistics.

**Returns:** `{ size: number, timeout: number, keys: string[] }`

```javascript
const stats = fetcher.getCacheStats();
console.log(`Cache has ${stats.size} entries (timeout: ${stats.timeout / 1000}s)`);
```

---

## Running the Example

```bash
npm run btck:demo
```

## Running Tests

```bash
npm run test:btck
```
