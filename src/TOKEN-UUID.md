# Token UUID Module

A comprehensive UUID (Universally Unique Identifier) generation and validation module specifically designed for blockchain tokens and NFTs. Supports both random (v4) and deterministic (v5) UUID generation with built-in Ethereum address validation.

## Overview

The Token UUID module provides RFC4122-compliant UUID generation for:

- **Random token identifiers** - Using UUID v4 for non-deterministic, unique IDs
- **Deterministic token identifiers** - Using UUID v5 for consistent, reproducible IDs
- **Ownership event tracking** - Generating unique IDs for NFT transfer events
- **Address normalization** - Ensuring consistent UUIDs regardless of address format

## Installation

```javascript
const TokenUUID = require('./src/token-uuid');
```

## Quick Start

```javascript
const TokenUUID = require('./src/token-uuid');

// Create a TokenUUID instance
const tokenUUID = new TokenUUID();

// Generate a random UUID (v4)
const randomUUID = tokenUUID.generateRandom();
console.log(randomUUID); // e.g., "550e8400-e29b-41d4-a716-446655440000"

// Generate a deterministic UUID for a token (v5)
const contractAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
const tokenId = '1234';
const tokenUUID_id = tokenUUID.generateForToken(contractAddress, tokenId);
console.log(tokenUUID_id); // e.g., "cc9152e6-d7b2-579d-835d-e9a6b645d816"

// The same inputs always generate the same UUID
const tokenUUID_id_again = tokenUUID.generateForToken(contractAddress, tokenId);
console.log(tokenUUID_id === tokenUUID_id_again); // true
```

## Core Features

### 1. Random UUID Generation (v4)

Generate unique, non-deterministic UUIDs perfect for creating new records or identifiers that don't need to be reproducible.

```javascript
const tokenUUID = new TokenUUID();

const uuid1 = tokenUUID.generateRandom();
const uuid2 = tokenUUID.generateRandom();

console.log(uuid1 !== uuid2); // true - each UUID is unique
```

### 2. Deterministic Token UUIDs (v5)

Generate consistent UUIDs based on contract address and token ID. The same inputs always produce the same UUID, making them perfect for:

- Consistent token identification across systems
- Database primary keys
- Deduplication
- Cross-reference linking

```javascript
const tokenUUID = new TokenUUID();

// These all generate the same UUID
const uuid1 = tokenUUID.generateForToken('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', '1234');
const uuid2 = tokenUUID.generateForToken('0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', '1234');
const uuid3 = tokenUUID.generateForToken('BC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', '1234');

console.log(uuid1 === uuid2 === uuid3); // true
```

### 3. Ownership Event UUIDs

Generate unique UUIDs for NFT transfer events that include contract, token ID, from/to addresses, and timestamp:

```javascript
const tokenUUID = new TokenUUID();

const eventUUID = tokenUUID.generateForEvent(
  '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', // contract
  '1234',                                          // token ID
  '0x0000000000000000000000000000000000000000', // from (mint)
  '0x1234567890123456789012345678901234567890', // to
  1609459200                                       // timestamp
);
```

### 4. UUID Validation

Validate UUID format without throwing errors:

```javascript
const tokenUUID = new TokenUUID();

tokenUUID.isValidUUID('550e8400-e29b-41d4-a716-446655440000'); // true
tokenUUID.isValidUUID('not-a-uuid');                           // false
tokenUUID.isValidUUID(null);                                   // false
```

Or validate with error throwing:

```javascript
try {
  tokenUUID.validateUUID('invalid-uuid');
} catch (error) {
  console.error(error.message); // "UUID is not a valid UUID format"
}
```

## API Reference

### Constructor

#### `new TokenUUID([namespace])`

Creates a new TokenUUID instance with an optional custom namespace.

**Parameters:**
- `namespace` (string, optional) - Custom UUID v5 namespace. Defaults to DNS namespace.

**Example:**
```javascript
// Default namespace
const tokenUUID1 = new TokenUUID();

// Custom namespace
const customNamespace = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
const tokenUUID2 = new TokenUUID(customNamespace);
```

### Instance Methods

#### `generateRandom()`

Generates a random UUID v4.

**Returns:** `string` - A UUID v4 string

**Example:**
```javascript
const uuid = tokenUUID.generateRandom();
// "550e8400-e29b-41d4-a716-446655440000"
```

#### `generateForToken(contractAddress, tokenId)`

Generates a deterministic UUID v5 for a token.

**Parameters:**
- `contractAddress` (string) - Ethereum contract address (40 hex chars, with or without 0x)
- `tokenId` (string|number) - Token ID

**Returns:** `string` - A UUID v5 string

