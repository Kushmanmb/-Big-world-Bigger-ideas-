# Transaction Validator Module

Multi-API blockchain transaction validation using **Etherscan**, **Mempool.space**, and **Blockchair**.

## Overview

The `TransactionValidator` class validates any blockchain transaction by querying one or more public APIs and cross-referencing the results. It supports:

| Chain | API(s) |
|-------|--------|
| Bitcoin | Mempool.space + Blockchair |
| Ethereum | Etherscan + Blockchair |
| Litecoin, Dogecoin, … | Blockchair |

---

## Installation

```bash
npm install big-world-bigger-ideas
```

---

## Quick Start

```javascript
const TransactionValidator = require('big-world-bigger-ideas/src/transaction-validator');

const validator = new TransactionValidator({
  etherscanApiKey: 'YOUR_ETHERSCAN_API_KEY', // optional – needed for Etherscan
});

// Validate a Bitcoin transaction (Mempool.space + Blockchair)
const result = await validator.validateTransaction(
  'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d',
  'bitcoin'
);
console.log(validator.formatAggregatedResult(result));
```

---

## API Reference

### Constructor

```javascript
new TransactionValidator(options?)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `etherscanApiKey` | `string \| null` | `null` | Etherscan API key. Required for `validateEthereumTransaction`. |
| `mempoolBaseUrl` | `string` | `'mempool.space'` | Mempool.space hostname. |
| `blockchairBaseUrl` | `string` | `'api.blockchair.com'` | Blockchair hostname. |
| `cacheTimeout` | `number` | `60000` | Cache TTL in milliseconds. |

---

### `validateBitcoinTransaction(txHash)`

Validates a Bitcoin transaction using the **Mempool.space** API.

```javascript
const result = await validator.validateBitcoinTransaction('abc...def');
```

**Returns:**

```json
{
  "txHash": "abc...def",
  "chain": "bitcoin",
  "api": "mempool",
  "isValid": true,
  "status": "found",
  "confirmed": true,
  "blockHeight": 800000,
  "fee": 3000,
  "size": 225,
  "timestamp": 1699999999000
}
```

---

### `validateEthereumTransaction(txHash, chainId?)`

Validates an Ethereum (or EVM-compatible) transaction using the **Etherscan** API.

```javascript
const result = await validator.validateEthereumTransaction('0x5c50...', 1);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `txHash` | `string` | — | Ethereum transaction hash (`0x` + 64 hex chars). |
| `chainId` | `number` | `1` | Chain ID (1 = mainnet, 8453 = Base, 137 = Polygon). |

> **Note:** `etherscanApiKey` must be set in the constructor.

---

### `validateBlockchairTransaction(txHash, chain?)`

Validates a transaction using the **Blockchair** multi-chain API.

```javascript
const result = await validator.validateBlockchairTransaction('abc...def', 'litecoin');
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `txHash` | `string` | — | 64-character hex transaction hash. |
| `chain` | `string` | `'bitcoin'` | Chain name (bitcoin, ethereum, litecoin, dogecoin, …). |

---

### `validateTransaction(txHash, chain?)`

Cross-API aggregated validation. Queries **all** relevant APIs for the chain and returns a combined result.

```javascript
const result = await validator.validateTransaction('abc...def', 'bitcoin');
console.log(validator.formatAggregatedResult(result));
```

**Returns:**

```json
{
  "txHash": "abc...def",
  "chain": "bitcoin",
  "isValid": true,
  "confirmedBy": 2,
  "totalSources": 2,
  "sources": {
    "mempool":    { "isValid": true, "confirmed": true },
    "blockchair": { "isValid": true, "confirmed": true }
  },
  "timestamp": 1699999999000
}
```

---

### `formatResult(result)` / `formatAggregatedResult(result)`

Human-readable string formatters for single-source and aggregated results.

---

### `clearCache()` / `getCacheStats()`

Standard cache utilities (shared TTL of `cacheTimeout` ms).

---

### `TransactionValidator.getSupportedChains()`

Static method returning the full chain configuration map.

```javascript
const chains = TransactionValidator.getSupportedChains();
// { bitcoin: { api: 'mempool', … }, ethereum: { api: 'etherscan', … }, … }
```

---

## GitHub Actions Integration

Transaction validation can be triggered directly from GitHub Issues or PRs:

```
/validate-tx <txHash> <chain>
```

**Examples:**

```
/validate-tx a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d bitcoin
/validate-tx 0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060 ethereum
```

The workflow (`transaction-validation.yml`) runs on a **self-hosted runner**, fetches
results from Etherscan, Mempool.space, and Blockchair, and posts a summary comment
back on the issue or PR.

Required secrets:
- `ETHERSCAN_API_KEY` – for Ethereum transaction validation (optional; skipped if absent)

---

## Supported Chains

| Chain Key | API Backend |
|-----------|-------------|
| `ethereum` | Etherscan (chainId 1) |
| `base` | Etherscan (chainId 8453) |
| `polygon` | Etherscan (chainId 137) |
| `bitcoin` | Mempool.space |
| `bitcoin-blockchair` | Blockchair |
| `ethereum-blockchair` | Blockchair |
| `litecoin-blockchair` | Blockchair |
| `dogecoin-blockchair` | Blockchair |

---

## Error Handling

All validation methods throw descriptive errors for:

- Invalid or missing transaction hash format
- Missing API key (Etherscan only)
- Network / API errors (wrapped with context)
- Unsupported chain names (warning logged; Blockchair still attempted)

---

## See Also

- [`BITCOIN-MINING.md`](./BITCOIN-MINING.md) – Mempool.space mining data
- [`BLOCKCHAIR.md`](./BLOCKCHAIR.md) – Blockchair multi-chain fetcher
- [`ETHERSCAN-TOKEN-BALANCE.md`](./ETHERSCAN-TOKEN-BALANCE.md) – Etherscan token balances
