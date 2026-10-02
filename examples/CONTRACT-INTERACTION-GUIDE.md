# ETH_CALL for Contract 0xDC6cA15395cE459C1a617721400588c5e7682351

This guide demonstrates how to interact with the Ethereum contract at address `0xDC6cA15395cE459C1a617721400588c5e7682351` using the `eth-call` module.

## Quick Start

```javascript
const EthCallClient = require('./src/eth-call.js');

const CONTRACT = '0xDC6cA15395cE459C1a617721400588c5e7682351';
const client = new EthCallClient();

// Get token information
const info = await client.getERC20Info(CONTRACT);
console.log(`Token: ${info.name} (${info.symbol})`);

// Check balance
const balance = await client.getERC20Balance(CONTRACT, 'kushmanmb.base.eth');
console.log(`Balance: ${balance.balance}`);
```

## What is eth_call?

`eth_call` is a JSON-RPC method that allows you to:
- **Read contract state** without sending transactions
- **No gas costs** - completely free to use
- **Instant results** - no waiting for block confirmations
- **Test functions** before sending real transactions

## Available Operations

### 1. Check Token Information

If the contract is an ERC-20 token, you can retrieve its metadata:

```javascript
const client = new EthCallClient();
const CONTRACT = '0xDC6cA15395cE459C1a617721400588c5e7682351';

// Get all token info at once
const info = await client.getERC20Info(CONTRACT);
console.log('Name:', info.name);
console.log('Symbol:', info.symbol);
console.log('Decimals:', info.decimals);
console.log('Total Supply:', info.totalSupply);
```

### 2. Check Token Balance

Check how many tokens an address owns:

```javascript
// Check balance for a specific address
const balance = await client.getERC20Balance(
  CONTRACT,
  '0x1234567890123456789012345678901234567890'
);
console.log('Balance:', balance.balance);

// Or use ENS names
const balanceENS = await client.getERC20Balance(
  CONTRACT,
  'kushmanmb.base.eth'
);
```

### 3. Manual Function Calls

For custom contract functions, encode the call manually:

```javascript
// Encode the function call
const data = client.encodeFunctionCall('balanceOf(address)', [
  '0x1234567890123456789012345678901234567890'
]);

// Make the call
const result = await client.call({
  to: CONTRACT,
  data: data,
  block: 'latest'
});

// Decode the result
const balance = client.decodeUint256(result);
console.log('Balance:', balance);
```

### 4. Call FROM a Specific Address

Simulate calling from a specific address (useful for permission checks):

```javascript
const result = await client.call({
  from: 'kushmanmb.base.eth',  // Call FROM this address
  to: CONTRACT,
  data: encodedData
});
```

### 5. Batch Multiple Calls

Make multiple calls efficiently in parallel:

```javascript
const [name, symbol, decimals, totalSupply] = await Promise.all([
  client.call({ to: CONTRACT, data: client.encodeFunctionCall('name()') }),
  client.call({ to: CONTRACT, data: client.encodeFunctionCall('symbol()') }),
  client.call({ to: CONTRACT, data: client.encodeFunctionCall('decimals()') }),
  client.call({ to: CONTRACT, data: client.encodeFunctionCall('totalSupply()') })
]);
```

## Supported Function Signatures

The eth-call module supports these common functions out of the box:

| Function | Selector | Purpose |
|----------|----------|---------|
| `balanceOf(address)` | `0x70a08231` | Get token balance |
| `totalSupply()` | `0x18160ddd` | Get total supply |
| `name()` | `0x06fdde03` | Get token name |
| `symbol()` | `0x95d89b41` | Get token symbol |
| `decimals()` | `0x313ce567` | Get token decimals |
| `owner()` | `0x8da5cb5b` | Get contract owner |
| `ownerOf(uint256)` | `0x6352211e` | Get NFT owner (ERC-721) |
| `tokenURI(uint256)` | `0xc87b56dd` | Get NFT metadata URI |

