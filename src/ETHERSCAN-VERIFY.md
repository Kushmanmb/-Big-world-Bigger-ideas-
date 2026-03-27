# Etherscan Contract Verification Module

A secure and comprehensive module for verifying smart contract source code and publishing documentation via the Etherscan API. This module provides a clean, safe API for contract verification across multiple EVM-compatible networks.

## 🎯 Features

- **🔒 Secure API Key Management**: Built-in security practices for API key handling
- **✅ Comprehensive Validation**: Automatic validation of addresses, source code, and compiler versions
- **🌐 Multi-Chain Support**: Works with Ethereum, Base, Polygon, Optimism, Arbitrum, BSC, Avalanche
- **📝 Source Code Verification**: Submit contracts for verification on Etherscan
- **📊 Status Tracking**: Check verification status with GUID-based polling
- **📄 Source Code Retrieval**: Fetch verified source code and ABIs
- **💾 Smart Caching**: Built-in caching for API responses (5-minute default)
- **🔍 Contract Discovery**: Get contract creation transaction details
- **🛡️ Error Handling**: Comprehensive error handling and input sanitization
- **📋 ABI Publishing**: Retrieve and publish contract ABIs

## 🔐 Security Best Practices

### API Key Security

**CRITICAL: Never hardcode API keys in your source code!**

```javascript
// ❌ NEVER DO THIS
const verifier = new EtherscanVerifier('abc123key');

// ✅ ALWAYS DO THIS
const verifier = new EtherscanVerifier(process.env.ETHERSCAN_API_KEY);
```

**Recommended practices:**
- Store API keys in environment variables
- Use `.env` files (add to `.gitignore`)
- Rotate API keys regularly
- Use different keys for development and production
- Never commit `.env` files to version control
- Use secret management services in production (AWS Secrets Manager, HashiCorp Vault, etc.)

### Source Code Security

**Before verification:**
- Review all source code for sensitive information
- Remove any hardcoded credentials or private data
- Verify compiler settings match your deployment
- Test verification on testnets first
- Ensure no sensitive comments or debug code

### Input Validation

The module automatically validates all inputs:
- ✅ Ethereum addresses (format, length, characters)
- ✅ Source code (size limits, non-empty)
- ✅ Compiler versions (format validation)
- ✅ Optimization parameters (valid ranges)

## 📦 Installation

The module is included in the project. No additional dependencies required beyond the base `http-client` module.

```javascript
const EtherscanVerifier = require('./src/etherscan-verify');
```

## 🚀 Quick Start

### Basic Usage

```javascript
const EtherscanVerifier = require('./src/etherscan-verify');

// Initialize verifier (use environment variable for API key!)
const verifier = new EtherscanVerifier(process.env.ETHERSCAN_API_KEY, 1);

// Verify a contract
const result = await verifier.verifyContract({
  contractAddress: '0xYourContractAddress',
  sourceCode: contractSourceCode,
  contractName: 'MyContract',
  compilerVersion: 'v0.8.19+commit.7dd6d404',
  optimizationUsed: 1,
  runs: 200
});

console.log('Verification GUID:', result.guid);

// Check verification status
const status = await verifier.checkVerificationStatus(result.guid);
console.log('Status:', status.status); // 'verified' or 'pending'
```

## 📖 API Reference

### Constructor

#### `new EtherscanVerifier(apiKey, chainId?)`

Creates a new Etherscan verifier instance.

**Parameters:**
- `apiKey` (string, required): Your Etherscan API key
- `chainId` (number, optional): Chain ID (default: 1)

**Supported Chain IDs:**
- `1` - Ethereum Mainnet (api.etherscan.io)
- `5` - Goerli Testnet (api-goerli.etherscan.io)
- `11155111` - Sepolia Testnet (api-sepolia.etherscan.io)
- `10` - Optimism (api-optimistic.etherscan.io)
- `137` - Polygon (api.polygonscan.com)
- `8453` - Base (api.basescan.org)
- `42161` - Arbitrum One (api.arbiscan.io)
- `56` - BSC (api.bscscan.com)
- `43114` - Avalanche (api.snowtrace.io)

