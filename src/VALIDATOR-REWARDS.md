# Validator Rewards Module

## Overview

The `ValidatorRewards` class parses, validates, and formats Ethereum **beacon chain validator reward data** as returned by consensus-layer analytics APIs.

It handles the complete reward breakdown for each validator, including:

| Component | Description |
|-----------|-------------|
| **Attestation** | Head / source / target vote rewards |
| **Sync committee** | Sync-committee participation rewards |
| **Proposal** | Execution-layer fees, attestation inclusion, sync inclusion |
| **Finality** | Whether the epoch has been finalized on-chain |

---

## Installation

```bash
npm install big-world-bigger-ideas
```

---

## Quick Start

```javascript
const ValidatorRewards = require('./src/validator-rewards');

// Raw response from a beacon-chain rewards API
const response = { data: [...], paging: {}, range: { ... } };

// 1. Validate
const { valid, errors } = ValidatorRewards.validateResponse(response);

// 2. Parse (converts wei strings → ETH, camelCases keys)
const parsed = ValidatorRewards.parseResponse(response);

// 3. Format for display
console.log(ValidatorRewards.formatResponse(parsed));

// 4. Get summary statistics
const summary = ValidatorRewards.getSummary(response);
console.log(ValidatorRewards.formatSummary(summary));
```

---

## API Reference

### Static Methods

---

#### `validateResponse(response)`

Validates a raw API response object.

```javascript
const { valid, errors } = ValidatorRewards.validateResponse(response);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `response` | `object` | Raw API response with `data` array |

**Returns** `{ valid: boolean, errors: string[] }`

---

#### `validateEntry(entry)`

Validates a single validator reward entry from the `data` array.

```javascript
const { valid, errors } = ValidatorRewards.validateEntry(entry);
```

---

#### `validatePublicKey(key)`

Validates a BLS public key (48 bytes / 96 hex characters, optional `0x` prefix).

```javascript
ValidatorRewards.validatePublicKey('0xa1d1ad...'); // → true
ValidatorRewards.validatePublicKey('0xdeadbeef');   // → false
```

---

#### `parseResponse(response)`

Parses a full API response. Converts all wei amounts to ETH strings and
normalises field names to camelCase.

```javascript
const parsed = ValidatorRewards.parseResponse(response);
// parsed.data[0].totals.rewardEth  → '0.08066068'
// parsed.range.epoch.start         → 347566
```

**Throws** `Error` if validation fails.

---

#### `parseEntry(entry)`

Parses a single raw entry.

```javascript
const entry = ValidatorRewards.parseEntry(rawEntry);
```

**Returns** structured object with:

```
{
  validator: { index, publicKey },
  finality,
  totals: { rewardWei, rewardEth, penaltyWei, penaltyEth, missedWei, missedEth },
  attestation: {
    totalWei, totalEth,
    head:   { rewardWei, rewardEth, penaltyWei, penaltyEth, missedRewardWei },
    source: { ... },
    target: { ... },
    inactivityLeakPenaltyWei, inclusionDelay
  },
  syncCommittee: { totalWei, totalEth, rewardWei, rewardEth, penaltyWei, penaltyEth, ... },
  proposal: {
    totalWei, totalEth,
    executionLayerRewardWei, executionLayerRewardEth,
    attestationInclusionRewardWei, attestationInclusionRewardEth,
    syncInclusionRewardWei, syncInclusionRewardEth,
    slashingInclusionRewardWei, slashingInclusionRewardEth,
    missedClRewardWei, missedClRewardEth,
    missedElRewardWei, missedElRewardEth
  }
}
```

---

#### `weiToEth(wei)`

Converts a wei amount (string, number, or BigInt) to a human-readable ETH
string with up to 9 significant decimal places.

```javascript
ValidatorRewards.weiToEth('1000000000000000000'); // → '1'
ValidatorRewards.weiToEth('35087332222696592');    // → '0.035087332'
ValidatorRewards.weiToEth(null);                   // → '0'
```

---

#### `isFinalized(entry)`

Returns `true` when `entry.finality === 'finalized'`.

```javascript
ValidatorRewards.isFinalized(entry); // → true | false
```

---

#### `getTopRewards(entries, n?)`

Returns the top `n` entries sorted by `total_reward` (descending). Works with
raw (unparsed) entries.

```javascript
const top5 = ValidatorRewards.getTopRewards(response.data, 5);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `entries` | `object[]` | — | Array of raw reward entries |
| `n` | `number` | `10` | Number of entries to return |

