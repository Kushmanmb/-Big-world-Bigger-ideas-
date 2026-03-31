# 📍 Address Tracker Module

## Overview

The Address Tracker module provides comprehensive tracking and monitoring of crypto addresses across multiple blockchain networks. It enables tracking of owner token holdings, transaction history, and multi-chain address management for cryptocurrency wallets.

## Features

- 🔍 **Multi-Chain Address Tracking**: Track addresses across Ethereum, Base, Polygon, and other networks
- 🎨 **Token Management**: Record and track NFT tokens owned by addresses
- 💸 **Transaction History**: Monitor transaction activity for tracked addresses
- 📊 **Statistics**: Get comprehensive statistics about tracked addresses
- 🏷️ **Address Labeling**: Label addresses for easy identification
- 💾 **JSON Import/Export**: Save and restore tracking data
- 🌐 **Network Organization**: Group addresses by blockchain network

## Installation

The module is included in the repository. No additional installation is required.

```javascript
const { AddressTracker, AddressInfo } = require('./src/address-tracker.js');
```

## Quick Start

```javascript
const { AddressTracker } = require('./src/address-tracker.js');

// Create an address tracker
const tracker = new AddressTracker('kushmanmb');

// Add addresses to track
tracker.addAddress(
  '0x1234567890123456789012345678901234567890',
  'ethereum',
  'Main Ethereum Wallet'
);

tracker.addAddress(
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  'base',
  'Base L2 Wallet'
);

// Record a token
tracker.recordToken('0x1234567890123456789012345678901234567890', {
  tokenId: '123',
  contract: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  name: 'Bored Ape Yacht Club',
  symbol: 'BAYC'
});

// Get tokens for an address
const tokens = tracker.getTokensForAddress('0x1234567890123456789012345678901234567890');
console.log(`Tokens owned: ${tokens.length}`);

// Get statistics
const stats = tracker.getStatistics();
console.log(`Tracking ${stats.totalAddresses} addresses across ${stats.networksTracked} networks`);
```

## API Reference

### AddressTracker Class

#### Constructor

```javascript
const tracker = new AddressTracker(owner);
```

**Parameters:**
- `owner` (string, optional) - The owner identifier (default: 'kushmanmb')

**Example:**
```javascript
const tracker = new AddressTracker('myusername');
```

#### Methods

##### `addAddress(address, network, label)`

Adds an address to track.

**Parameters:**
- `address` (string) - The blockchain address (Ethereum format)
- `network` (string) - The network name (e.g., 'ethereum', 'base')
- `label` (string, optional) - A label for the address

**Returns:** AddressInfo object

**Throws:** Error if address is invalid or already tracked

**Example:**
```javascript
tracker.addAddress(
  '0x1234567890123456789012345678901234567890',
  'ethereum',
  'My Wallet'
);
```

##### `removeAddress(address)`

Removes an address from tracking.

**Parameters:**
- `address` (string) - The address to remove

**Returns:** Boolean (true if removed, false if not found)

**Example:**
```javascript
const removed = tracker.removeAddress('0x1234567890123456789012345678901234567890');
```

##### `getAddress(address)`

Gets information about a tracked address.

**Parameters:**
- `address` (string) - The address to query

**Returns:** AddressInfo object

**Throws:** Error if address is not tracked

**Example:**
```javascript
const addressInfo = tracker.getAddress('0x1234567890123456789012345678901234567890');
console.log(`Network: ${addressInfo.network}`);
console.log(`Label: ${addressInfo.label}`);
```

##### `isTracking(address)`

Checks if an address is being tracked.

**Parameters:**
- `address` (string) - The address to check

**Returns:** Boolean

**Example:**
```javascript
if (tracker.isTracking('0x1234567890123456789012345678901234567890')) {
  console.log('Address is being tracked');
}
```

##### `getAllAddresses()`

Gets all tracked addresses.

**Returns:** Array of AddressInfo objects

**Example:**
```javascript
const allAddresses = tracker.getAllAddresses();
allAddresses.forEach(addr => {
  console.log(`${addr.address} - ${addr.label}`);
});
```

##### `getAddressesByNetwork(network)`

Gets all addresses on a specific network.

**Parameters:**
- `network` (string) - The network name

**Returns:** Array of AddressInfo objects

**Example:**
```javascript
const ethAddresses = tracker.getAddressesByNetwork('ethereum');
console.log(`Ethereum addresses: ${ethAddresses.length}`);
```

##### `recordToken(address, tokenInfo)`

Records a token for an address.

**Parameters:**
- `address` (string) - The address that owns the token
- `tokenInfo` (object) - Token information

