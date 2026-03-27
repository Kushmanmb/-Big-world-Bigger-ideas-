# Token Ownership History Tracker

A git-style ownership history tracker for ERC-721 (NFT) tokens that provides comprehensive tracking and visualization of token ownership changes over time.

## Overview

The Token Ownership History Tracker is designed to record and track NFT token transfers in a format similar to git commit history. This makes it easy to:

- Track the complete ownership history of any token
- Monitor token transfers for specific owners (e.g., kushmanmb)
- Generate git-style logs and reports
- Export/import history data for persistence
- Analyze transfer patterns and statistics

## Installation

```javascript
const { TokenHistoryTracker, OwnershipEvent } = require('./src/token-history');
```

## Core Classes

### TokenHistoryTracker

The main class for tracking token ownership history.

#### Constructor

```javascript
new TokenHistoryTracker(contractAddress, owner = 'kushmanmb')
```

**Parameters:**
- `contractAddress` (string) - The ERC-721 contract address
- `owner` (string, optional) - Owner identifier (default: 'kushmanmb')

**Example:**
```javascript
const tracker = new TokenHistoryTracker(
  '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  'kushmanmb'
);
```

### OwnershipEvent

Represents a single token transfer event (similar to a git commit).

#### Constructor

```javascript
new OwnershipEvent(tokenId, from, to, timestamp, transactionHash, blockNumber)
```

**Parameters:**
- `tokenId` (string) - The token ID
- `from` (string) - Previous owner address
- `to` (string) - New owner address
- `timestamp` (number) - Unix timestamp of the transfer
- `transactionHash` (string) - Transaction hash
- `blockNumber` (number) - Block number

## API Reference

### Recording Transfers

#### recordTransfer(tokenId, from, to, timestamp, transactionHash, blockNumber)

Records a new token transfer event.

**Parameters:**
- `tokenId` (string) - Token ID
- `from` (string) - Previous owner address
- `to` (string) - New owner address
- `timestamp` (number) - Unix timestamp
- `transactionHash` (string) - Transaction hash
- `blockNumber` (number) - Block number

**Returns:** `OwnershipEvent` - The created event object

**Example:**
```javascript
const event = tracker.recordTransfer(
  '1234',
  '0x0000000000000000000000000000000000000000',  // Mint from zero address
  '0x1234567890123456789012345678901234567890',
  1609459200,
  '0xabc123def456789012345678901234567890abcdef1234567890123456789012',
  11565019
);
```

### Querying History

#### getTokenHistory(tokenId)

Gets the complete ownership history for a specific token.

**Parameters:**
- `tokenId` (string) - Token ID to query

**Returns:** `Array<OwnershipEvent>` - Array of ownership events for the token

**Example:**
```javascript
const history = tracker.getTokenHistory('1234');
console.log(`Token #1234 has ${history.length} transfers`);
```

#### getTokensByOwner(ownerAddress)

Gets all tokens currently owned by a specific address.

**Parameters:**
- `ownerAddress` (string) - Owner's Ethereum address

**Returns:** `Array<string>` - Array of token IDs

**Example:**
```javascript
const tokens = tracker.getTokensByOwner('0x1234567890123456789012345678901234567890');
console.log(`Owner has ${tokens.length} tokens: ${tokens.join(', ')}`);
```

#### getCurrentOwner(tokenId)

Gets the current owner of a token.

**Parameters:**
- `tokenId` (string) - Token ID to query

**Returns:** `string|null` - Owner address or null if not found

**Example:**
```javascript
const owner = tracker.getCurrentOwner('1234');
console.log(`Current owner: ${owner}`);
```

#### getHistoryForOwner(ownerAddress = null)

Gets all ownership events involving a specific owner.

**Parameters:**
- `ownerAddress` (string, optional) - Owner address (defaults to tracker owner)

**Returns:** `Array<OwnershipEvent>` - Array of events where owner was sender or recipient

**Example:**
```javascript
// Get history for default owner (kushmanmb)
const myHistory = tracker.getHistoryForOwner();

// Get history for specific address
const otherHistory = tracker.getHistoryForOwner('0x1234...');
```

### Resetting History

#### resetHard(eventId)

Resets the history to a specific event, discarding all events recorded after it. This is analogous to `git reset --hard <commit>` — the ownership state is rewound to exactly what it was at the specified event.

**Parameters:**
- `eventId` (string) - The event ID to reset to (the event itself is kept; all subsequent events are discarded)

**Throws:** `Error` if the event ID is not found in the history

**Example:**
```javascript
const event1 = tracker.recordTransfer('1', '0x0000...', '0xAlice...', t1, tx1, b1);
const event2 = tracker.recordTransfer('2', '0x0000...', '0xBob...', t2, tx2, b2);
const event3 = tracker.recordTransfer('1', '0xAlice...', '0xCarol...', t3, tx3, b3);

