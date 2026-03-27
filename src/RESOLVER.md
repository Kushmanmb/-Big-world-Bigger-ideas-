# Resolver Module Documentation

## Overview

The Resolver module provides functionality to manage address-to-resolver mappings for Ethereum addresses. It enables you to set, get, update, and remove resolver assignments for any Ethereum address, making it useful for ENS resolver management, address resolution services, and custom resolver configurations.

## Features

- ✅ **Address Validation**: Validates Ethereum addresses with or without 0x prefix
- ✅ **Resolver Management**: Set, get, update, and remove resolvers for addresses
- ✅ **Metadata Support**: Attach custom metadata to each resolver mapping
- ✅ **JSON Import/Export**: Easy data persistence and configuration management
- ✅ **Batch Operations**: Get all resolvers, count, and clear operations
- ✅ **Type-Safe**: Built-in validation and error handling

## Installation

This module is part of the `big-world-bigger-ideas` package:

```bash
npm install big-world-bigger-ideas
```

## Quick Start

```javascript
const Resolver = require('big-world-bigger-ideas/src/resolver');

// Create a resolver instance
const resolver = new Resolver('Main Resolver');

// Set a resolver for an address
resolver.setResolver(
  '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055',
  '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB',
  {
    network: 'Ethereum Mainnet',
    type: 'ENS Resolver'
  }
);

// Get resolver for an address
const info = resolver.getResolver('0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055');
console.log(info.resolverAddress); // 0x0540e1da908d032d2f74d50c06397cb5f2cbfddb
```

## API Reference

### Constructor

#### `new Resolver(name)`

Creates a new Resolver instance.

**Parameters:**
- `name` (string): Name for this resolver instance

**Example:**
```javascript
const resolver = new Resolver('Production Resolver');
```

### Methods

#### `setResolver(address, resolverAddress, metadata)`

Sets a resolver for an address.

**Parameters:**
- `address` (string): Ethereum address
- `resolverAddress` (string): Resolver's Ethereum address
- `metadata` (object, optional): Additional metadata

**Returns:** object - Resolver info

**Example:**
```javascript
resolver.setResolver(
  '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055',
  '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB',
  { network: 'Ethereum Mainnet', type: 'ENS Resolver' }
);
```

#### `getResolver(address)`

Gets the resolver for an address.

**Parameters:**
- `address` (string): Ethereum address

**Returns:** object - Resolver info

**Throws:** Error if address not found

**Example:**
```javascript
const info = resolver.getResolver('0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055');
console.log(info.resolverAddress);
console.log(info.metadata);
```

#### `hasResolver(address)`

Checks if an address has a resolver assigned.

**Parameters:**
- `address` (string): Ethereum address

**Returns:** boolean - True if resolver exists

**Example:**
```javascript
if (resolver.hasResolver('0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055')) {
  console.log('Resolver exists!');
}
```

#### `updateResolver(address, newResolverAddress, metadata)`

Updates a resolver's information.

**Parameters:**
- `address` (string): Ethereum address
- `newResolverAddress` (string): New resolver's address
- `metadata` (object, optional): Additional metadata

**Returns:** object - Updated resolver info

**Example:**
```javascript
resolver.updateResolver(
  '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055',
  '0x1111111111111111111111111111111111111111',
  { notes: 'Updated resolver' }
);
```

#### `removeResolver(address)`

Removes a resolver for an address.

**Parameters:**
- `address` (string): Ethereum address

**Returns:** boolean - True if removed

**Example:**
```javascript
resolver.removeResolver('0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055');
```

#### `getAllResolvers()`

Gets all resolver mappings.

**Returns:** array - Array of all resolver info objects

**Example:**
```javascript
const all = resolver.getAllResolvers();
all.forEach(r => {
  console.log(`${r.address} -> ${r.resolverAddress}`);
});
```

#### `getResolverCount()`

Gets the count of resolvers.

**Returns:** number - Number of resolver mappings

**Example:**
```javascript
console.log(`Total resolvers: ${resolver.getResolverCount()}`);
```

#### `clearAll()`

Clears all resolver assignments.

**Example:**
```javascript
resolver.clearAll();
```

#### `toJSON()`

Exports all resolver data as JSON.

**Returns:** object - JSON representation

**Example:**
```javascript
const json = resolver.toJSON();
console.log(JSON.stringify(json, null, 2));
```

#### `fromJSON(data)`

Imports resolver data from JSON.