**Example:**
```javascript
tracker.recordToken('0x1234567890123456789012345678901234567890', {
  tokenId: '123',
  contract: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  name: 'Bored Ape Yacht Club',
  symbol: 'BAYC'
});
```

##### `recordTransaction(address, transactionInfo)`

Records a transaction for an address.

**Parameters:**
- `address` (string) - The address involved in the transaction
- `transactionInfo` (object) - Transaction information

**Example:**
```javascript
tracker.recordTransaction('0x1234567890123456789012345678901234567890', {
  hash: '0xabc123def456',
  from: '0x1234567890123456789012345678901234567890',
  to: '0x9999999999999999999999999999999999999999',
  value: '1000000000000000000', // 1 ETH
  blockNumber: 18000000
});
```

##### `getTokensForAddress(address)`

Gets all tokens owned by an address.

**Parameters:**
- `address` (string) - The address to query

**Returns:** Array of token objects

**Example:**
```javascript
const tokens = tracker.getTokensForAddress('0x1234567890123456789012345678901234567890');
tokens.forEach(token => {
  console.log(`${token.name} #${token.tokenId}`);
});
```

##### `getTransactionCount(address)`

Gets the number of recorded transactions for an address.

**Parameters:**
- `address` (string) - The address to query

**Returns:** Number

**Example:**
```javascript
const txCount = tracker.getTransactionCount('0x1234567890123456789012345678901234567890');
console.log(`Transactions: ${txCount}`);
```

##### `getStatistics()`

Gets comprehensive statistics about tracked addresses.

**Returns:** Object with statistics

**Example:**
```javascript
const stats = tracker.getStatistics();
// Returns: {
//   owner: 'kushmanmb',
//   totalAddresses: 3,
//   networkCounts: { ethereum: 2, base: 1 },
//   totalTokens: 5,
//   totalTransactions: 10,
//   networksTracked: 2
// }
```

##### `toJSON()`

Exports all tracking data as JSON.

**Returns:** Object with tracking data

**Example:**
```javascript
const data = tracker.toJSON();
console.log(JSON.stringify(data, null, 2));
```

##### `fromJSON(data)`

Imports tracking data from JSON.

**Parameters:**
- `data` (object) - JSON data to import

**Example:**
```javascript
const tracker1 = new AddressTracker();
// ... add addresses and data

const json = tracker1.toJSON();

const tracker2 = new AddressTracker();
tracker2.fromJSON(json);
```

##### `formatStatistics()`

Formats statistics for display.

**Returns:** Formatted string

**Example:**
```javascript
console.log(tracker.formatStatistics());
```

##### `formatAddresses()`

Formats all addresses for display.

**Returns:** Formatted string

**Example:**
```javascript
console.log(tracker.formatAddresses());
```

### AddressInfo Class

Represents information about a tracked address.

#### Properties

- `address` (string) - The blockchain address
- `network` (string) - The network name
- `label` (string) - The address label
- `trackedSince` (number) - Timestamp when tracking started
- `tokens` (array) - Array of token objects
- `transactions` (array) - Array of transaction objects
- `metadata` (object) - Additional metadata

#### Methods

##### `addToken(token)`

Adds a token to this address.

##### `addTransaction(transaction)`

Adds a transaction to this address.

##### `getTokens()`

Gets all tokens for this address.

##### `getTransactionCount()`

Gets the transaction count for this address.

##### `toJSON()`

Exports address info as JSON.

## Address Validation

The module validates Ethereum-style addresses:

- Must be 40 hexadecimal characters (with or without 0x prefix)
- Automatically normalizes to lowercase with 0x prefix
- Throws descriptive errors for invalid addresses

**Valid Formats:**
```javascript
'0x1234567890123456789012345678901234567890'  // ✓
'1234567890123456789012345678901234567890'    // ✓ (0x will be added)
```

**Invalid Formats:**
```javascript
'invalid'              // ✗ Wrong length
'0x12345'              // ✗ Too short
'not-a-hex-address'    // ✗ Non-hex characters
```

## Use Cases

### 1. NFT Portfolio Tracking

Track NFT holdings across multiple addresses and chains:

```javascript
const tracker = new AddressTracker('collector');

tracker.addAddress(ethAddress, 'ethereum', 'Main Collection');
tracker.addAddress(baseAddress, 'base', 'Base NFTs');

// Record NFTs
tracker.recordToken(ethAddress, {
  tokenId: '1234',
  contract: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  name: 'BAYC'
});

// Get total NFT count
const stats = tracker.getStatistics();
console.log(`Total NFTs: ${stats.totalTokens}`);
```

### 2. Multi-Chain Wallet Monitoring

Monitor wallet activity across different blockchains:

```javascript
const tracker = new AddressTracker('whale-watcher');

