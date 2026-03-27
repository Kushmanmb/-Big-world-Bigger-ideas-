# OP_RETURN Module

Cross-platform module for encoding, decoding, and working with OP_RETURN data across Bitcoin, Litecoin, and Ethereum blockchains.

## Overview

OP_RETURN is a Bitcoin script opcode used to store arbitrary data on the blockchain. This module provides a unified interface for working with embedded data across multiple blockchain platforms:

- **Bitcoin & Litecoin**: Uses OP_RETURN opcode with 80-byte limit
- **Ethereum**: Uses transaction input data field with no practical size limit (gas limited)

## Features

- ✅ Cross-platform support (Bitcoin, Litecoin, Ethereum)
- ✅ Data encoding to hexadecimal format
- ✅ Data decoding from hexadecimal
- ✅ Size validation for each platform
- ✅ OP_RETURN script creation for Bitcoin/Litecoin
- ✅ Transaction data creation for Ethereum
- ✅ Fetch and extract embedded data from transactions via Blockchair API
- ✅ Built-in caching (60-second default)
- ✅ Unicode and special character support

## Installation

```bash
npm install big-world-bigger-ideas
```

## Usage

### Basic Example

```javascript
const OPReturnFetcher = require('big-world-bigger-ideas').OPReturnFetcher;
// Or if using from source:
// const OPReturnFetcher = require('./src/op-return.js');

// Create a Bitcoin OP_RETURN instance
const btcFetcher = new OPReturnFetcher('bitcoin');

// Encode data
const message = 'Hello Bitcoin!';
const encoded = btcFetcher.encodeData(message);
console.log('Encoded:', encoded); // Hex string

// Decode data
const decoded = btcFetcher.decodeData(encoded);
console.log('Decoded:', decoded); // 'Hello Bitcoin!'

// Create OP_RETURN script
const script = btcFetcher.createOpReturnScript(message);
console.log('Script:', script);
// {
//   opcode: 'OP_RETURN',
//   hex: '48656c6c6f20426974636f696e21',
//   bytes: 14,
//   data: 'Hello Bitcoin!',
//   script: 'OP_RETURN 48656c6c6f20426974636f696e21',
//   platform: 'bitcoin'
// }
```

### Platform-Specific Examples

#### Bitcoin

```javascript
const btcFetcher = new OPReturnFetcher('bitcoin');

// Validate data size (max 80 bytes for Bitcoin)
const validation = btcFetcher.validateDataSize('Your data here');
if (validation.valid) {
  const script = btcFetcher.createOpReturnScript('Your data here');
  console.log('Bitcoin OP_RETURN:', script);
}
```

#### Litecoin

```javascript
const ltcFetcher = new OPReturnFetcher('litecoin');

// Same API as Bitcoin
const script = ltcFetcher.createOpReturnScript('Litecoin data');
console.log('Litecoin OP_RETURN:', script);
```

#### Ethereum

```javascript
const ethFetcher = new OPReturnFetcher('ethereum');

// Ethereum uses transaction input data instead of OP_RETURN
const ethData = ethFetcher.createEthereumData('Ethereum transaction data');
console.log('Ethereum data:', ethData);
// {
//   data: 'Ethereum transaction data',
//   hex: '0x457468657265756d207472616e73616374696f6e2064617461',
//   bytes: 25,
//   platform: 'ethereum',
//   field: 'input_data'
// }
```

### Fetching Transaction Data

```javascript
const btcFetcher = new OPReturnFetcher('bitcoin');

// Fetch transaction and extract OP_RETURN data
const txHash = 'abc123...'; // Valid Bitcoin transaction hash
try {
  const result = await btcFetcher.getTransactionData(txHash);
  
  if (result.hasData) {
    console.log('Found embedded data!');
    console.log('Raw hex:', result.raw);
    console.log('Decoded:', result.decoded);
  } else {
    console.log('No OP_RETURN data found');
  }
} catch (error) {
  console.error('Error:', error.message);
}
```

## API Reference

### Constructor

#### `new OPReturnFetcher(platform, baseUrl)`

Creates a new OP_RETURN fetcher instance.

**Parameters:**
- `platform` (string): Blockchain platform - `'bitcoin'`, `'litecoin'`, or `'ethereum'`
- `baseUrl` (string, optional): API base URL, defaults to `'api.blockchair.com'`

**Throws:**
- Error if platform is invalid

**Example:**
```javascript
const fetcher = new OPReturnFetcher('bitcoin');
```

### Methods

#### `encodeData(data)`

Encodes a string to hexadecimal format for OP_RETURN.

**Parameters:**
- `data` (string): The data to encode

**Returns:**
- (string): Hexadecimal encoded string

**Throws:**
- Error if data is empty, not a string, or exceeds platform limits

**Example:**
```javascript
const hex = fetcher.encodeData('Hello World');
// Returns: '48656c6c6f20576f726c64'
```

#### `decodeData(hexData)`

Decodes hexadecimal OP_RETURN data to a string.

**Parameters:**
- `hexData` (string): The hexadecimal data to decode (with or without '0x' prefix)

**Returns:**
- (string): Decoded string

**Throws:**
- Error if hexData is invalid

**Example:**
```javascript
const text = fetcher.decodeData('48656c6c6f20576f726c64');
// Returns: 'Hello World'
```

#### `createOpReturnScript(data)`

Creates an OP_RETURN script for Bitcoin/Litecoin transactions.

**Parameters:**
- `data` (string): The data to embed

**Returns:**
- (object): OP_RETURN script details

**Throws:**
- Error if platform is Ethereum or data is invalid