**Example:**
```javascript
// Ethereum mainnet
const ethVerifier = new EtherscanVerifier(process.env.ETHERSCAN_API_KEY, 1);

// Base mainnet
const baseVerifier = new EtherscanVerifier(process.env.BASESCAN_API_KEY, 8453);

// Polygon
const polyVerifier = new EtherscanVerifier(process.env.POLYGONSCAN_API_KEY, 137);
```

**Throws:** Error if API key is not provided

---

### Verification Methods

#### `verifyContract(options)`

Submits a contract for source code verification.

**Parameters:**
- `options` (object, required):
  - `contractAddress` (string, required): The deployed contract address
  - `sourceCode` (string, required): The Solidity source code
  - `contractName` (string, required): The contract name (e.g., "MyContract")
  - `compilerVersion` (string, required): Solidity compiler version (e.g., "v0.8.19+commit.7dd6d404")
  - `optimizationUsed` (number, optional): 0 or 1 (default: 0)
  - `runs` (number, optional): Optimization runs (default: 200)
  - `constructorArguments` (string, optional): ABI-encoded constructor arguments (default: '')
  - `evmVersion` (string, optional): EVM version (default: 'default')
  - `licenseType` (string, optional): License type code (default: '1')

**License Types:**
- `1` - No License
- `2` - Unlicense
- `3` - MIT
- `4` - GNU GPLv2
- `5` - GNU GPLv3
- `6` - GNU LGPLv2.1
- `7` - GNU LGPLv3
- `8` - BSD-2-Clause
- `9` - BSD-3-Clause
- `10` - MPL-2.0
- `11` - OSL-3.0
- `12` - Apache-2.0
- `13` - GNU AGPLv3
- `14` - BSL-1.0

**Returns:** Promise<object>
```javascript
{
  status: 'submitted',
  message: 'Source code submitted for verification',
  guid: 'unique-verification-guid',
  contractAddress: '0x...',
  timestamp: 1234567890
}
```

**Example:**
```javascript
const result = await verifier.verifyContract({
  contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  sourceCode: fs.readFileSync('./MyContract.sol', 'utf8'),
  contractName: 'MyContract',
  compilerVersion: 'v0.8.19+commit.7dd6d404',
  optimizationUsed: 1,
  runs: 200,
  constructorArguments: '000000000000000000000000abcd1234...',
  evmVersion: 'paris',
  licenseType: '3' // MIT License
});

console.log('Submitted! GUID:', result.guid);
```

**Throws:**
- Error if validation fails
- Error if API request fails

---

#### `checkVerificationStatus(guid)`

Checks the verification status of a submitted contract.

**Parameters:**
- `guid` (string, required): The GUID returned from `verifyContract()`

**Returns:** Promise<object>
```javascript
{
  guid: 'verification-guid',
  status: 'verified', // or 'pending'
  result: 'Pass - Verified' or error message,
  message: 'Verification message',
  timestamp: 1234567890
}
```

**Example:**
```javascript
const status = await verifier.checkVerificationStatus('your-guid-here');

if (status.status === 'verified') {
  console.log('✓ Contract verified successfully!');
} else {
  console.log('⏳ Verification pending...');
}
```

---

### Retrieval Methods

#### `getSourceCode(contractAddress)`

Retrieves the verified source code and metadata for a contract.

**Parameters:**
- `contractAddress` (string, required): The contract address

**Returns:** Promise<object>
```javascript
{
  contractAddress: '0x...',
  sourceCode: 'pragma solidity ^0.8.0; ...',
  abi: '[...]',
  contractName: 'MyContract',
  compilerVersion: 'v0.8.19',
  optimizationUsed: '1',
  runs: '200',
  constructorArguments: '...',
  evmVersion: 'paris',
  library: '...',
  licenseType: '3',
  proxy: '0' or '1',
  implementation: '0x...' (if proxy),
  swarmSource: '...',
  verified: true,
  timestamp: 1234567890
}
```