---

#### `getSummary(response)`

Calculates aggregate statistics across all entries.

```javascript
const summary = ValidatorRewards.getSummary(response);
// {
//   validatorCount, finalizedCount,
//   totalRewardWei, totalRewardEth,
//   totalPenaltyWei, totalPenaltyEth,
//   totalMissedWei,  totalMissedEth,
//   range
// }
```

---

#### `formatEntry(parsedEntry)`

Returns a human-readable string for a single **parsed** entry.

---

#### `formatResponse(parsedResponse)`

Returns a full human-readable report for a **parsed** response.

---

#### `formatSummary(summary)`

Returns a human-readable summary string.

---

## Data Shape

The module expects the following raw API response structure:

```json
{
  "data": [
    {
      "total": "80660680222696592",
      "validator": {
        "index": 1,
        "public_key": "0xa1d1ad..."
      },
      "total_reward": "80660680222696592",
      "total_penalty": "0",
      "total_missed": "132644000000000",
      "attestation": {
        "total": "9371000000000",
        "head":   { "total": "...", "reward": "...", "penalty": "...", "missed_reward": "..." },
        "source": { "total": "...", "reward": "...", "penalty": "...", "missed_reward": "..." },
        "target": { "total": "...", "reward": "...", "penalty": "...", "missed_reward": "..." },
        "inactivity_leak_penalty": "0",
        "inclusion_delay": null
      },
      "sync_committee": {
        "total": "0", "reward": "0", "penalty": "0", "missed_reward": "0"
      },
      "proposal": {
        "total": "80651309222696592",
        "execution_layer_reward": "35087332222696592",
        "attestation_inclusion_reward": "43946801000000000",
        "sync_inclusion_reward": "1617176000000000",
        "slashing_inclusion_reward": "0",
        "missed_cl_reward": "132644000000000",
        "missed_el_reward": "0"
      },
      "finality": "finalized"
    }
  ],
  "paging": {},
  "range": {
    "slot":      { "start": 11122112, "end": 11122143 },
    "epoch":     { "start": 347566,   "end": 347566   },
    "timestamp": { "start": 1740289367, "end": 1740289750 }
  }
}
```

---

## Example Output

```
Validator Rewards Report
==================================================

Epoch  : 347566
Slot   : 11122112 – 11122143
Time   : 2025-02-23T05:42:47.000Z – 2025-02-23T05:49:10.000Z

Validators: 1

──────────────────────────────────────────────────
Validator #1
  Public Key : 0xa1d1ad0714035353…
  Finality   : finalized

Total Rewards
  Reward  : 0.08066068 ETH
  Penalty : 0 ETH
  Missed  : 0.000132644 ETH

Attestation Rewards  (0.000009371 ETH)
  Head   reward : 0.000002408 ETH
  Source reward : 0.000002437 ETH
  Target reward : 0.000004526 ETH

Sync Committee  (0 ETH)
  Reward  : 0 ETH
  Penalty : 0 ETH

Proposal Rewards  (0.080651309 ETH)
  Execution Layer : 0.035087332 ETH
  Attest Inclusion: 0.043946801 ETH
  Sync Inclusion  : 0.001617176 ETH
  Missed CL       : 0.000132644 ETH
  Missed EL       : 0 ETH
```