**Parameters:**
- `data` (object): JSON data to import

**Example:**
```javascript
const data = {
  resolvers: [
    {
      address: '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055',
      resolverAddress: '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB'
    }
  ]
};
resolver.fromJSON(data);
```

## Configuration File

The resolver configuration is stored in `resolvers.json`:

```json
{
  "resolvers": [
    {
      "address": "0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055",
      "resolverAddress": "0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB",
      "metadata": {
        "network": "Ethereum Mainnet",
        "chainId": 1,
        "type": "Address Resolver",
        "setBy": "Manual Configuration",
        "notes": "Resolver assignment"
      },
      "setAt": "2026-02-25T16:43:00.000Z"
    }
  ],
  "lastUpdated": "2026-02-25T16:43:00.000Z",
  "version": "1.0.0"
}
```

## Usage Examples

### Example 1: ENS Resolver Management

```javascript
const Resolver = require('./src/resolver');

const resolver = new Resolver('ENS Resolver Manager');

// Set ENS resolver for an address
resolver.setResolver(
  '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055',
  '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB',
  {
    network: 'Ethereum Mainnet',
    type: 'ENS Public Resolver',
    ensName: 'example.eth'
  }
);

// Get resolver info
const info = resolver.getResolver('0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055');
console.log(`ENS Name: ${info.metadata.ensName}`);
console.log(`Resolver: ${info.resolverAddress}`);
```

### Example 2: Cross-Chain Resolvers

```javascript
const resolver = new Resolver('Multi-Chain Resolver');

// Ethereum resolver
resolver.setResolver(
  '0x1234567890123456789012345678901234567890',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  { network: 'Ethereum Mainnet', chainId: 1 }
);

// Polygon resolver
resolver.setResolver(
  '0x9876543210987654321098765432109876543210',
  '0x1111111111111111111111111111111111111111',
  { network: 'Polygon', chainId: 137 }
);

// List all resolvers
const all = resolver.getAllResolvers();
console.log(`Managing ${all.length} resolvers across chains`);
```

### Example 3: Configuration Management

```javascript
const fs = require('fs');
const Resolver = require('./src/resolver');

// Load from file
const config = JSON.parse(fs.readFileSync('resolvers.json', 'utf8'));
const resolver = new Resolver('Config Manager');
resolver.fromJSON(config);

// Add a new resolver
resolver.setResolver(
  '0x2222222222222222222222222222222222222222',
  '0x3333333333333333333333333333333333333333',
  { network: 'Arbitrum', chainId: 42161 }
);

// Save back to file
const updated = resolver.toJSON();
fs.writeFileSync('resolvers.json', JSON.stringify(updated, null, 2));
```

## Testing

Run the tests:

```bash
npm run test:resolver
```

Run the demo:

```bash
npm run resolver:demo
```

## Apply Configuration

To apply the resolver configuration from `resolvers.json`:

```bash
node apply-resolvers.js
```

This will:
1. Load resolvers from `resolvers.json`
2. Validate all addresses and configurations
3. Verify the resolver mappings
4. Display configuration summary

## Use Cases

- **ENS Resolver Management**: Manage ENS resolver assignments for addresses
- **Address Resolution Services**: Build custom address resolution systems
- **Cross-Chain Resolvers**: Track resolvers across multiple blockchain networks
- **Custom Resolver Configurations**: Define and manage custom resolver mappings
- **Resolver Migration**: Track resolver changes and updates over time

## Best Practices

1. **Always Validate**: Use `hasResolver()` before calling `getResolver()` to avoid errors
2. **Use Metadata**: Include relevant metadata (network, type, notes) for better tracking
3. **Regular Backups**: Export to JSON regularly using `toJSON()` for backups
4. **Consistent Format**: Use checksummed addresses consistently
5. **Error Handling**: Wrap resolver operations in try-catch blocks

## Related Modules

- **TokenManager**: Similar module for token-to-manager mappings
- **EthCallClient**: Ethereum RPC client with ENS support
- **AddressTracker**: Address tracking and management

## Support

For issues, questions, or contributions:
- **GitHub**: [kushmanmb-org/-Big-world-Bigger-ideas-](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-)
- **Email**: kushmanmb@gmx.com
- **ENS**: kushmanmb.eth

## License

ISC License - See LICENSE file for details

## Author

**Matthew Brace (kushmanmb)**
- GitHub: [@kushmanmb](https://github.com/kushmanmb)
- ENS: kushmanmb.eth