**Example:**
```javascript
const source = await verifier.getSourceCode('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');

console.log('Contract:', source.contractName);
console.log('Compiler:', source.compilerVersion);
console.log('Verified:', source.verified);
console.log('Source Code Length:', source.sourceCode.length);
```

---

#### `getContractABI(contractAddress)`

Retrieves only the ABI of a verified contract.

**Parameters:**
- `contractAddress` (string, required): The contract address

**Returns:** Promise<object>
```javascript
{
  contractAddress: '0x...',
  abi: [...], // Parsed JSON array or string
  status: 'success',
  timestamp: 1234567890
}
```

**Example:**
```javascript
const abiData = await verifier.getContractABI('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');

// ABI is automatically parsed if it was JSON
const abi = Array.isArray(abiData.abi) ? abiData.abi : JSON.parse(abiData.abi);

console.log('Functions:', abi.filter(x => x.type === 'function').length);
console.log('Events:', abi.filter(x => x.type === 'event').length);
```

---

#### `getContractCreation(contractAddress)`

Gets the contract creation transaction details.

**Parameters:**
- `contractAddress` (string, required): The contract address

**Returns:** Promise<object>
```javascript
{
  contractAddress: '0x...',
  contractCreator: '0x...',
  txHash: '0x...',
  timestamp: 1234567890
}
```

**Example:**
```javascript
const creation = await verifier.getContractCreation('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');

console.log('Deployed by:', creation.contractCreator);
console.log('Transaction:', creation.txHash);
```

---

### Validation Methods

#### `validateAddress(address)`

Validates and normalizes an Ethereum address.

**Parameters:**
- `address` (string): The address to validate

**Returns:** string (normalized address with 0x prefix, lowercase)

**Example:**
```javascript
const addr = verifier.validateAddress('BC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');
// Returns: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'
```

**Throws:** Error if address is invalid

---

#### `validateSourceCode(sourceCode)`

Validates source code input.

**Parameters:**
- `sourceCode` (string): The source code to validate

**Returns:** string (validated source code)

**Validation:**
- Must be non-empty string
- Must contain non-whitespace characters
- Maximum size: 500KB

**Throws:** Error if source code is invalid

---

#### `validateCompilerVersion(compilerVersion)`

Validates compiler version format.

**Parameters:**
- `compilerVersion` (string): The compiler version to validate

**Returns:** string (validated compiler version)

**Valid formats:**
- `v0.8.0` (with 'v' prefix)
- `v0.8.0+commit.c7dfd78e` (with commit hash)

**Throws:** Error if format is invalid

---

### Utility Methods

#### `formatVerificationResult(result)`

Formats verification result for display.

**Parameters:**
- `result` (object): Verification result object

**Returns:** string (formatted output)

---

#### `formatSourceCodeResult(result)`

Formats source code result for display.

**Parameters:**
- `result` (object): Source code result object

**Returns:** string (formatted output)

---

#### `clearCache()`

Clears the internal cache.

**Returns:** void

---

#### `getCacheStats()`

Gets cache statistics.

**Returns:** object
```javascript
{
  size: 5,
  timeout: 300000,
  keys: ['key1', 'key2', ...]
}
```

---

#### `getAPIInfo()`

Gets API configuration information.

**Returns:** object
```javascript
{
  baseUrl: 'api.etherscan.io',
  chainId: 1,
  hasApiKey: true,
  cacheTimeout: 300000
}
```

---

## 💡 Usage Examples

### Example 1: Complete Verification Workflow

