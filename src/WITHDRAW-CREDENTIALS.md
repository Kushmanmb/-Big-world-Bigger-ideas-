# Withdrawal Credentials Module

The Withdrawal Credentials Module provides utilities for managing Ethereum staking withdrawal credentials and blockchain withdrawal addresses for the kushmanmb organization.

## Overview

This module helps configure and validate withdrawal credentials for:
- Ethereum Beacon Chain validator withdrawals
- Staking rewards collection
- Execution layer address management
- ENS name resolution for withdrawal addresses

## Features

- ✅ **Ethereum Address Validation** - Validates Ethereum addresses (with or without 0x prefix)
- ✅ **Withdrawal Credentials Management** - Handles both BLS (0x00) and Execution (0x01) credentials
- ✅ **Address Conversion** - Converts Ethereum addresses to withdrawal credentials format
- ✅ **Credential Validation** - Validates 32-byte withdrawal credentials
- ✅ **ENS Support** - Manages ENS names for withdrawal addresses
- ✅ **Configuration Export** - Exports to JSON and environment variable formats

## Installation

```bash
npm install big-world-bigger-ideas
```

## Usage

### Basic Usage

```javascript
const { WithdrawalCredentials, WITHDRAWAL_TYPES } = require('big-world-bigger-ideas');

// Create a new instance for kushmanmb
const creds = WithdrawalCredentials.createKushmanmbConfig();

// Set withdrawal address
creds.setWithdrawalAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');

// Display configuration
console.log(creds.formatConfiguration());
```

### Advanced Usage

```javascript
// Custom configuration
const creds = new WithdrawalCredentials({
  owner: 'kushmanmb',
  ensName: 'kushmanmb.eth',
  network: 'ethereum',
  withdrawalAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
});

// Convert address to withdrawal credentials
const credentials = creds.addressToWithdrawalCredentials(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
);
console.log(credentials);
// Output: 0x010000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0

// Extract address from credentials
const address = creds.credentialsToAddress(credentials);
console.log(address);
// Output: 0x742d35cc6634c0532925a3b844bc9e7595f0beb0

// Validate credentials
const validation = creds.validateWithdrawalCredentials(credentials);
console.log(validation);
// Output: { valid: true, type: 'EXECUTION', prefix: '0x01', credentials: '0x01...' }
```

### Export Configuration

```javascript
// Export to JSON
const json = creds.toJSON();
console.log(JSON.stringify(json, null, 2));

// Export to environment variables format
const env = creds.toEnvFormat();
console.log(env);
/*
Output:
# Withdrawal Credentials Configuration
WITHDRAWAL_OWNER=kushmanmb
WITHDRAWAL_ENS=kushmanmb.eth
WITHDRAWAL_NETWORK=ethereum
WITHDRAWAL_ADDRESS=0x742d35cc6634c0532925a3b844bc9e7595f0beb0
WITHDRAWAL_CREDENTIALS=0x010000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0
*/
```

## API Reference

### Class: WithdrawalCredentials

#### Constructor

```javascript
new WithdrawalCredentials(config)
```

**Parameters:**
- `config` (Object) - Configuration options
  - `owner` (String) - Owner identifier (default: 'kushmanmb')
  - `ensName` (String) - ENS name (default: 'kushmanmb.eth')
  - `withdrawalAddress` (String) - Ethereum withdrawal address (optional)
  - `network` (String) - Network name (default: 'ethereum')

#### Methods

##### validateAddress(address)
Validates an Ethereum address format.

**Parameters:**
- `address` (String) - Ethereum address to validate

**Returns:** `Boolean` - True if address is valid

##### validateWithdrawalCredentials(credentials)
Validates withdrawal credentials format and type.

**Parameters:**
- `credentials` (String) - 32-byte withdrawal credentials (64 hex chars + 0x prefix)

**Returns:** `Object` - Validation result
- `valid` (Boolean) - Whether credentials are valid
- `type` (String) - Type of credentials ('BLS', 'EXECUTION', or 'UNKNOWN')
- `prefix` (String) - Credential prefix (0x00 or 0x01)
- `credentials` (String) - Formatted credentials
- `error` (String) - Error message if invalid

##### setWithdrawalAddress(address)
Sets the withdrawal address after validation.

**Parameters:**
- `address` (String) - Ethereum address

**Throws:** Error if address is invalid

##### getWithdrawalAddress()
Gets the configured withdrawal address.

**Returns:** `String|null` - Withdrawal address or null

##### setENSName(ensName)
Sets the ENS name.

**Parameters:**
- `ensName` (String) - ENS name (must end with .eth)

**Throws:** Error if ENS name is invalid

##### getENSName()
Gets the configured ENS name.

