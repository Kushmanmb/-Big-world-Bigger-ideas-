# Contract ABI Fetcher Module

This module provides functionality to fetch contract ABIs (Application Binary Interfaces) from the Etherscan API for Ethereum and other EVM-compatible blockchains.

## Features

- **Etherscan API Integration**: Fetch contract ABIs directly from Etherscan
- **Address Validation**: Built-in Ethereum address validation
- **Multi-Chain Support**: Works with Ethereum, Base, Polygon, and other chains
- **Caching**: Automatic ABI caching for performance
- **Signature Extraction**: Extract function and event signatures from ABIs
- **Error Handling**: Comprehensive error handling for API failures

## Installation

The module is included in the project. No additional dependencies are required beyond Node.js built-in modules (`https`).

## Usage

### Basic Example

```javascript
const ContractABIFetcher = require('./src/contract-abi');

// Create a fetcher instance with API key and chain ID
const apiKey = 'YOUR_ETHERSCAN_API_KEY';
const chainId = 1; // Ethereum Mainnet
const fetcher = new ContractABIFetcher(apiKey, chainId);

// Fetch contract ABI
const contractAddress = '0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43';
const result = await fetcher.getContractABI(contractAddress);

console.log('ABI fetched:', result.abi);
console.log('Functions:', result.abi.filter(item => item.type === 'function').length);
console.log('Events:', result.abi.filter(item => item.type === 'event').length);
```

### Running the Demo

Run the included example to see the Contract ABI Fetcher in action:

```bash
npm run contract-abi:demo
```

### Running Tests

```bash
npm run test:contract-abi
```

## API Reference

### Constructor

#### `new ContractABIFetcher(apiKey, chainId)`

Creates a new Contract ABI Fetcher instance.

**Parameters:**
- `apiKey` (string, optional): Your Etherscan API key. Default: `null`
- `chainId` (number, optional): The blockchain chain ID. Default: `1` (Ethereum Mainnet)

**Example:**
```javascript
const fetcher = new ContractABIFetcher('YOUR_API_KEY', 1);
```

### Methods

#### `getContractABI(contractAddress)`

Fetches the ABI for a contract from Etherscan.

**Parameters:**
- `contractAddress` (string): The contract address (with or without 0x prefix)

**Returns:** `Promise<object>` - Object containing:
- `address` (string): Validated contract address
- `chainId` (number): Chain ID used for the request
- `abi` (array): The contract ABI
- `status` (string): API response status
- `message` (string): API response message
- `timestamp` (number): Timestamp of the fetch

**Throws:** Error if API key is not set, address is invalid, or API request fails

**Example:**
```javascript
const result = await fetcher.getContractABI('0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43');
console.log('ABI:', result.abi);
```

#### `validateAddress(address)`

Validates an Ethereum address format.

**Parameters:**
- `address` (string): The address to validate

**Returns:** `string` - Validated address with 0x prefix

**Throws:** Error if address format is invalid

**Example:**
```javascript
const validAddress = fetcher.validateAddress('a9d1e08c7793af67e9d92fe308d5697fb81d3e43');
// Returns: '0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43'
```

#### `clearCache()`

Clears the internal cache of fetched ABIs.

**Example:**
```javascript
fetcher.clearCache();
```

#### `getAPIInfo()`

Returns information about the API configuration.

**Returns:** `object` containing:
- `baseUrl` (string): API base URL
- `chainId` (number): Chain ID
- `hasApiKey` (boolean): Whether API key is set

**Example:**
```javascript
const info = fetcher.getAPIInfo();
console.log(info);
// { baseUrl: 'api.etherscan.io', chainId: 1, hasApiKey: true }
```

### Static Methods

#### `ContractABIFetcher.extractFunctionSignatures(abi)`

Extracts function signatures from a contract ABI.

**Parameters:**
- `abi` (array): The contract ABI

**Returns:** `array` - Array of function signature objects containing:
- `name` (string): Function name
- `signature` (string): Full function signature
- `stateMutability` (string): State mutability (view, pure, nonpayable, payable)
- `type` (string): Always 'function'

**Example:**
```javascript
const functions = ContractABIFetcher.extractFunctionSignatures(abi);
functions.forEach(func => {
  console.log(`${func.signature} [${func.stateMutability}]`);
});
```