**Throws:** Error if address format is invalid or parameters are missing

**Example:**
```javascript
const uuid = tokenUUID.generateForToken(
  '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  '1234'
);
// "cc9152e6-d7b2-579d-835d-e9a6b645d816"
```

#### `generateForEvent(contractAddress, tokenId, from, to, timestamp)`

Generates a deterministic UUID v5 for an ownership event.

**Parameters:**
- `contractAddress` (string) - Ethereum contract address
- `tokenId` (string|number) - Token ID
- `from` (string) - Previous owner address
- `to` (string) - New owner address
- `timestamp` (number) - Unix timestamp

**Returns:** `string` - A UUID v5 string

**Throws:** Error if any parameter is invalid or missing

**Example:**
```javascript
const eventUUID = tokenUUID.generateForEvent(
  '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  '1234',
  '0x0000000000000000000000000000000000000000',
  '0x1234567890123456789012345678901234567890',
  1609459200
);
```

#### `validateUUID(uuid, [name])`

Validates a UUID string and throws an error if invalid.

**Parameters:**
- `uuid` (string) - UUID to validate
- `name` (string, optional) - Name for error messages (default: "UUID")

**Returns:** `boolean` - True if valid

**Throws:** Error if UUID is invalid

**Example:**
```javascript
tokenUUID.validateUUID('550e8400-e29b-41d4-a716-446655440000'); // true

try {
  tokenUUID.validateUUID('invalid');
} catch (error) {
  console.error(error.message); // "UUID is not a valid UUID format"
}
```

#### `isValidUUID(uuid)`

Checks if a string is a valid UUID without throwing an error.

**Parameters:**
- `uuid` (string) - UUID to check

**Returns:** `boolean` - True if valid, false otherwise

**Example:**
```javascript
tokenUUID.isValidUUID('550e8400-e29b-41d4-a716-446655440000'); // true
tokenUUID.isValidUUID('invalid');                              // false
```

#### `getVersion(uuid)`

Gets the version number of a UUID.

**Parameters:**
- `uuid` (string) - UUID to check

**Returns:** `number` - Version number (1-5), or 0 if invalid

**Example:**
```javascript
const v4UUID = tokenUUID.generateRandom();
tokenUUID.getVersion(v4UUID); // 4

const v5UUID = tokenUUID.generateForToken('0xBC4C...', '1234');
tokenUUID.getVersion(v5UUID); // 5
```

#### `isNilUUID(uuid)`

Checks if a UUID is the NIL UUID (all zeros).

**Parameters:**
- `uuid` (string) - UUID to check

**Returns:** `boolean` - True if NIL UUID

**Example:**
```javascript
tokenUUID.isNilUUID('00000000-0000-0000-0000-000000000000'); // true
tokenUUID.isNilUUID(tokenUUID.generateRandom());              // false
```

### Static Methods

#### `TokenUUID.getNilUUID()`

Returns the NIL UUID constant.

**Returns:** `string` - `"00000000-0000-0000-0000-000000000000"`

**Example:**
```javascript
const nilUUID = TokenUUID.getNilUUID();
console.log(nilUUID); // "00000000-0000-0000-0000-000000000000"
```

#### `TokenUUID.getTokenNamespace()`

Returns the default token namespace UUID.

**Returns:** `string` - The default namespace UUID

**Example:**
```javascript
const namespace = TokenUUID.getTokenNamespace();
console.log(namespace); // "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
```

#### `TokenUUID.withNamespace(namespace)`

Creates a new TokenUUID instance with a custom namespace.

**Parameters:**
- `namespace` (string) - Custom namespace UUID

**Returns:** `TokenUUID` - New instance

**Example:**
```javascript
const customUUID = TokenUUID.withNamespace('6ba7b811-9dad-11d1-80b4-00c04fd430c8');
```

## Use Cases

### NFT Portfolio Tracking

Track NFTs across multiple collections with consistent UUIDs:

```javascript
const tokenUUID = new TokenUUID();

const portfolio = [
  { contract: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', tokenId: '1234' },
  { contract: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6', tokenId: '5678' }
];

portfolio.forEach(nft => {
  const uuid = tokenUUID.generateForToken(nft.contract, nft.tokenId);
  console.log(`Token UUID: ${uuid}`);
  // Store in database with UUID as primary key
});
```

### Event History Tracking

Generate unique identifiers for transfer events:

```javascript
const tokenUUID = new TokenUUID();

// Track a mint event
const mintUUID = tokenUUID.generateForEvent(
  contract,
  tokenId,
  '0x0000000000000000000000000000000000000000', // from zero address
  ownerAddress,
  Date.now() / 1000
);

// Track a transfer event
const transferUUID = tokenUUID.generateForEvent(
  contract,
  tokenId,
  previousOwner,
  newOwner,
  Date.now() / 1000
);
```