// Undo the last transfer — go back to the state at event2
tracker.resetHard(event2.id);

console.log(tracker.history.length);          // 2
console.log(tracker.getCurrentOwner('1'));     // 0xAlice... (restored)
console.log(tracker.getCurrentOwner('2'));     // 0xBob...
```

#### toGitLog(limit = null)

Formats the history in git-style log format.

**Parameters:**
- `limit` (number, optional) - Maximum number of events to include

**Returns:** `string` - Formatted git-style log

**Example:**
```javascript
// Get complete history
console.log(tracker.toGitLog());

// Get last 5 events
console.log(tracker.toGitLog(5));
```

**Output Format:**
```
commit 0000000059141cf6
Author: 0x1234567890123456789012345678901234567890
Date:   2021-01-01T00:00:00.000Z

    Transfer token #1234 from 0x0000... to 0x1234...
    
    Transaction: 0xabc123def456789012345678901234567890abcdef...
    Block: 11565019
```

#### toShortLog(limit = null)

Formats the history in compact one-line format.

**Parameters:**
- `limit` (number, optional) - Maximum number of events to include

**Returns:** `string` - Formatted compact log

**Example:**
```javascript
console.log(tracker.toShortLog());
```

**Output Format:**
```
00000000 - Token #1234: 0x00000000... → 0x12345678...
00000000 - Token #5678: 0xabcdefab... → 0x12345678...
```

### Statistics

#### getStatistics()

Gets comprehensive statistics about the tracked history.

**Returns:** `object` - Statistics object

**Example:**
```javascript
const stats = tracker.getStatistics();
console.log(`Total Transfers: ${stats.totalTransfers}`);
console.log(`Unique Tokens: ${stats.uniqueTokens}`);
console.log(`Unique Addresses: ${stats.uniqueAddresses}`);
```

**Return Object:**
```javascript
{
  totalTransfers: 4,        // Total number of transfers recorded
  uniqueTokens: 3,          // Number of unique tokens
  uniqueAddresses: 5,       // Number of unique addresses involved
  currentOwners: 3,         // Number of tokens with tracked owners
  contract: '0xbc4ca0...',  // Contract address (lowercase)
  trackedOwner: 'kushmanmb' // Owner identifier
}
```

### Data Persistence

#### toJSON()

Exports the complete history as JSON.

**Returns:** `object` - JSON-serializable history object

**Example:**
```javascript
const data = tracker.toJSON();
const jsonString = JSON.stringify(data, null, 2);
// Save to file or database
```

#### fromJSON(data)

Imports history from JSON data.

**Parameters:**
- `data` (object) - JSON history object (from toJSON)

**Example:**
```javascript
const tracker = new TokenHistoryTracker('0x0000...', 'test');
const jsonData = JSON.parse(savedJsonString);
tracker.fromJSON(jsonData);
```

## Use Cases

### Tracking Personal NFT Portfolio

Track all NFTs owned by kushmanmb across different contracts:

```javascript
const bayc = new TokenHistoryTracker('0xBC4CA...', 'kushmanmb');
const mayc = new TokenHistoryTracker('0x60E4...', 'kushmanmb');

// Record transfers for both collections
bayc.recordTransfer('1234', '0x0000...', kushmanmbAddress, timestamp, txHash, block);
mayc.recordTransfer('5678', '0x0000...', kushmanmbAddress, timestamp, txHash, block);

// Get complete portfolio
const baycTokens = bayc.getTokensByOwner(kushmanmbAddress);
const maycTokens = mayc.getTokensByOwner(kushmanmbAddress);
```

### Analyzing Token Provenance

Track the complete history of a specific token:

```javascript
const tracker = new TokenHistoryTracker('0xBC4CA...', 'kushmanmb');

// Record all transfers for token #1234
tracker.recordTransfer('1234', '0x0000...', '0xAlice...', t1, tx1, b1);  // Mint
tracker.recordTransfer('1234', '0xAlice...', '0xBob...', t2, tx2, b2);   // Sale
tracker.recordTransfer('1234', '0xBob...', kushmanmbAddr, t3, tx3, b3);  // Purchase