#### `ContractABIFetcher.extractEventSignatures(abi)`

Extracts event signatures from a contract ABI.

**Parameters:**
- `abi` (array): The contract ABI

**Returns:** `array` - Array of event signature objects containing:
- `name` (string): Event name
- `signature` (string): Full event signature
- `type` (string): Always 'event'

**Example:**
```javascript
const events = ContractABIFetcher.extractEventSignatures(abi);
events.forEach(event => {
  console.log(event.signature);
});
```

## Chain Support

The module automatically selects the correct API endpoint based on the chain ID. Supported networks include:

### Ethereum Networks
```javascript
// Ethereum Mainnet
const fetcher = new ContractABIFetcher(apiKey, 1);

// Goerli Testnet (⚠️ DEPRECATED - Network sunset in 2024, use Sepolia instead)
const fetcher = new ContractABIFetcher(apiKey, 5);

// Sepolia Testnet (Recommended for testing)
const fetcher = new ContractABIFetcher(apiKey, 11155111);
```

### Layer 2 Networks
```javascript
// Base Mainnet
const fetcher = new ContractABIFetcher(apiKey, 8453);

// Base Goerli Testnet (⚠️ DEPRECATED - Use Base Sepolia instead)
const fetcher = new ContractABIFetcher(apiKey, 84531);

// Optimism Mainnet
const fetcher = new ContractABIFetcher(apiKey, 10);

// Optimism Goerli Testnet (⚠️ DEPRECATED - Use Optimism Sepolia instead)
const fetcher = new ContractABIFetcher(apiKey, 420);

// Arbitrum One
const fetcher = new ContractABIFetcher(apiKey, 42161);

// Arbitrum Goerli (⚠️ DEPRECATED - Use Arbitrum Sepolia instead)
const fetcher = new ContractABIFetcher(apiKey, 421613);
```

### Other EVM Networks
```javascript
// Polygon Mainnet
const fetcher = new ContractABIFetcher(apiKey, 137);

// Polygon Mumbai Testnet
const fetcher = new ContractABIFetcher(apiKey, 80001);

// BNB Smart Chain (BSC) Mainnet
const fetcher = new ContractABIFetcher(apiKey, 56);

// BSC Testnet
const fetcher = new ContractABIFetcher(apiKey, 97);

// Avalanche C-Chain
const fetcher = new ContractABIFetcher(apiKey, 43114);

// Avalanche Fuji Testnet
const fetcher = new ContractABIFetcher(apiKey, 43113);

// Fantom Opera
const fetcher = new ContractABIFetcher(apiKey, 250);

// Fantom Testnet
const fetcher = new ContractABIFetcher(apiKey, 4002);
```

### Supported API Endpoints

The module automatically maps chain IDs to their respective block explorer APIs:

| Chain ID | Network | API Endpoint | Status |
|----------|---------|--------------|--------|
| 1 | Ethereum Mainnet | api.etherscan.io | ✅ Active |
| 5 | Goerli Testnet | api-goerli.etherscan.io | ⚠️ Deprecated |
| 11155111 | Sepolia Testnet | api-sepolia.etherscan.io | ✅ Active |
| 10 | Optimism | api-optimistic.etherscan.io | ✅ Active |
| 420 | Optimism Goerli | api-goerli-optimistic.etherscan.io | ⚠️ Deprecated |
| 56 | BSC Mainnet | api.bscscan.com | ✅ Active |
| 97 | BSC Testnet | api-testnet.bscscan.com | ✅ Active |
| 137 | Polygon Mainnet | api.polygonscan.com | ✅ Active |
| 80001 | Mumbai Testnet | api-testnet.polygonscan.com | ✅ Active |
| 42161 | Arbitrum One | api.arbiscan.io | ✅ Active |
| 421613 | Arbitrum Goerli | api-goerli.arbiscan.io | ⚠️ Deprecated |
| 43114 | Avalanche C-Chain | api.snowtrace.io | ✅ Active |
| 43113 | Avalanche Fuji | api-testnet.snowtrace.io | ✅ Active |
| 250 | Fantom Opera | api.ftmscan.com | ✅ Active |
| 4002 | Fantom Testnet | api-testnet.ftmscan.com | ✅ Active |
| 8453 | Base Mainnet | api.basescan.org | ✅ Active |
| 84531 | Base Goerli | api-goerli.basescan.org | ⚠️ Deprecated |

