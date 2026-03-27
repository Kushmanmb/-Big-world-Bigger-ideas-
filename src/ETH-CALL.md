# ETH_CALL Module Documentation

## Overview

The `eth_call` module provides functionality to perform read-only contract calls on Ethereum and EVM-compatible blockchains using the `eth_call` JSON-RPC method. It supports ENS (Ethereum Name Service) name resolution, making it easy to work with addresses like `kushmanmb.eth`.

**⚠️ IMPORTANT: Skeleton Implementation Notice**

This module is a **skeleton implementation** with the following limitations:
- **ENS Resolution**: Currently returns a placeholder zero address. For production use, implement proper ENS resolution via ENS registry contracts.
- **ABI Encoding**: Simplified encoding supporting only basic types (address, uint256). Use a full ABI library for complex types.
- **Function Selectors**: Limited to pre-defined functions. Custom functions require proper keccak256 implementation.
- **Hashing**: Uses placeholder hashing instead of keccak256 for ENS namehash computation.

For production use, consider integrating with established Web3 libraries (ethers.js, web3.js) or implementing the missing cryptographic functions.

## Features

- ✅ **eth_call Support**: Read contract state without gas costs
- ⚠️ **ENS Resolution**: Framework for ENS names (currently returns placeholder addresses)
- ✅ **Function Encoding**: Encode function calls for common ERC functions
- ✅ **Response Decoding**: Decode uint256, address, and string return values
- ✅ **ERC-20 Support**: Convenience methods for token operations
- ✅ **ERC-721 Support**: Convenience methods for NFT operations
- ✅ **Caching**: ENS resolutions are cached to reduce RPC calls
- ✅ **Custom RPC**: Support for custom RPC endpoints

## Installation

This module is part of the `big-world-bigger-ideas` package:

```bash
npm install big-world-bigger-ideas
```

## Quick Start

```javascript
const EthCallClient = require('big-world-bigger-ideas/src/eth-call');

// Create a client instance
const client = new EthCallClient();

// Resolve an ENS name
const address = await client.resolveAddress('kushmanmb.eth');

// Make a contract call
const data = client.encodeFunctionCall('balanceOf(address)', [address]);
const result = await client.call({
  to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  data: data
});

// Decode the result
const balance = client.decodeUint256(result);
console.log(`Balance: ${balance}`);
```

## API Reference

### Constructor

#### `new EthCallClient(rpcUrl, ensResolverRpc)`

Creates a new eth_call client instance.

**Parameters:**
- `rpcUrl` (string, optional): RPC endpoint URL. Default: `'https://ethereum.publicnode.com'`
- `ensResolverRpc` (string, optional): ENS resolver RPC URL. Default: same as `rpcUrl`

**Example:**
```javascript
// Use default public RPC
const client = new EthCallClient();

// Use custom RPC
const client = new EthCallClient('https://mainnet.infura.io/v3/YOUR_KEY');
```

### ENS Resolution

#### `async resolveENS(ensName)`

Resolves an ENS name to an Ethereum address.

**Parameters:**
- `ensName` (string): ENS name ending with `.eth`

**Returns:** Promise<string> - Resolved Ethereum address

**Example:**
```javascript
const address = await client.resolveENS('kushmanmb.eth');
console.log(address); // 0x...
```

#### `async resolveAddress(addressOrENS)`

Resolves an address or ENS name. If already an address, returns it as-is.

**Parameters:**
- `addressOrENS` (string): Ethereum address or ENS name

**Returns:** Promise<string> - Resolved Ethereum address

**Example:**
```javascript
// Resolves ENS name
const addr1 = await client.resolveAddress('kushmanmb.eth');

// Returns address as-is
const addr2 = await client.resolveAddress('0x1234...');
```

### Function Encoding/Decoding

#### `encodeFunctionCall(functionSignature, params)`

Encodes a function call with parameters.

**Parameters:**
- `functionSignature` (string): Function signature (e.g., `'balanceOf(address)'`)
- `params` (Array): Function parameters

**Returns:** string - Encoded call data (hex string)

**Supported Function Signatures:**
- `balanceOf(address)` - 0x70a08231
- `totalSupply()` - 0x18160ddd
- `name()` - 0x06fdde03
- `symbol()` - 0x95d89b41
- `decimals()` - 0x313ce567
- `owner()` - 0x8da5cb5b
- `ownerOf(uint256)` - 0x6352211e
- `tokenURI(uint256)` - 0xc87b56dd
- `approve(address,uint256)` - 0x095ea7b3
- `transfer(address,uint256)` - 0xa9059cbb
- `transferFrom(address,address,uint256)` - 0x23b872dd

