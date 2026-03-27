# Token Manager Module

A comprehensive module for managing token address to manager address mappings in blockchain applications.

## 📖 Overview

The Token Manager module provides a robust system for assigning and managing manager addresses for token contracts. It enables applications to track which addresses are authorized to manage specific tokens, with features for validation, metadata storage, and data persistence.

## ✨ Features

- **Manager Assignment**: Assign manager addresses to token contracts
- **Address Validation**: Automatic Ethereum address validation and normalization
- **Metadata Storage**: Store additional information with each manager assignment
- **Case Insensitivity**: Address lookups work regardless of case
- **Data Persistence**: Export/import manager data as JSON
- **Comprehensive API**: Full CRUD operations for manager assignments
- **Error Handling**: Robust validation and error reporting

## 🚀 Installation

This module is part of the Big World Bigger Ideas project and is available in the `src/` directory.

```javascript
const TokenManager = require('./src/token-manager');
```

## 📋 API Reference

### Constructor

#### `new TokenManager(name)`

Creates a new Token Manager instance.

**Parameters:**
- `name` (string, optional): Name for the manager instance. Default: "Default Token Manager"

**Example:**
```javascript
const manager = new TokenManager('Production Manager');
```

### Core Methods

#### `setManager(tokenAddress, managerAddress, metadata)`

Assigns a manager to a token address.

**Parameters:**
- `tokenAddress` (string): The token contract address
- `managerAddress` (string): The manager's address
- `metadata` (object, optional): Additional metadata

**Returns:** Object containing manager info

**Example:**
```javascript
const result = manager.setManager(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '0x6fb9e80dDd0f5DC99D7cB38b07e8b298A57bF253',
  {
    tokenName: 'USDC',
    network: 'Ethereum',
    notes: 'Primary stablecoin manager'
  }
);
```

#### `getManager(tokenAddress)`

Retrieves the manager for a token address.

**Parameters:**
- `tokenAddress` (string): The token contract address

**Returns:** Object containing manager info

**Throws:** Error if no manager found

**Example:**
```javascript
const managerInfo = manager.getManager('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
console.log(managerInfo.managerAddress);
console.log(managerInfo.metadata);
```

#### `hasManager(tokenAddress)`

Checks if a token has a manager assigned.

**Parameters:**
- `tokenAddress` (string): The token contract address

**Returns:** Boolean

**Example:**
```javascript
if (manager.hasManager('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')) {
  console.log('Manager exists');
}
```

#### `updateManager(tokenAddress, newManagerAddress, metadata)`

Updates the manager for a token address.

**Parameters:**
- `tokenAddress` (string): The token contract address
- `newManagerAddress` (string): The new manager's address
- `metadata` (object, optional): Additional metadata to merge

**Returns:** Object containing updated manager info

**Example:**
```javascript
const updated = manager.updateManager(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '0x1234567890123456789012345678901234567890',
  { version: 'v2' }
);
```

#### `removeManager(tokenAddress)`

Removes the manager assignment for a token.

**Parameters:**
- `tokenAddress` (string): The token contract address

**Returns:** Boolean (true on success)

**Throws:** Error if manager not found

**Example:**
```javascript
manager.removeManager('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
```

#### `getAllManagers()`

Gets all manager assignments.

**Returns:** Array of manager info objects

**Example:**
```javascript
const allManagers = manager.getAllManagers();
allManagers.forEach(m => {
  console.log(`${m.tokenAddress} -> ${m.managerAddress}`);
});
```

#### `getManagerCount()`

Gets the count of managed tokens.

**Returns:** Number

**Example:**
```javascript
console.log(`Managing ${manager.getManagerCount()} tokens`);
```

### Utility Methods

#### `clearAll()`

Removes all manager assignments.

**Example:**
```javascript
manager.clearAll();
```

#### `toJSON()`

Exports all manager data as JSON.

**Returns:** Object with all manager data

**Example:**
```javascript
const data = manager.toJSON();
console.log(JSON.stringify(data, null, 2));
```

#### `fromJSON(data)`

Imports manager data from JSON.

**Parameters:**
- `data` (object): JSON data to import

**Example:**
```javascript
const data = {
  managers: [
    {
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      managerAddress: '0x6fb9e80dDd0f5DC99D7cB38b07e8b298A57bF253',
      metadata: { tokenName: 'USDC' }
    }
  ]
};
manager.fromJSON(data);
```

## 💡 Usage Examples

### Basic Usage

```javascript
const TokenManager = require('./src/token-manager');

// Create manager instance
const manager = new TokenManager('My Token Manager');

// Set manager for USDC
manager.setManager(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '0x6fb9e80dDd0f5DC99D7cB38b07e8b298A57bF253'
);

// Get manager
const info = manager.getManager('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
console.log(info.managerAddress);
```

### With Metadata