### Cross-System Integration

Use deterministic UUIDs for consistent identification across multiple systems:

```javascript
const tokenUUID = new TokenUUID();

// System A generates UUID
const systemA_UUID = tokenUUID.generateForToken(contract, tokenId);

// System B generates UUID for the same token
const systemB_UUID = tokenUUID.generateForToken(contract, tokenId);

// Both systems can reference the same token
console.log(systemA_UUID === systemB_UUID); // true
```

### Multi-Tenant Systems

Use custom namespaces to separate UUID spaces for different tenants:

```javascript
// Tenant 1
const tenant1UUID = new TokenUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
const uuid1 = tenant1UUID.generateForToken(contract, tokenId);

// Tenant 2
const tenant2UUID = new TokenUUID('6ba7b811-9dad-11d1-80b4-00c04fd430c8');
const uuid2 = tenant2UUID.generateForToken(contract, tokenId);

// Different namespaces = different UUIDs
console.log(uuid1 !== uuid2); // true
```

## Address Normalization

The module automatically normalizes Ethereum addresses to ensure consistent UUID generation:

- Removes or adds `0x` prefix as needed
- Converts to lowercase
- Validates format (40 hexadecimal characters)

```javascript
const tokenUUID = new TokenUUID();

// All these generate the same UUID
const uuid1 = tokenUUID.generateForToken('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', '1');
const uuid2 = tokenUUID.generateForToken('0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', '1');
const uuid3 = tokenUUID.generateForToken('BC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', '1');

console.log(uuid1 === uuid2 && uuid2 === uuid3); // true
```

## Error Handling

The module provides clear error messages for invalid inputs:

```javascript
const tokenUUID = new TokenUUID();

// Invalid contract address
try {
  tokenUUID.generateForToken('invalid-address', '1234');
} catch (error) {
  console.error(error.message); // "Invalid Ethereum address format"
}

// Missing token ID
try {
  tokenUUID.generateForToken('0xBC4C...', null);
} catch (error) {
  console.error(error.message); // "Token ID must be provided"
}

// Invalid timestamp
try {
  tokenUUID.generateForEvent(contract, tokenId, from, to, 'invalid');
} catch (error) {
  console.error(error.message); // "Timestamp must be a number"
}
```

## Testing

Run the comprehensive test suite:

```bash
npm run test:token-uuid
```

Run the interactive demo:

```bash
npm run token-uuid:demo
```

## Best Practices

1. **Use v4 for Random IDs**: When you need unique identifiers that don't need to be reproducible (e.g., session IDs, temporary identifiers)

2. **Use v5 for Deterministic IDs**: When you need consistent identifiers across systems or time (e.g., token references, database keys)

3. **Validate UUIDs**: Always validate UUIDs from external sources before using them

4. **Store Full UUIDs**: Don't truncate or modify UUIDs - always store the full 36-character string

5. **Use Custom Namespaces**: For multi-tenant systems, use different namespaces to prevent UUID collisions

6. **Handle Errors**: Wrap UUID generation in try-catch blocks when dealing with user input

## Technical Details

### UUID Versions

- **v4 (Random)**: Uses cryptographically-strong random values for maximum uniqueness
- **v5 (Deterministic)**: Uses SHA-1 hash of namespace + name for reproducible UUIDs

### Namespace

The module uses the DNS namespace UUID by default (`6ba7b810-9dad-11d1-80b4-00c04fd430c8`), which is one of the standard namespaces defined in RFC4122.

### Format

All UUIDs follow the standard format: `xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx`

Where:
- `M` indicates the UUID version (4 or 5)
- `N` indicates the variant (8, 9, A, or B for RFC4122)

## Dependencies

- `uuid` v11.0.0+ - RFC4122 compliant UUID generation

## Performance

- UUID v4 generation: ~1-2 microseconds per UUID
- UUID v5 generation: ~3-5 microseconds per UUID
- Validation: ~0.1 microseconds per check
- Address normalization: ~0.5 microseconds per address

## Browser Compatibility

This module uses Node.js CommonJS format. For browser usage, bundle with tools like:
- Webpack
- Browserify
- Rollup

## Support

For issues, questions, or contributions:

- **GitHub**: [kushmanmb-org/-Big-world-Bigger-ideas-](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-)
- **Email**: kushmanmb@gmx.com

## License

ISC License - See main repository for details.

---

**© 2024-2026 Matthew Brace (kushmanmb) | All Rights Reserved**