// Track addresses on different networks
tracker.addAddress(ethAddress, 'ethereum', 'ETH Wallet');
tracker.addAddress(baseAddress, 'base', 'Base Wallet');
tracker.addAddress(polygonAddress, 'polygon', 'Polygon Wallet');

// Get addresses by network
const ethAddresses = tracker.getAddressesByNetwork('ethereum');
```

### 3. Transaction History

Record and monitor transaction activity:

```javascript
tracker.recordTransaction(address, {
  hash: '0xabc123',
  from: address,
  to: '0x9999999999999999999999999999999999999999',
  value: '1000000000000000000',
  blockNumber: 18000000,
  timestamp: Date.now()
});

const txCount = tracker.getTransactionCount(address);
```

### 4. Portfolio Export/Import

Save and restore tracking data:

```javascript
// Export
const data = tracker.toJSON();
fs.writeFileSync('portfolio.json', JSON.stringify(data, null, 2));

// Import
const savedData = JSON.parse(fs.readFileSync('portfolio.json'));
const newTracker = new AddressTracker();
newTracker.fromJSON(savedData);
```

## Testing

Run the address tracker tests:

```bash
npm run test:address-tracker
```

Expected output:
```
📊 Test Summary:
✓ Passed: 43
✗ Failed: 0
Total: 43

🎉 All tests passed!
```

## Demo

See the address tracker in action:

```bash
npm run address-tracker:demo
```

This will demonstrate:
- Adding addresses to track
- Recording NFT tokens
- Recording transactions
- Querying tokens and transaction counts
- Getting addresses by network
- Statistics and formatting
- JSON export/import

## Integration with Other Modules

### With ERC721 Module

```javascript
const ERC721Fetcher = require('./erc721.js');
const { AddressTracker } = require('./address-tracker.js');

const tracker = new AddressTracker('owner');
const fetcher = new ERC721Fetcher(contractAddress);

// Track an address and its tokens
tracker.addAddress(address, 'ethereum', 'NFT Wallet');

// Get token ownership from ERC721 and record it
const owner = await fetcher.getOwner(tokenId);
if (owner.owner === address) {
  tracker.recordToken(address, {
    tokenId: tokenId,
    contract: contractAddress
  });
}
```

### With Token History Module

```javascript
const { TokenHistoryTracker } = require('./token-history.js');
const { AddressTracker } = require('./address-tracker.js');

const addressTracker = new AddressTracker('owner');
const historyTracker = new TokenHistoryTracker(contractAddress, 'owner');

// Record both in history and address tracker
historyTracker.recordTransfer(tokenId, fromAddress, toAddress, timestamp, txHash, blockNumber);
addressTracker.recordToken(toAddress, { tokenId, contract: contractAddress });
```

## Network Support

The module supports tracking addresses on any blockchain network:

- Ethereum (Mainnet)
- Base (Layer 2)
- Polygon (Sidechain)
- And any other EVM-compatible network

Network names are case-insensitive and stored in lowercase.

## Error Handling

The module provides descriptive error messages:

```javascript
// Invalid address format
try {
  tracker.addAddress('invalid', 'ethereum');
} catch (error) {
  console.error(error.message); // "Invalid Ethereum address format"
}

// Duplicate address
try {
  tracker.addAddress(address, 'ethereum');
  tracker.addAddress(address, 'ethereum'); // Already tracked
} catch (error) {
  console.error(error.message); // "Address ... is already being tracked"
}

// Address not tracked
try {
  tracker.getAddress('0x0000000000000000000000000000000000000000');
} catch (error) {
  console.error(error.message); // "Address ... is not being tracked"
}
```

## Best Practices

1. **Label Your Addresses**: Use descriptive labels for easy identification
2. **Regular Exports**: Periodically export your tracking data as backup
3. **Network Consistency**: Use consistent network names (lowercase recommended)
4. **Validate Before Adding**: Check if address is already tracked before adding
5. **Record Metadata**: Include timestamps and block numbers in transactions

## License

ISC License - See repository root for details

## Author

**Matthew Brace (kushmanmb)**  
Email: mattbrace92@gmail.com  
Website: [kushmanmb.org](https://kushmanmb.org)  
ENS: kushmanmb.base.eth

## Related Modules

- **erc721.js** - ERC-721 NFT token interaction
- **token-history.js** - Token ownership history tracking
- **consensus-tracker.js** - Blockchain consensus mechanism tracking
- **bitcoin-mining.js** - Bitcoin mining data and statistics

---

**Mission Statement:** *Empowering crypto clarity, fueled by innovation and style*