// View complete provenance
const history = tracker.getTokenHistory('1234');
console.log(`Token #1234 has changed hands ${history.length} times`);
```

### Generating Reports

Create comprehensive ownership reports:

```javascript
const tracker = new TokenHistoryTracker('0xBC4CA...', 'kushmanmb');
// ... record transfers ...

// Generate statistics
const stats = tracker.getStatistics();

// Create report
console.log('Portfolio Report for kushmanmb');
console.log('================================');
console.log(`Contract: ${stats.contract}`);
console.log(`Total Activity: ${stats.totalTransfers} transfers`);
console.log(`Tokens Tracked: ${stats.uniqueTokens}`);
console.log(`Market Participants: ${stats.uniqueAddresses}`);

// Show recent activity
console.log('\nRecent Activity:');
console.log(tracker.toShortLog(10));
```

### Data Backup and Restore

Save and restore history data:

```javascript
// Save history
const tracker1 = new TokenHistoryTracker('0xBC4CA...', 'kushmanmb');
// ... record transfers ...
const backup = tracker1.toJSON();
fs.writeFileSync('history-backup.json', JSON.stringify(backup));

// Restore history
const tracker2 = new TokenHistoryTracker('0x0000...', 'temp');
const restored = JSON.parse(fs.readFileSync('history-backup.json'));
tracker2.fromJSON(restored);
```

## Address Validation

All Ethereum addresses are automatically validated and normalized:

- Addresses must be 40 hex characters (with or without '0x' prefix)
- All addresses are converted to lowercase for consistency
- Short addresses are padded with leading zeros (for testing purposes)
- Invalid addresses throw descriptive errors

**Example:**
```javascript
// All of these are valid and normalized to the same format
tracker.recordTransfer('1', '0xABC...', '0xDEF...', ...);  // Mixed case
tracker.recordTransfer('1', 'ABC...', 'DEF...', ...);      // Without 0x
tracker.recordTransfer('1', '0xabc...', '0xdef...', ...);  // Lowercase
```

## Error Handling

The module throws descriptive errors for invalid inputs:

```javascript
try {
  tracker.recordTransfer('1', 'invalid-address', '0xValid...', ...);
} catch (error) {
  console.error(error.message);  // "Invalid Ethereum address format"
}
```

## Testing

Run the comprehensive test suite:

```bash
npm run test:token-history
```

Run the interactive demo:

```bash
npm run token-history:demo
```

## Advanced Usage

### Custom Event IDs

Each `OwnershipEvent` automatically generates a unique event ID based on the transfer data (similar to git commit hashes):

```javascript
const event = new OwnershipEvent(tokenId, from, to, timestamp, txHash, block);
console.log(`Event ID: ${event.id}`);  // e.g., "0000000059141cf6"
```

### Filtering Events

Combine query methods to filter events:

```javascript
// Get all tokens kushmanmb received from a specific address
const allEvents = tracker.getHistoryForOwner(kushmanmbAddress);
const receivedFromAddress = allEvents.filter(e => 
  e.to === kushmanmbAddress && e.from === specificAddress
);
```

### Time-based Queries

Filter events by timestamp:

```javascript
const allEvents = tracker.getHistoryForOwner();
const recentEvents = allEvents.filter(e => 
  e.timestamp > Date.now() / 1000 - 86400  // Last 24 hours
);
```

## Best Practices

1. **Consistent Tracking**: Record all transfers for a token to maintain accurate history
2. **Address Normalization**: Let the module handle address formatting
3. **Regular Backups**: Export history data periodically using `toJSON()`
4. **Error Handling**: Wrap operations in try-catch blocks
5. **Pagination**: Use the `limit` parameter in log functions for large histories

## Performance Considerations

- History is stored in memory - consider persistence for large datasets
- Address validation is performed on every operation
- Metadata caching is not implemented (future enhancement)
- Statistics are calculated on-demand

## Future Enhancements

Potential improvements for future versions:

- Blockchain integration for automatic transfer detection
- Database persistence for large-scale tracking
- Event indexing for faster queries
- Transfer verification against blockchain data
- Support for ERC-1155 multi-token standard
- Real-time event streaming
- Advanced filtering and sorting options

## Support

For issues, questions, or contributions:

- **GitHub**: [Kushmanmb/-Big-world-Bigger-ideas-](https://github.com/Kushmanmb/-Big-world-Bigger-ideas-)
- **Email**: kushmanmb@gmx.com
- **ENS**: kushmanmb.eth

## License

ISC License - See main repository for details.

---

**© 2024-2026 Matthew Brace (kushmanmb) | All Rights Reserved**