```javascript
const fs = require('fs');
const EtherscanVerifier = require('./src/etherscan-verify');

async function verifyMyContract() {
  // Initialize (ALWAYS use environment variables for API keys!)
  const verifier = new EtherscanVerifier(process.env.ETHERSCAN_API_KEY, 1);
  
  // Load your contract source
  const sourceCode = fs.readFileSync('./contracts/MyContract.sol', 'utf8');
  
  try {
    // Step 1: Submit for verification
    console.log('Submitting contract for verification...');
    const result = await verifier.verifyContract({
      contractAddress: '0xYourDeployedContractAddress',
      sourceCode: sourceCode,
      contractName: 'MyContract',
      compilerVersion: 'v0.8.19+commit.7dd6d404',
      optimizationUsed: 1,
      runs: 200,
      constructorArguments: '', // If your constructor has args, encode them
      evmVersion: 'paris',
      licenseType: '3' // MIT
    });
    
    console.log('✓ Submitted successfully!');
    console.log('GUID:', result.guid);
    
    // Step 2: Poll for verification status
    console.log('\nChecking verification status...');
    let verified = false;
    let attempts = 0;
    const maxAttempts = 20; // 100 seconds total (5 sec intervals)
    
    while (!verified && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const status = await verifier.checkVerificationStatus(result.guid);
      console.log(`Attempt ${attempts + 1}: ${status.status}`);
      
      if (status.status === 'verified') {
        console.log('✓ Contract verified successfully!');
        verified = true;
      } else if (status.result && status.result.includes('Fail')) {
        console.error('✗ Verification failed:', status.result);
        break;
      }
      
      attempts++;
    }
    
    // Step 3: Retrieve and display verified information
    if (verified) {
      const sourceData = await verifier.getSourceCode(result.contractAddress);
      console.log('\nVerified Contract Information:');
      console.log('Contract Name:', sourceData.contractName);
      console.log('Compiler:', sourceData.compilerVersion);
      console.log('Optimization:', sourceData.optimizationUsed === '1' ? 'Yes' : 'No');
      console.log('License:', sourceData.licenseType);
      console.log('View on Etherscan: https://etherscan.io/address/' + result.contractAddress + '#code');
    }
    
  } catch (error) {
    console.error('Error during verification:', error.message);
  }
}

verifyMyContract();
```

### Example 2: Multi-Contract Verification

```javascript
async function verifyMultipleContracts() {
  const verifier = new EtherscanVerifier(process.env.ETHERSCAN_API_KEY, 1);
  
  const contracts = [
    {
      address: '0xContract1Address',
      source: './Token.sol',
      name: 'Token',
      compiler: 'v0.8.19+commit.7dd6d404'
    },
    {
      address: '0xContract2Address',
      source: './Sale.sol',
      name: 'TokenSale',
      compiler: 'v0.8.19+commit.7dd6d404'
    }
  ];
  
  for (const contract of contracts) {
    try {
      console.log(`\nVerifying ${contract.name}...`);
      
      const result = await verifier.verifyContract({
        contractAddress: contract.address,
        sourceCode: fs.readFileSync(contract.source, 'utf8'),
        contractName: contract.name,
        compilerVersion: contract.compiler,
        optimizationUsed: 1,
        runs: 200,
        licenseType: '3'
      });
      
      console.log('✓ Submitted:', result.guid);
      
    } catch (error) {
      console.error(`✗ Failed to verify ${contract.name}:`, error.message);
    }
  }
}
```

### Example 3: Retrieve and Compare ABIs

```javascript
async function compareABIs(address1, address2) {
  const verifier = new EtherscanVerifier(process.env.ETHERSCAN_API_KEY, 1);
  
  try {
    const [abi1, abi2] = await Promise.all([
      verifier.getContractABI(address1),
      verifier.getContractABI(address2)
    ]);
    
    console.log('Contract 1 functions:', abi1.abi.filter(x => x.type === 'function').length);
    console.log('Contract 2 functions:', abi2.abi.filter(x => x.type === 'function').length);
    
    // Find common functions
    const funcs1 = new Set(abi1.abi.filter(x => x.type === 'function').map(x => x.name));
    const funcs2 = new Set(abi2.abi.filter(x => x.type === 'function').map(x => x.name));
    const common = [...funcs1].filter(x => funcs2.has(x));
    
    console.log('Common functions:', common);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Example 4: Security-First Deployment Script

```javascript
require('dotenv').config(); // Load .env file

