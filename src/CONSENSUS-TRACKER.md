# 🔗 Consensus Tracker Module

## Overview

The Consensus Tracker module provides comprehensive tracking and analysis of consensus mechanisms (Proof of Work and Proof of Stake) across multiple blockchain networks. This module is designed to help developers and researchers understand the different consensus algorithms used by various blockchains.

## Features

- 🔍 **Multi-Chain Support**: Track consensus mechanisms across Bitcoin, Ethereum, Base, Litecoin, Polygon, and more
- ⚡ **PoW/PoS Classification**: Easily identify which networks use Proof of Work vs Proof of Stake
- 📊 **Network Comparison**: Compare consensus mechanisms, block times, and energy efficiency
- 📈 **Statistics**: Get comprehensive statistics about tracked networks
- 🌐 **Network Details**: Access detailed information about each blockchain's consensus mechanism
- 💾 **JSON Export**: Export all network data for analysis or integration

## Installation

The module is included in the repository. No additional installation is required.

```javascript
const { ConsensusTracker, CONSENSUS_TYPES } = require('./src/consensus-tracker.js');
```

## Quick Start

```javascript
const { ConsensusTracker } = require('./src/consensus-tracker.js');

// Create a consensus tracker
const tracker = new ConsensusTracker();

// Get information about a specific network
const bitcoin = tracker.getNetworkInfo('bitcoin');
console.log(`${bitcoin.name} uses ${bitcoin.consensus}`);

// Get all Proof of Work networks
const powNetworks = tracker.getPowNetworks();
console.log(`PoW Networks: ${powNetworks.map(n => n.name).join(', ')}`);

// Get all Proof of Stake networks
const posNetworks = tracker.getPosNetworks();
console.log(`PoS Networks: ${posNetworks.map(n => n.name).join(', ')}`);

// Compare two networks
const comparison = tracker.compareNetworks('bitcoin', 'ethereum');
console.log(`Consensus: ${comparison.consensus.join(' vs ')}`);
```

## Supported Networks

### Proof of Work (PoW) Networks

1. **Bitcoin** - The original PoW blockchain
   - Algorithm: SHA-256
   - Block Time: 600 seconds (10 minutes)
   - Launched: 2009-01-03

2. **Litecoin** - "Silver to Bitcoin's Gold"
   - Algorithm: Scrypt
   - Block Time: 150 seconds (2.5 minutes)
   - Launched: 2011-10-13

### Proof of Stake (PoS) Networks

1. **Ethereum** - Transitioned to PoS in 2022
   - Algorithm: Gasper (PoS)
   - Block Time: 12 seconds
   - Merge Date: 2022-09-15
   - Minimum Stake: 32 ETH

2. **Ethereum Beacon Chain** - Ethereum's consensus layer
   - Slots per Epoch: 32
   - Epoch Duration: 384 seconds (6.4 minutes)
   - Minimum Stake: 32 ETH per validator

3. **Base** - Layer 2 built on Ethereum
   - Type: Optimistic Rollup
   - Block Time: 2 seconds
   - Parent Chain: Ethereum

4. **Polygon** - Ethereum-compatible sidechain
   - Algorithm: PoS (Heimdall + Bor)
   - Block Time: 2 seconds
   - Validator Count: 100

## API Reference

### ConsensusTracker Class

#### Constructor

```javascript
const tracker = new ConsensusTracker();
```

Creates a new Consensus Tracker instance.

#### Methods

##### `getNetworkInfo(networkName)`

Gets detailed information about a specific blockchain network.

**Parameters:**
- `networkName` (string) - The network name (e.g., 'bitcoin', 'ethereum')

**Returns:** Object with network information

**Example:**
```javascript
const ethereum = tracker.getNetworkInfo('ethereum');
// Returns: {
//   name: 'Ethereum',
//   chainId: 1,
//   consensus: 'Proof of Stake',
//   symbol: 'ETH',
//   blockTime: 12,
//   ...
// }
```

##### `getPowNetworks()`

Gets all networks using Proof of Work.

**Returns:** Array of PoW networks

**Example:**
```javascript
const powNetworks = tracker.getPowNetworks();
// Returns: [{ name: 'Bitcoin', ... }, { name: 'Litecoin', ... }]
```

##### `getPosNetworks()`

Gets all networks using Proof of Stake.

**Returns:** Array of PoS networks

**Example:**
```javascript
const posNetworks = tracker.getPosNetworks();
// Returns: [{ name: 'Ethereum', ... }, { name: 'Base', ... }, ...]
```

##### `getAllNetworks()`

Gets all tracked networks.

**Returns:** Array of all networks

**Example:**
```javascript
const allNetworks = tracker.getAllNetworks();
```

##### `getConsensusStatistics()`

Gets comprehensive statistics about tracked networks.

**Returns:** Object with statistics

**Example:**
```javascript
const stats = tracker.getConsensusStatistics();
// Returns: {
//   totalNetworks: 6,
//   byConsensus: { 'Proof of Work': 2, 'Proof of Stake': 4 },
//   averageBlockTime: 128,
//   energyEfficient: 4,
//   energyIntensive: 2
// }
```

##### `compareNetworks(network1, network2)`

Compares two networks by their consensus mechanisms.

**Parameters:**
- `network1` (string) - First network name
- `network2` (string) - Second network name