**Example:**
```javascript
const data = client.encodeFunctionCall('balanceOf(address)', ['0x1234...']);
console.log(data); // 0x70a082310000...
```

#### `decodeUint256(data)`

Decodes a uint256 return value.

**Parameters:**
- `data` (string): Hex-encoded return data

**Returns:** string - Decoded value as decimal string

**Example:**
```javascript
const value = client.decodeUint256('0x0000...0064');
console.log(value); // "100"
```

#### `decodeAddress(data)`

Decodes an address return value.

**Parameters:**
- `data` (string): Hex-encoded return data

**Returns:** string - Decoded Ethereum address

**Example:**
```javascript
const addr = client.decodeAddress('0x0000...1234');
console.log(addr); // 0x1234...
```

#### `decodeString(data)`

Decodes a string return value.

**Parameters:**
- `data` (string): Hex-encoded return data

**Returns:** string - Decoded string

### Contract Calls

#### `async call(callParams)`

Performs an eth_call to read contract state.

**Parameters:**
- `callParams` (object):
  - `to` (string): Contract address or ENS name (required)
  - `from` (string): Caller address or ENS name (optional)
  - `data` (string): Encoded function call (required)
  - `block` (string): Block number or tag (default: `'latest'`)

**Returns:** Promise<string> - Call result (hex string)

**Example:**
```javascript
const result = await client.call({
  from: 'kushmanmb.eth',
  to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  data: '0x70a08231...',
  block: 'latest'
});
```

### Convenience Methods

#### `async getERC20Balance(contractAddress, ownerAddress, block)`

Gets ERC-20 token balance for an address.

**Parameters:**
- `contractAddress` (string): Token contract address
- `ownerAddress` (string): Owner address or ENS name
- `block` (string, optional): Block number or tag (default: `'latest'`)

**Returns:** Promise<object> - Balance information:
```javascript
{
  owner: '0x...',
  contract: '0x...',
  balance: '1000000000000000000',
  rawResult: '0x...',
  block: 'latest'
}
```

**Example:**
```javascript
const usdcContract = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const balance = await client.getERC20Balance(usdcContract, 'kushmanmb.eth');
console.log(`Balance: ${balance.balance}`);
```

#### `async getERC20Info(contractAddress)`

Gets ERC-20 token information (name, symbol, decimals, totalSupply).

**Parameters:**
- `contractAddress` (string): Token contract address or ENS name

**Returns:** Promise<object> - Token information:
```javascript
{
  contract: '0x...',
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: '6',
  totalSupply: '...'
}
```

**Example:**
```javascript
const daiContract = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const info = await client.getERC20Info(daiContract);
console.log(`${info.name} (${info.symbol})`);
```

#### `async getERC721Owner(contractAddress, tokenId)`

Gets the owner of an ERC-721 NFT token.

**Parameters:**
- `contractAddress` (string): NFT contract address
- `tokenId` (string|number): Token ID

**Returns:** Promise<object> - Owner information:
```javascript
{
  contract: '0x...',
  tokenId: '1234',
  owner: '0x...',
  rawResult: '0x...'
}
```

**Example:**
```javascript
const boredApeContract = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
const owner = await client.getERC721Owner(boredApeContract, 1234);
console.log(`Owner: ${owner.owner}`);
```

### RPC Methods

#### `async getBlockNumber()`

Gets the current block number.

**Returns:** Promise<string> - Block number (hex string)

**Example:**
```javascript
const blockNum = await client.getBlockNumber();
console.log(parseInt(blockNum, 16)); // Convert to decimal
```

#### `async getGasPrice()`

Gets the current gas price.

**Returns:** Promise<string> - Gas price in wei (hex string)

**Example:**
```javascript
const gasPrice = await client.getGasPrice();
console.log(`Gas price: ${parseInt(gasPrice, 16)} wei`);
```

### Cache Management

#### `clearCache()`

Clears the ENS resolution cache.

**Example:**
```javascript
client.clearCache();
```

#### `getCacheStats()`

Gets cache statistics.