async function secureVerification() {
  // Validate environment
  if (!process.env.ETHERSCAN_API_KEY) {
    throw new Error('ETHERSCAN_API_KEY not set in environment');
  }
  
  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS not set in environment');
  }
  
  const verifier = new EtherscanVerifier(
    process.env.ETHERSCAN_API_KEY,
    parseInt(process.env.CHAIN_ID || '1')
  );
  
  // Validate contract exists on chain first
  const creation = await verifier.getContractCreation(process.env.CONTRACT_ADDRESS);
  console.log('Contract deployed by:', creation.contractCreator);
  console.log('Deployment tx:', creation.txHash);
  
  // Load source without sensitive data
  const sourceCode = fs.readFileSync(process.env.SOURCE_FILE, 'utf8');
  
  // Verify no sensitive patterns in code
  const sensitivePatterns = [
    /private.*key/i,
    /password/i,
    /secret/i,
    /0x[a-fA-F0-9]{64}/ // potential private key
  ];
  
  for (const pattern of sensitivePatterns) {
    if (pattern.test(sourceCode)) {
      throw new Error('Potential sensitive data found in source code!');
    }
  }
  
  // Proceed with verification
  const result = await verifier.verifyContract({
    contractAddress: process.env.CONTRACT_ADDRESS,
    sourceCode: sourceCode,
    contractName: process.env.CONTRACT_NAME,
    compilerVersion: process.env.COMPILER_VERSION,
    optimizationUsed: parseInt(process.env.OPTIMIZATION || '1'),
    runs: parseInt(process.env.RUNS || '200'),
    licenseType: process.env.LICENSE_TYPE || '3'
  });
  
  console.log('✓ Verification submitted securely');
  console.log('GUID:', result.guid);
}
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file (never commit this!):

```bash
# Etherscan API Keys (get from https://etherscan.io/myapikey)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here

# Contract Details
CONTRACT_ADDRESS=0xYourContractAddress
CONTRACT_NAME=MyContract
SOURCE_FILE=./contracts/MyContract.sol
COMPILER_VERSION=v0.8.19+commit.7dd6d404
OPTIMIZATION=1
RUNS=200
LICENSE_TYPE=3
CHAIN_ID=1
```

Add to `.gitignore`:
```
.env
.env.local
.env.*.local
```

### Getting API Keys

1. **Etherscan**: https://etherscan.io/myapikey
2. **Basescan**: https://basescan.org/myapikey
3. **Polygonscan**: https://polygonscan.com/myapikey
4. **Arbiscan**: https://arbiscan.io/myapikey
5. **BscScan**: https://bscscan.com/myapikey

---

## 🧪 Testing

Run the tests:

```bash
npm run test:etherscan-verify
```

Run the demo:

```bash
npm run etherscan-verify:demo
```

Run all tests:

```bash
npm test
```

---

## 🌐 Supported Networks

| Network | Chain ID | API Base URL |
|---------|----------|--------------|
| Ethereum Mainnet | 1 | api.etherscan.io |
| Goerli Testnet | 5 | api-goerli.etherscan.io |
| Sepolia Testnet | 11155111 | api-sepolia.etherscan.io |
| Optimism | 10 | api-optimistic.etherscan.io |
| Polygon | 137 | api.polygonscan.com |
| Base | 8453 | api.basescan.org |
| Arbitrum One | 42161 | api.arbiscan.io |
| BSC | 56 | api.bscscan.com |
| Avalanche | 43114 | api.snowtrace.io |

---

## 📊 Caching

The module includes built-in caching to reduce API calls:

- **Cache Duration**: 5 minutes (300,000ms)
- **Cached Operations**:
  - Verification status checks
  - Source code retrieval
  - ABI retrieval
  - Contract creation info

**Manual Cache Control:**
```javascript
// Clear all cached data
verifier.clearCache();

// Get cache statistics
const stats = verifier.getCacheStats();
console.log('Cached items:', stats.size);
console.log('Cache timeout:', stats.timeout);
```

---

## ⚠️ Error Handling

The module throws descriptive errors for all failure cases:

```javascript
try {
  const result = await verifier.verifyContract(options);
} catch (error) {
  if (error.message.includes('Invalid Ethereum address')) {
    // Handle invalid address
  } else if (error.message.includes('API key is required')) {
    // Handle missing API key
  } else if (error.message.includes('Failed to submit')) {
    // Handle API failure
  } else {
    // Handle other errors
  }
}
```

**Common Errors:**
- `API key is required` - No API key provided
- `Invalid Ethereum address format` - Malformed address
- `Source code must be a non-empty string` - Invalid source code
- `Invalid compiler version format` - Wrong version format
- `optimizationUsed must be 0 or 1` - Invalid optimization flag
- `Source code exceeds maximum allowed size` - File too large
- `Failed to submit contract for verification` - API error

---

## 🎯 Best Practices

### 1. Test on Testnets First

Always verify your workflow on testnets before mainnet:

```javascript
// Test on Sepolia first
const testVerifier = new EtherscanVerifier(
  process.env.ETHERSCAN_API_KEY,
  11155111 // Sepolia
);
```

### 2. Use Proper Compiler Settings

Ensure your verification settings match deployment:

```javascript
// These must match what you used during deployment
const result = await verifier.verifyContract({
  // ...
  compilerVersion: 'v0.8.19+commit.7dd6d404', // Must match
  optimizationUsed: 1,  // Must match
  runs: 200,            // Must match
  evmVersion: 'paris'   // Must match
});
```

### 3. Handle Constructor Arguments

If your contract has constructor arguments:

```javascript
const Web3 = require('web3');
const web3 = new Web3();

// Encode constructor arguments
const encodedArgs = web3.eth.abi.encodeParameters(
  ['address', 'uint256'],
  ['0x...', '1000000']
).slice(2); // Remove '0x' prefix

const result = await verifier.verifyContract({
  // ...
  constructorArguments: encodedArgs
});
```

### 4. Implement Retry Logic

Network issues can occur, implement retry:

```javascript
async function verifyWithRetry(options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await verifier.verifyContract(options);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
```

### 5. Log Everything

Maintain audit logs for verification:

```javascript
const result = await verifier.verifyContract(options);

// Log to file
fs.appendFileSync('verification-log.txt', 
  `${new Date().toISOString()} - ${options.contractAddress} - ${result.guid}\n`
);
```

---

## 🔗 Related Modules

- **`etherscan-token-balance.js`** - Fetch token balances from Etherscan
- **`erc721.js`** - ERC-721 NFT token interactions
- **`erc20.js`** - ERC-20 token interactions
- **`contract-abi.js`** - Contract ABI utilities
- **`http-client.js`** - Shared HTTP client (used internally)

---

## 📚 References

- [Etherscan API Documentation](https://docs.etherscan.io/api-endpoints/contracts)
- [Solidity Compiler Versions](https://github.com/ethereum/solc-bin/blob/gh-pages/bin/list.json)
- [SPDX License List](https://spdx.org/licenses/)
- [EVM Versions](https://docs.soliditylang.org/en/latest/using-the-compiler.html#setting-the-evm-version-to-target)

---

## 👤 Author & Ownership

**Owner:** kushmanmb.eth  
**Controller:** yaketh.eth  
**Author:** Matthew Brace (kushmanmb)  
**Email:** kushmanmb@gmx.com  
**Website:** https://kushmanmb.org  

---

## 📝 License

ISC

---

**© 2024-2026 Matthew Brace (kushmanmb) | All Rights Reserved**