**Returns:** Object with comparison details

**Example:**
```javascript
const comparison = tracker.compareNetworks('bitcoin', 'ethereum');
// Returns: {
//   networks: ['Bitcoin', 'Ethereum'],
//   consensus: ['Proof of Work', 'Proof of Stake'],
//   sameConsensus: false,
//   blockTime: { Bitcoin: 600, Ethereum: 12, faster: 'Ethereum' },
//   ...
// }
```

##### `isProofOfWork(networkName)`

Checks if a network uses Proof of Work.

**Parameters:**
- `networkName` (string) - The network name

**Returns:** Boolean

**Example:**
```javascript
tracker.isProofOfWork('bitcoin');  // true
tracker.isProofOfWork('ethereum'); // false
```

##### `isProofOfStake(networkName)`

Checks if a network uses Proof of Stake.

**Parameters:**
- `networkName` (string) - The network name

**Returns:** Boolean

**Example:**
```javascript
tracker.isProofOfStake('ethereum'); // true
tracker.isProofOfStake('bitcoin');  // false
```

##### `formatNetworkInfo(networkName)`

Formats network information for display.

**Parameters:**
- `networkName` (string) - The network name

**Returns:** Formatted string

**Example:**
```javascript
console.log(tracker.formatNetworkInfo('bitcoin'));
// Outputs formatted network information
```

##### `getConsensusSummary()`

Gets a formatted summary of all consensus mechanisms.

**Returns:** Formatted string

**Example:**
```javascript
console.log(tracker.getConsensusSummary());
// Outputs summary of all tracked networks
```

##### `toJSON()`

Exports all network data as JSON.

**Returns:** JSON string

**Example:**
```javascript
const json = tracker.toJSON();
const data = JSON.parse(json);
```

## Network Details Structure

Each network object contains the following information:

```javascript
{
  name: 'Network Name',
  chainId: 1 (or null for non-EVM chains),
  consensus: 'Proof of Work' or 'Proof of Stake',
  symbol: 'TOKEN',
  blockTime: 12, // seconds
  algorithm: 'SHA-256',
  launched: '2009-01-03',
  explorerUrl: 'https://...',
  details: {
    // Network-specific details
  }
}
```

## Testing

Run the consensus tracker tests:

```bash
npm run test:consensus-tracker
```

Expected output:
```
📊 Test Summary:
✓ Passed: 64
✗ Failed: 0
Total: 64

🎉 All tests passed!
```

## Demo

See the consensus tracker in action:

```bash
npm run consensus-tracker:demo
```

This will display:
- Consensus summary across all networks
- Detailed information for each network
- Network comparisons
- PoW and PoS network lists
- Statistics and energy profiles

## Use Cases

1. **Blockchain Research**: Compare consensus mechanisms across different blockchains
2. **Education**: Learn about different consensus algorithms and their properties
3. **Development**: Choose appropriate blockchain for your application based on consensus
4. **Analytics**: Generate reports on blockchain consensus mechanisms
5. **Integration**: Integrate consensus data into dashboards or applications

## Energy Efficiency

The module tracks energy profiles:

- **Energy Intensive**: Networks using Proof of Work (Bitcoin, Litecoin)
- **Energy Efficient**: Networks using Proof of Stake (Ethereum, Base, Polygon)

```javascript
const stats = tracker.getConsensusStatistics();
console.log(`Energy Efficient Networks: ${stats.energyEfficient}`);
console.log(`Energy Intensive Networks: ${stats.energyIntensive}`);
```

## Block Time Comparison

Compare block times across networks:

```javascript
const stats = tracker.getConsensusStatistics();
console.log(`Average Block Time: ${stats.averageBlockTime} seconds`);

const comparison = tracker.compareNetworks('bitcoin', 'base');
console.log(`Block Time Difference: ${comparison.comparison.blockTimeDifference}s`);
```

## Adding New Networks

To add a new network, modify the `BLOCKCHAIN_NETWORKS` object in `consensus-tracker.js`:

```javascript
const BLOCKCHAIN_NETWORKS = {
  // ... existing networks
  
  mynewchain: {
    name: 'My New Chain',
    chainId: 12345,
    consensus: CONSENSUS_TYPES.POS,
    symbol: 'MNC',
    blockTime: 5,
    algorithm: 'Custom PoS',
    launched: '2024-01-01',
    explorerUrl: 'https://explorer.mynewchain.com',
    details: {
      // Network-specific details
    }
  }
};
```

## Error Handling

The module throws descriptive errors for invalid operations:

```javascript
try {
  tracker.getNetworkInfo('invalid_network');
} catch (error) {
  console.error(error.message);
  // "Network 'invalid_network' not found. Available networks: bitcoin, ethereum, ..."
}
```

## License

ISC License - See repository root for details

## Author

**Matthew Brace (kushmanmb)**  
Email: mattbrace92@gmail.com  
Website: [kushmanmb.org](https://kushmanmb.org)  
ENS: kushmanmb.base.eth

## Related Modules

- **bitcoin-mining.js** - Bitcoin mining data and statistics
- **erc721.js** - ERC-721 NFT token interaction
- **token-history.js** - Token ownership history tracking
- **address-tracker.js** - Crypto address monitoring

---

**Mission Statement:** *Empowering crypto clarity, fueled by innovation and style*