**Returns:** object - Cache statistics:
```javascript
{
  size: 2,
  timeout: 300000,
  keys: ['ens_kushmanmb.eth', 'ens_vitalik.eth']
}
```

## Usage Examples

### Example 1: Check Token Balance from kushmanmb.eth

```javascript
const EthCallClient = require('big-world-bigger-ideas/src/eth-call');

async function checkBalance() {
  const client = new EthCallClient();
  
  // USDC contract on Ethereum mainnet
  const usdcContract = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  
  // Check balance for kushmanmb.eth
  const balance = await client.getERC20Balance(
    usdcContract,
    'kushmanmb.eth'
  );
  
  // USDC has 6 decimals
  const humanReadable = Number(balance.balance) / 1e6;
  console.log(`Balance: ${humanReadable} USDC`);
}

checkBalance();
```

### Example 2: Make Call FROM kushmanmb.eth

```javascript
async function callFromKushmanmb() {
  const client = new EthCallClient();
  
  // Encode the call
  const data = client.encodeFunctionCall('balanceOf(address)', [
    '0x1234567890123456789012345678901234567890'
  ]);
  
  // Make the call from kushmanmb.eth
  const result = await client.call({
    from: 'kushmanmb.eth',  // Caller address
    to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    data: data
  });
  
  const balance = client.decodeUint256(result);
  console.log(`Balance: ${balance}`);
}
```

### Example 3: Check NFT Ownership

```javascript
async function checkNFTOwner() {
  const client = new EthCallClient();
  
  // Bored Ape Yacht Club contract
  const baycContract = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
  
  // Check owner of token #1234
  const owner = await client.getERC721Owner(baycContract, 1234);
  console.log(`Token #${owner.tokenId} is owned by ${owner.owner}`);
}
```

### Example 4: Get Token Information

```javascript
async function getTokenInfo() {
  const client = new EthCallClient();
  
  // DAI contract on Ethereum mainnet
  const daiContract = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  
  const info = await client.getERC20Info(daiContract);
  
  console.log(`Token: ${info.name}`);
  console.log(`Symbol: ${info.symbol}`);
  console.log(`Decimals: ${info.decimals}`);
  console.log(`Total Supply: ${info.totalSupply}`);
}
```

## Testing

Run the tests:

```bash
npm run test:eth-call
```

Run the demo:

```bash
npm run eth-call:demo
```

## Technical Details

### ENS Resolution

The module includes ENS name resolution functionality. Currently, ENS resolution returns a placeholder address as a skeleton implementation. For production use:

1. Implement proper ENS registry querying
2. Query the ENS resolver contract
3. Use the `namehash` algorithm (EIP-137)
4. Implement keccak256 hashing for name resolution

### Function Encoding

The module uses standard ABI encoding for function calls:
- Function selector: First 4 bytes of keccak256(signature)
- Parameters: 32-byte aligned values

For production use, consider using a full ABI encoding library like `ethers.js` or `web3.js`.

### Caching

- ENS resolutions are cached for 5 minutes (300 seconds)
- Cache uses in-memory Map storage
- Cache can be cleared manually with `clearCache()`

## Network Support

The module works with any Ethereum-compatible network:
- **Ethereum Mainnet**
- **Layer 2s**: Optimism, Arbitrum, Base
- **Sidechains**: Polygon
- **Testnets**: Sepolia, Goerli (deprecated)

Simply provide the appropriate RPC URL when creating the client.

## Best Practices

1. **Use Custom RPC Endpoints**: For production, use dedicated RPC providers like Infura, Alchemy, or your own node
2. **Handle Rate Limits**: Public RPC endpoints have rate limits
3. **Error Handling**: Always wrap calls in try-catch blocks
4. **Batch Calls**: Use `Promise.all()` for multiple independent calls
5. **Cache Awareness**: ENS resolutions are cached; clear cache if needed

## Limitations

1. **Simplified ENS**: ENS resolution is a skeleton implementation
2. **Basic ABI Encoding**: Only supports simple parameter types
3. **Known Selectors**: Limited to pre-defined function signatures
4. **No Transaction Sending**: Read-only operations via eth_call

For full functionality, consider using established Web3 libraries alongside this module.

## Related Modules

- **ERC721Fetcher**: NFT token data fetching
- **ContractABIFetcher**: Fetch contract ABIs from Etherscan
- **EthereumBlockchairFetcher**: Ethereum data from Blockchair API

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