## Complete Example

```javascript
const EthCallClient = require('./src/eth-call.js');

async function inspectContract() {
  const CONTRACT = '0xDC6cA15395cE459C1a617721400588c5e7682351';
  const client = new EthCallClient();
  
  console.log('Contract:', CONTRACT);
  console.log();
  
  try {
    // Get token information
    const info = await client.getERC20Info(CONTRACT);
    console.log('Token Information:');
    console.log('  Name:', info.name);
    console.log('  Symbol:', info.symbol);
    console.log('  Decimals:', info.decimals);
    console.log('  Total Supply:', info.totalSupply);
    console.log();
    
    // Check balance for kushmanmb.base.eth
    const balance = await client.getERC20Balance(CONTRACT, 'kushmanmb.base.eth');
    console.log('Balance for kushmanmb.base.eth:');
    console.log('  Raw balance:', balance.balance);
    
    // Convert to human-readable format
    const decimals = parseInt(info.decimals);
    const humanBalance = BigInt(balance.balance) / BigInt(10 ** decimals);
    console.log('  Human-readable:', humanBalance.toString(), info.symbol);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

inspectContract();
```

## Running the Example

Run the demonstration example:

```bash
node examples/contract-call-example.js
```

Or use the eth-call demo:

```bash
npm run eth-call:demo
```

## RPC Configuration

By default, the module uses a public Ethereum mainnet RPC endpoint. You can customize:

```javascript
// Use a custom RPC endpoint
const client = new EthCallClient('https://mainnet.infura.io/v3/YOUR_KEY');

// Or use a different network (e.g., Base)
const baseClient = new EthCallClient('https://mainnet.base.org');
```

## Network Requirements

To make real calls to the contract:
1. **Network connectivity** to an Ethereum RPC endpoint
2. **RPC endpoint** - either public or your own node
3. **No wallet** or private keys needed (read-only operations)
4. **No gas** or ETH required

## ENS Support

The module supports ENS names like `kushmanmb.base.eth`:

```javascript
// Both work the same way
const balance1 = await client.getERC20Balance(CONTRACT, '0x1234...');
const balance2 = await client.getERC20Balance(CONTRACT, 'kushmanmb.base.eth');
```

**Note:** ENS resolution is currently a skeleton implementation. For production use, integrate with a proper ENS resolver.

## Common Use Cases

### Check if You Own Tokens

```javascript
const myAddress = 'kushmanmb.base.eth';
const balance = await client.getERC20Balance(CONTRACT, myAddress);
const hasTokens = BigInt(balance.balance) > 0n;
console.log('Has tokens:', hasTokens);
```

### Monitor Token Supply

```javascript
const info = await client.getERC20Info(CONTRACT);
console.log('Total Supply:', info.totalSupply);
```

### Verify Contract Details

```javascript
const info = await client.getERC20Info(CONTRACT);
console.log('Is this the right token?');
console.log('Expected name:', 'MyToken');
console.log('Actual name:', info.name);
```

## Troubleshooting

### Network Errors

If you see "ENOTFOUND" or connection errors:
- Check your internet connectivity
- Verify the RPC endpoint is accessible
- Try a different public RPC endpoint

### Invalid Contract

If calls fail or return empty data:
- The contract might not implement the called functions
- The contract might be on a different network
- The address might be incorrect

### ENS Resolution Fails

Currently, ENS resolution returns placeholder addresses. For production:
- Use resolved addresses directly
- Implement proper ENS resolution
- Use a Web3 library for ENS support

## Related Documentation

- **ETH-CALL.md** - Full module documentation
- **src/eth-call.js** - Module source code
- **src/eth-call-example.js** - More examples
- **src/eth-call.test.js** - Test suite

## Support

For questions or issues:
- GitHub: [kushmanmb-org/-Big-world-Bigger-ideas-](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-)
- Email: mattbrace92@gmail.com
- ENS: kushmanmb.base.eth

## License

ISC License - See LICENSE file
