# CALLDATA Module

## Overview

The `calldata` module provides utilities to **encode** and **decode** Ethereum
transaction calldata — the `data` field sent with contract calls and
transactions.

Calldata consists of:
1. A **4-byte function selector** (the first 4 bytes of the keccak256 hash of
   the canonical function signature).
2. **ABI-encoded parameters** following the selector.

The module uses a registry of pre-computed selectors for common ERC-20,
ERC-721, and ERC-1155 functions. Custom selectors can be added at construction
time, removing the need for an on-chain keccak256 dependency for most use cases.

---

## Features

- ✅ **Encode** function calls into calldata (selector + ABI-encoded params)
- ✅ **Decode** calldata back into selector, function signature, and parameter values
- ✅ **Split** raw calldata into selector and params sections
- ✅ **Validate** calldata format
- ✅ **Format** a human-readable summary of calldata
- ✅ **Reverse lookup** function signatures from selectors
- ✅ **Extensible** via custom selector registry

---

## Installation

This module is part of the `big-world-bigger-ideas` package:

```bash
npm install big-world-bigger-ideas
```

---

## Quick Start

```javascript
const CalldataEncoder = require('big-world-bigger-ideas/src/calldata');

const enc = new CalldataEncoder();

// Encode a transfer call
const calldata = enc.encode('transfer(address,uint256)', [
  '0xAbCdEf1234567890123456789012345678901234',
  1000000n   // BigInt for uint256
]);
console.log(calldata);
// 0xa9059cbb000000000000000000000000abcdef1234...00000000000000000000000000000f4240

// Decode it back
const decoded = enc.decode(calldata);
console.log(decoded.signature); // "transfer(address,uint256)"
console.log(decoded.params);    // [ '0xabcdef...', '1000000' ]
```

---

## API Reference

### Constructor

```javascript
new CalldataEncoder([options])
```

**Parameters:**
- `options` (object, optional):
  - `extraSelectors` (object): Additional `{ "signature": "0xSELECTOR" }` entries to merge into the built-in registry.

---

### `getSelector(signature)`

Returns the 4-byte function selector for a known function signature.

**Parameters:**
- `signature` (string): Canonical function signature e.g. `"balanceOf(address)"`

**Returns:** `string` — `"0xXXXXXXXX"`

**Throws:** `Error` if the signature is not in the known list.

**Example:**
```javascript
enc.getSelector('transfer(address,uint256)'); // "0xa9059cbb"
```

---

### `getSignature(selector)`

Reverse-looks up the function signature for a 4-byte selector.

**Parameters:**
- `selector` (string): Selector with or without `0x` prefix.

**Returns:** `string | null`

**Example:**
```javascript
enc.getSignature('0xa9059cbb'); // "transfer(address,uint256)"
enc.getSignature('0xdeadbeef'); // null
```

---

### `getKnownSelectors()`

Returns a copy of the complete `{ signature → selector }` registry.

**Returns:** `object`

---

### `encode(signature, params?)`

Encodes a complete function call (selector + ABI-encoded parameters).

**Parameters:**
- `signature` (string): Canonical function signature.
- `params` (Array, optional): Parameter values matching the signature's type list.

**Returns:** `string` — hex calldata with `0x` prefix.

**Throws:**
- `Error` if the signature is unknown.
- `Error` if the parameter count does not match the signature.
- `Error` if a parameter value is invalid for its type.

**Supported parameter types:**
| Type | JavaScript input |
|------|-----------------|
| `address` | `"0x..."` string (42 chars) |
| `uint256`, `uint8`–`uint248` | `BigInt`, `number`, or numeric `string` |
| `int256`, `int8`–`int248` | `BigInt`, `number`, or numeric `string` |
| `bool` | `true` / `false` |
| `bytes1`–`bytes32` | `"0x..."` hex string |
| `string` | UTF-8 `string` |
| `bytes` | `"0x..."` hex string or `Buffer` |