```javascript
manager.setManager(
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  '0x1234567890123456789012345678901234567890',
  {
    tokenName: 'Tether USD',
    tokenSymbol: 'USDT',
    network: 'Ethereum',
    chainId: 1,
    managerRole: 'Treasury'
  }
);
```

### Update Manager

```javascript
// Update to new manager
manager.updateManager(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '0xNewManagerAddress123456789012345678901234567',
  { notes: 'Updated due to security review' }
);
```

### Export/Import

```javascript
// Export
const backup = manager.toJSON();
fs.writeFileSync('managers-backup.json', JSON.stringify(backup, null, 2));

// Import
const restored = new TokenManager('Restored Manager');
const data = JSON.parse(fs.readFileSync('managers-backup.json'));
restored.fromJSON(data);
```

### Batch Operations

```javascript
const tokens = [
  { token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', manager: '0x123...', name: 'USDC' },
  { token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', manager: '0x456...', name: 'USDT' },
  { token: '0x6B175474E89094C44Da98b954EedeAC495271d0F', manager: '0x789...', name: 'DAI' }
];

tokens.forEach(t => {
  manager.setManager(t.token, t.manager, { tokenName: t.name });
});

console.log(`Configured ${manager.getManagerCount()} tokens`);
```

## 🔒 Address Validation

The module automatically validates and normalizes Ethereum addresses:

- ✅ Accepts addresses with or without `0x` prefix
- ✅ Case-insensitive address matching
- ✅ Validates 40-character hexadecimal format
- ✅ Normalizes all addresses to lowercase with `0x` prefix

**Valid Formats:**
```javascript
manager.setManager('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0x123...');
manager.setManager('A0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0x123...');
manager.setManager('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0x123...');
```

All formats above are treated as the same address.

## 🧪 Testing

Run the test suite:

```bash
npm run test:token-manager
```

Or directly:

```bash
node src/token-manager.test.js
```

Run the example demo:

```bash
node src/token-manager-example.js
```

## 🎯 Use Cases

### 1. Token Administration

Track which addresses are authorized to manage specific token contracts:

```javascript
manager.setManager(tokenAddress, adminAddress, {
  role: 'Admin',
  permissions: ['mint', 'burn', 'pause']
});
```

### 2. Multi-Signature Management

Assign multi-sig wallets as token managers:

```javascript
manager.setManager(tokenAddress, multiSigAddress, {
  type: 'Multi-Signature',
  requiredSignatures: 3,
  totalSigners: 5
});
```

### 3. Governance Integration

Link tokens to their governance contracts:

```javascript
manager.setManager(tokenAddress, governanceAddress, {
  type: 'Governance',
  votingPeriod: '7 days',
  quorum: '10%'
});
```

### 4. Treasury Management

Track treasury addresses for token protocols:

```javascript
manager.setManager(tokenAddress, treasuryAddress, {
  type: 'Treasury',
  managed: 'Protocol Funds',
  auditDate: '2026-02-01'
});
```

## ⚠️ Error Handling

The module provides detailed error messages:

```javascript
try {
  manager.setManager('invalid-address', '0x123...');
} catch (error) {
  console.error(error.message); // "Invalid Ethereum address format"
}

try {
  manager.getManager('0xNonExistentToken...');
} catch (error) {
  console.error(error.message); // "No manager found for token address..."
}
```

## 📊 Data Structure

Manager info objects contain:

```javascript
{
  tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  managerAddress: '0x6fb9e80ddd0f5dc99d7cb38b07e8b298a57bf253',
  setAt: '2026-02-25T16:00:00.000Z',
  updatedAt: '2026-02-25T16:00:00.000Z',
  metadata: {
    tokenName: 'USDC',
    tokenSymbol: 'USDC',
    network: 'Ethereum',
    // ... custom fields
  }
}
```

## 🔗 Related Modules

- **[erc20.js](./ERC20.md)** - ERC-20 token interaction utilities
- **[erc721.js](./ERC721.md)** - ERC-721 NFT interaction utilities
- **[blockchain-council.js](./BLOCKCHAIN-COUNCIL.md)** - Governance and council management
- **[address-tracker.js](./ADDRESS-TRACKER.md)** - Multi-chain address tracking

## 📝 Notes

- Manager assignments are stored in-memory using JavaScript `Map`
- Use `toJSON()` and `fromJSON()` for persistence
- All addresses are normalized to lowercase with `0x` prefix
- The module does not interact with the blockchain directly
- It's recommended to back up manager data regularly

## 🤝 Contributing

This module follows the project's coding standards:
- CommonJS module system (`require`/`module.exports`)
- Comprehensive JSDoc comments
- Full test coverage
- Example usage files

## 📄 License

ISC License - Part of the Big World Bigger Ideas project

## 👤 Author

**Matthew Brace (kushmanmb)**
- Email: kushmanmb@gmx.com
- Website: https://kushmanmb.org
- ENS: kushmanmb.eth

---

**Last Updated:** 2026-02-25
