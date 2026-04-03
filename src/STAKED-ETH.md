# Staked ETH Balance Module

Fetch staked ETH balances for an Ethereum address. Supports liquid staking tokens (stETH, rETH, cbETH, wstETH) and native ETH staking via Beacon Chain validators.

## Installation

```bash
npm install
```

## Usage

```javascript
const StakedEthFetcher = require('./src/staked-eth');

const fetcher = new StakedEthFetcher();
const address = '0xYourAddressHere';
```

## API

### `new StakedEthFetcher(rpcUrl?, beaconApiUrl?)`

Creates a new fetcher instance.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `rpcUrl` | `https://ethereum.publicnode.com` | Ethereum JSON-RPC endpoint |
| `beaconApiUrl` | `beaconcha.in` | Beacon Chain API hostname |

### `getStakedBalance(address)`

Fetches all liquid staking token balances for an address in a single call. Errors for individual tokens are caught and reported without failing the overall request.

```javascript
const result = await fetcher.getStakedBalance('0x...');
console.log(result.totalLiquidBalanceEth);
```

**Returns:**
```json
{
  "address": "0x...",
  "liquidStaking": {
    "stETH": { "token": "stETH", "tokenName": "Lido Staked ETH", "tokenContract": "0xae7...", "balanceWei": "1000000000000000000", "balanceEth": "1.000000000000000000" },
    "rETH":  { ... },
    "cbETH": { ... },
    "wstETH": { ... }
  },
  "totalLiquidBalanceWei": "1000000000000000000",
  "totalLiquidBalanceEth": "1.000000000000000000"
}
```

### `getLiquidTokenBalance(address, tokenSymbol)`

Fetches the balance of a specific liquid staking token.

| `tokenSymbol` | Token | Protocol |
|---------------|-------|----------|
| `stETH`  | Lido Staked ETH | Lido |
| `rETH`   | Rocket Pool ETH | Rocket Pool |
| `cbETH`  | Coinbase Wrapped Staked ETH | Coinbase |
| `wstETH` | Wrapped Liquid Staked Ether 2.0 | Lido |

```javascript
const result = await fetcher.getLiquidTokenBalance('0x...', 'stETH');
console.log(result.balanceEth); // e.g. "2.500000000000000000"
```

### `getStETHBalance(address)`

Shortcut for `getLiquidTokenBalance(address, 'stETH')`.

### `getRETHBalance(address)`

Shortcut for `getLiquidTokenBalance(address, 'rETH')`.

### `getCBETHBalance(address)`

Shortcut for `getLiquidTokenBalance(address, 'cbETH')`.

### `getWSTETHBalance(address)`

Shortcut for `getLiquidTokenBalance(address, 'wstETH')`.

### `getNativeStakedBalance(address)`

Fetches native ETH staking balances by looking up all Beacon Chain validators whose withdrawal address matches the given Ethereum address. Uses the [beaconcha.in public API](https://beaconcha.in/api/v1/docs/).

```javascript
const result = await fetcher.getNativeStakedBalance('0x...');
console.log(`Validators: ${result.validatorCount}`);
console.log(`Total: ${result.totalBalanceEth} ETH`);
```

**Returns:**
```json
{
  "address": "0x...",
  "validatorCount": 2,
  "validators": [
    { "index": 1, "status": "active_online", "balanceGwei": 32100000000, "balanceEth": "32.100000000" }
  ],
  "totalBalanceGwei": "64000000000",
  "totalBalanceEth": "64.000000000"
}
```

### `formatBalance(balanceInfo)`

Formats any balance result from this module into a human-readable string.

```javascript
const result = await fetcher.getStakedBalance(address);
console.log(fetcher.formatBalance(result));
```

### `clearCache()`

Clears the internal response cache.

### `getCacheStats()`

Returns cache statistics.

```javascript
const stats = fetcher.getCacheStats();
// { size: 3, timeout: 60000, keys: ['liquid-stETH-0x...', ...] }
```

### `StakedEthFetcher.CONTRACTS`

Static property listing all supported liquid staking token contracts.

```javascript
console.log(StakedEthFetcher.CONTRACTS.stETH.address);
// 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84
```

## Supported Tokens

| Symbol | Name | Contract (Mainnet) |
|--------|------|--------------------|
| stETH  | Lido Staked ETH | `0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84` |
| rETH   | Rocket Pool ETH | `0xae78736Cd615f374D3085123A210448E74Fc6393` |
| cbETH  | Coinbase Wrapped Staked ETH | `0xBe9895146f7AF43049ca1c1AE358B0541Ea49704` |
| wstETH | Wrapped Liquid Staked Ether 2.0 | `0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0` |

## Notes

- Balances are cached for **60 seconds** by default.
- Liquid staking token balances are read via direct `eth_call` (no API key required).
- Native staking data uses the public [beaconcha.in REST API](https://beaconcha.in/api/v1/docs/) (no API key required for basic usage).
- All balance values are returned as **strings** to preserve precision with large numbers.
- Wei values use 18 decimal places; Gwei values use 9 decimal places.