**Example:**
```javascript
const script = btcFetcher.createOpReturnScript('Test');
// {
//   opcode: 'OP_RETURN',
//   hex: '54657374',
//   bytes: 4,
//   data: 'Test',
//   script: 'OP_RETURN 54657374',
//   platform: 'bitcoin'
// }
```

#### `createEthereumData(data)`

Creates transaction data for Ethereum.

**Parameters:**
- `data` (string): The data to embed

**Returns:**
- (object): Ethereum transaction data details

**Throws:**
- Error if platform is not Ethereum

**Example:**
```javascript
const ethData = ethFetcher.createEthereumData('Test');
// {
//   data: 'Test',
//   hex: '0x54657374',
//   bytes: 4,
//   platform: 'ethereum',
//   field: 'input_data'
// }
```

#### `validateDataSize(data)`

Validates data size for the current platform.

**Parameters:**
- `data` (string): The data to validate

**Returns:**
- (object): Validation result

**Example:**
```javascript
const validation = fetcher.validateDataSize('Test data');
// {
//   valid: true,
//   size: 9,
//   maxSize: 80,
//   platform: 'bitcoin'
// }
```

#### `async getTransactionData(txHash)`

Fetches transaction data and extracts OP_RETURN or input data.

**Parameters:**
- `txHash` (string): Transaction hash (64 hex characters)

**Returns:**
- (Promise<object>): Transaction data with decoded OP_RETURN/input data

**Throws:**
- Error if txHash is invalid or request fails

**Example:**
```javascript
const result = await fetcher.getTransactionData('abc123...');
// {
//   hasData: true,
//   platform: 'bitcoin',
//   raw: '48656c6c6f',
//   decoded: 'Hello',
//   transaction: { ... }
// }
```

#### `formatData(data)`

Formats OP_RETURN data for display.

**Parameters:**
- `data` (object): OP_RETURN data object

**Returns:**
- (string): Formatted output

**Example:**
```javascript
const formatted = fetcher.formatData(result);
console.log(formatted);
```

#### `clearCache()`

Clears the internal cache.

**Example:**
```javascript
fetcher.clearCache();
```

#### `getCacheStats()`

Gets cache statistics.

**Returns:**
- (object): Cache statistics

**Example:**
```javascript
const stats = fetcher.getCacheStats();
// {
//   size: 5,
//   timeout: 60000,
//   platform: 'bitcoin',
//   keys: ['tx-bitcoin-abc123...']
// }
```

## Platform Specifications

| Platform  | Method          | Max Size           | Opcode/Field    |
|-----------|----------------|--------------------|--------------------|
| Bitcoin   | OP_RETURN      | 80 bytes           | 0x6a (OP_RETURN)   |
| Litecoin  | OP_RETURN      | 80 bytes           | 0x6a (OP_RETURN)   |
| Ethereum  | Input Data     | Unlimited (gas)    | input_data field   |

## Use Cases

### 1. Document Timestamping

```javascript
const btcFetcher = new OPReturnFetcher('bitcoin');
const docHash = 'sha256:abc123...';
const timestamp = new Date().toISOString();
const data = `DOC:${docHash}:${timestamp}`;

const script = btcFetcher.createOpReturnScript(data);
// Use script.hex in your Bitcoin transaction
```

### 2. NFT Metadata Links

```javascript
const btcFetcher = new OPReturnFetcher('bitcoin');
const ipfsHash = 'ipfs://QmX7Y8Z9...';

const script = btcFetcher.createOpReturnScript(ipfsHash);
```

### 3. Short Messages

```javascript
const btcFetcher = new OPReturnFetcher('bitcoin');
const message = 'GM from the blockchain!';

const script = btcFetcher.createOpReturnScript(message);
```

### 4. JSON Metadata (Ethereum)

```javascript
const ethFetcher = new OPReturnFetcher('ethereum');
const metadata = JSON.stringify({
  type: 'metadata',
  version: '1.0',
  properties: { ... }
});

const ethData = ethFetcher.createEthereumData(metadata);
```

## Error Handling

The module throws descriptive errors for various scenarios:

```javascript
try {
  const fetcher = new OPReturnFetcher('bitcoin');
  
  // This will throw an error (too large for Bitcoin)
  const longData = 'a'.repeat(100);
  fetcher.encodeData(longData);
  
} catch (error) {
  console.error('Error:', error.message);
  // 'Data exceeds maximum 80 bytes for bitcoin. Current size: 100 bytes'
}
```

## Caching

The module includes built-in caching to reduce API calls:

- **Cache timeout**: 60 seconds (default)
- **Cache key format**: `tx-{platform}-{txHash}`
- **Clear cache**: Use `clearCache()` method

## Testing

Run the test suite:

```bash
npm run test:op-return
```

Or run the example:

```bash
npm run op-return:demo
```

## Best Practices

1. **Validate data size** before creating scripts
2. **Keep data concise** for Bitcoin/Litecoin (80-byte limit)
3. **Use hex encoding** for binary data
4. **Cache results** to minimize API calls
5. **Handle errors gracefully** in production
6. **Consider gas costs** for Ethereum data storage

## Limitations

- Bitcoin/Litecoin: 80-byte maximum per OP_RETURN output
- Ethereum: Gas costs scale with data size
- API rate limits apply (Blockchair)
- Network-specific transaction fees apply

## Related Modules

- `bitcoin-mining.js` - Bitcoin mining data
- `litecoin-blockchair.js` - Litecoin blockchain data
- `ethereum-blockchair.js` - Ethereum blockchain data

## Resources

- [Bitcoin OP_RETURN](https://en.bitcoin.it/wiki/OP_RETURN)
- [Blockchair API Documentation](https://blockchair.com/api/docs)
- [Bitcoin Script Reference](https://en.bitcoin.it/wiki/Script)

## License

ISC

## Author

Matthew Brace (kushmanmb@gmx.com)