**Notes:** 
- For unknown chain IDs, the module defaults to `api.etherscan.io`
- ⚠️ Deprecated networks (Goerli-based) were sunset in 2024. Support is maintained for backwards compatibility, but new projects should use Sepolia-based testnets instead

## Caching

The module automatically caches fetched ABIs to improve performance and reduce API calls. The cache key is based on the chain ID and contract address.

```javascript
// First call fetches from API
const result1 = await fetcher.getContractABI(address);

// Second call returns cached result
const result2 = await fetcher.getContractABI(address);

// Clear cache if needed
fetcher.clearCache();
```

## Error Handling

The module provides comprehensive error handling:

```javascript
try {
  const result = await fetcher.getContractABI(address);
  console.log('Success:', result);
} catch (error) {
  if (error.message.includes('API key is required')) {
    console.error('Please provide a valid API key');
  } else if (error.message.includes('Invalid Ethereum address')) {
    console.error('Invalid address format');
  } else if (error.message.includes('API request failed')) {
    console.error('Network or API error');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## Getting an API Key

To use this module, you need an Etherscan API key:

1. Visit [Etherscan.io](https://etherscan.io/)
2. Create an account or log in
3. Navigate to API-KEYs section
4. Create a new API key
5. Use the key in your application

**Free Tier Limits:**
- Up to 5 requests/second
- 100,000 requests/day

## Example: Full Workflow

```javascript
const ContractABIFetcher = require('./src/contract-abi');

async function analyzeContract() {
  // Initialize fetcher
  const fetcher = new ContractABIFetcher('YOUR_API_KEY', 1);
  
  // Fetch ABI
  const contractAddress = '0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43';
  const result = await fetcher.getContractABI(contractAddress);
  
  // Extract signatures
  const functions = ContractABIFetcher.extractFunctionSignatures(result.abi);
  const events = ContractABIFetcher.extractEventSignatures(result.abi);
  
  // Display information
  console.log(`Contract: ${result.address}`);
  console.log(`Chain ID: ${result.chainId}`);
  console.log(`Total Functions: ${functions.length}`);
  console.log(`Total Events: ${events.length}`);
  
  // List read-only functions
  const readFunctions = functions.filter(f => f.stateMutability === 'view' || f.stateMutability === 'pure');
  console.log('\nRead-only Functions:');
  readFunctions.forEach(func => console.log(`  - ${func.signature}`));
  
  // List write functions
  const writeFunctions = functions.filter(f => f.stateMutability !== 'view' && f.stateMutability !== 'pure');
  console.log('\nWrite Functions:');
  writeFunctions.forEach(func => console.log(`  - ${func.signature}`));
  
  // List events
  console.log('\nEvents:');
  events.forEach(event => console.log(`  - ${event.signature}`));
}

analyzeContract().catch(console.error);
```

## Testing

The module includes a comprehensive test suite:

```bash
npm run test:contract-abi
```

Test coverage includes:
- Constructor initialization
- Address validation (valid and invalid cases)
- API key requirements
- Function signature extraction
- Event signature extraction
- Cache management
- API info retrieval

## Security Considerations

⚠️ **Important Security Notes:**

1. **API Key Protection**: Never commit API keys to version control. Use environment variables or configuration files.

2. **Rate Limiting**: Respect Etherscan's rate limits to avoid being blocked.

3. **Address Validation**: Always validate addresses before making API calls.

4. **Error Handling**: Implement proper error handling to avoid exposing sensitive information.

5. **Cache Security**: Be aware that cached data may become stale. Clear cache when needed.

## Related Modules

- **ERC-721 Fetcher** (`src/erc721.js`): Fetch NFT token information
- **Wallet Module** (`src/wallet.js`): Secure wallet encryption
- **Metadata Module** (`src/metadata.js`): Package metadata management

## License

ISC

## Author

Matthew Brace (kushmanmb)
- Email: mattbrace92@gmail.com
- Website: https://kushmanmb.org
- ENS: kushmanmb.base.eth

---

**© 2024-2026 Matthew Brace (kushmanmb) | All Rights Reserved**