**Returns:** `String` - ENS name

##### addressToWithdrawalCredentials(address)
Converts an Ethereum address to withdrawal credentials format.

**Parameters:**
- `address` (String) - Ethereum address

**Returns:** `String` - Withdrawal credentials (66 characters: 0x + 64 hex)

**Format:** `0x01` + 22 zeros + 40-char address = execution withdrawal credentials

##### credentialsToAddress(credentials)
Extracts Ethereum address from execution withdrawal credentials.

**Parameters:**
- `credentials` (String) - Withdrawal credentials

**Returns:** `String|null` - Ethereum address or null if not execution credentials

##### formatConfiguration()
Formats the configuration for display.

**Returns:** `String` - Formatted configuration text

##### toJSON()
Exports configuration as JSON object.

**Returns:** `Object` - Configuration object

##### toEnvFormat()
Exports configuration as environment variables.

**Returns:** `String` - Environment variables format

#### Static Methods

##### WithdrawalCredentials.createKushmanmbConfig()
Creates a pre-configured instance for kushmanmb.

**Returns:** `WithdrawalCredentials` - Configured instance

### Constants: WITHDRAWAL_TYPES

```javascript
{
  BLS: '0x00',        // BLS withdrawal credentials (legacy)
  EXECUTION: '0x01'   // Execution layer withdrawal credentials (current)
}
```

## Withdrawal Credential Types

### BLS Credentials (0x00)
- **Prefix:** `0x00`
- **Legacy format** used before Ethereum Shanghai upgrade
- Cannot directly withdraw to an Ethereum address
- Requires credential update to execution credentials

### Execution Credentials (0x01)
- **Prefix:** `0x01`
- **Current format** for Ethereum staking
- Allows direct withdrawals to Ethereum addresses
- Format: `0x01` + 11 zero bytes + 20-byte Ethereum address
- Can be updated from BLS credentials

## Examples

### Ethereum Staking Setup

```javascript
const { WithdrawalCredentials } = require('big-world-bigger-ideas');

// Setup for staking
const staking = WithdrawalCredentials.createKushmanmbConfig();
staking.setWithdrawalAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');

// Generate credentials for validator setup
const credentials = staking.addressToWithdrawalCredentials(
  staking.getWithdrawalAddress()
);

console.log('Use these credentials when setting up your validator:');
console.log(credentials);
```

### Credential Validation

```javascript
const { WithdrawalCredentials } = require('big-world-bigger-ideas');

const creds = new WithdrawalCredentials();

// Validate execution credentials
const execCreds = '0x010000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0';
const validation = creds.validateWithdrawalCredentials(execCreds);

if (validation.valid && validation.type === 'EXECUTION') {
  const address = creds.credentialsToAddress(execCreds);
  console.log('Withdrawal address:', address);
}
```

## Configuration Files

### .env Configuration

Add to your `.env` file:

```bash
WITHDRAWAL_OWNER=kushmanmb
WITHDRAWAL_ENS=kushmanmb.eth
WITHDRAWAL_NETWORK=ethereum
WITHDRAWAL_ADDRESS=your_ethereum_address_here
```

### GitHub Funding

The module integrates with GitHub FUNDING.yml:

```yaml
github: kushmanmb
custom: ['https://kushmanmb.org', 'https://app.ens.domains/name/kushmanmb.eth']

# Cryptocurrency Withdrawal Credentials for kushmanmb:
# ENS: kushmanmb.eth
# Organization: kushmanmb-org
```

## Testing

Run the test suite:

```bash
npm run test:withdraw-credentials
```

See example usage:

```bash
npm run withdraw-credentials:demo
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never commit private keys** - Only store withdrawal addresses, never private keys
2. **Validate all addresses** - Always validate addresses before using them
3. **Use ENS for transparency** - ENS names provide verifiable ownership
4. **Backup credentials** - Keep secure backups of withdrawal credentials
5. **Test on testnet first** - Always test staking setup on testnet before mainnet

## Related Resources

- **Ethereum Staking Guide:** https://ethereum.org/en/staking/
- **Beacon Chain Explorer:** https://beaconcha.in
- **ENS Domains:** https://ens.domains
- **Ethereum Documentation:** https://ethereum.org/en/developers/docs/

## Owner Information

- **Owner:** kushmanmb
- **ENS:** kushmanmb.eth
- **Organization:** kushmanmb-org
- **Email:** kushmanmb@gmx.com

## License

ISC License - See LICENSE file for details

## Contributing

Contributions welcome! Please see the main repository README for guidelines.

## Support

- **Issues:** https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/issues
- **Email:** kushmanmb@gmx.com
- **ENS:** kushmanmb.eth