**Example:**
```javascript
const calldata = enc.encode('transferFrom(address,address,uint256)', [
  '0x1111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222',
  500n
]);
```

---

### `decode(calldata, signature?)`

Decodes calldata into its selector, signature, and parameter values.

**Parameters:**
- `calldata` (string): Hex calldata with or without `0x` prefix.
- `signature` (string, optional): Override signature (useful for unknown selectors).

**Returns:**
```javascript
{
  selector: string,       // "0xXXXXXXXX"
  signature: string|null, // null if selector is unknown and no override given
  params: Array           // decoded parameter values
}
```

**Example:**
```javascript
const { selector, signature, params } = enc.decode(calldata);
```

---

### `split(calldata)`

Splits calldata into selector and raw parameter hex without decoding.

**Parameters:**
- `calldata` (string): Hex calldata.

**Returns:**
```javascript
{ selector: string, params: string }
```

**Throws:** `Error` if calldata is shorter than 4 bytes.

---

### `decodeParams(paramsHex, types)`

Decodes only the parameter section of calldata given a list of types.

**Parameters:**
- `paramsHex` (string): Hex string of the parameter data (no `0x` prefix required).
- `types` (string[]): Solidity type strings in parameter order.

**Returns:** `Array` of decoded values.

---

### `validate(calldata)`

Checks that calldata is syntactically valid.

**Parameters:**
- `calldata` (string): Hex calldata.

**Returns:**
```javascript
{
  valid: boolean,
  bytes: number,
  selector?: string,
  knownSignature?: string|null,
  error?: string          // present when valid === false
}
```

---

### `format(calldata)`

Returns a human-readable multi-line summary of calldata.

**Parameters:**
- `calldata` (string): Hex calldata.

**Returns:** `string`

**Example output:**
```
Calldata Summary
========================================
Bytes:    36
Selector: 0x70a08231
Function: balanceOf(address)
  Param 1 (address): 0x1234567890123456789012345678901234567890
```

---

## Known Function Selectors

| Selector | Function Signature |
|----------|--------------------|
| `0x70a08231` | `balanceOf(address)` |
| `0x18160ddd` | `totalSupply()` |
| `0x06fdde03` | `name()` |
| `0x95d89b41` | `symbol()` |
| `0x313ce567` | `decimals()` |
| `0xdd62ed3e` | `allowance(address,address)` |
| `0x095ea7b3` | `approve(address,uint256)` |
| `0xa9059cbb` | `transfer(address,uint256)` |
| `0x23b872dd` | `transferFrom(address,address,uint256)` |
| `0x8da5cb5b` | `owner()` |
| `0x6352211e` | `ownerOf(uint256)` |
| `0xc87b56dd` | `tokenURI(uint256)` |
| `0x42842e0e` | `safeTransferFrom(address,address,uint256)` |
| `0x081812fc` | `getApproved(uint256)` |
| `0xa22cb465` | `setApprovalForAll(address,bool)` |
| `0xe985e9c5` | `isApprovedForAll(address,address)` |
| `0x00fdd58e` | `balanceOf(address,uint256)` |
| `0x0e89341c` | `uri(uint256)` |
| `0x01ffc9a7` | `supportsInterface(bytes4)` |

---

## Adding Custom Selectors

```javascript
const enc = new CalldataEncoder({
  extraSelectors: {
    'deposit(uint256)': '0xb6b55f25',
    'withdraw(uint256)': '0x2e1a7d4d'
  }
});

const calldata = enc.encode('deposit(uint256)', [1_000_000_000_000_000_000n]);
```

---

## Notes

- `uint256` / `int256` values should be passed as `BigInt` for full 256-bit range support. `number` is also accepted for values within JavaScript's safe integer range.
- String and `bytes` parameters use standard ABI dynamic encoding (offset + length + data).
- This module does **not** require a keccak256 library; selectors are stored as constants. For fully arbitrary function signatures, integrate a keccak256 library and compute selectors dynamically.
