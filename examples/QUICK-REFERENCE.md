# Quick Reference: ETH_CALL for 0xDC6cA15395cE459C1a617721400588c5e7682351

## One-Liners

```javascript
const EthCallClient = require('./src/eth-call.js');
const client = new EthCallClient();
const CONTRACT = '0xDC6cA15395cE459C1a617721400588c5e7682351';
```

### Get Token Info
```javascript
const info = await client.getERC20Info(CONTRACT);
// Returns: { name, symbol, decimals, totalSupply }
```

### Check Balance
```javascript
const balance = await client.getERC20Balance(CONTRACT, '0xYourAddress...');
// Or with ENS:
const balance = await client.getERC20Balance(CONTRACT, 'kushmanmb.base.eth');
```

### Make Custom Call
```javascript
const data = client.encodeFunctionCall('balanceOf(address)', ['0xAddress...']);
const result = await client.call({ to: CONTRACT, data });
const balance = client.decodeUint256(result);
```

### Call FROM Specific Address
```javascript
const result = await client.call({
  from: 'kushmanmb.base.eth',
  to: CONTRACT,
  data: encodedData
});
```

## Function Selectors

| Function | Selector |
|----------|----------|
| `name()` | `0x06fdde03` |
| `symbol()` | `0x95d89b41` |
| `decimals()` | `0x313ce567` |
| `totalSupply()` | `0x18160ddd` |
| `balanceOf(address)` | `0x70a08231` |
| `owner()` | `0x8da5cb5b` |

## Usage Examples

Run the demonstration:
```bash
node examples/contract-call-example.js
```

Or use the npm script:
```bash
npm run eth-call:demo
```

## Common Tasks

### Check if address has tokens
```javascript
const bal = await client.getERC20Balance(CONTRACT, myAddress);
const hasTokens = BigInt(bal.balance) > 0n;
```

### Get human-readable balance
```javascript
const info = await client.getERC20Info(CONTRACT);
const bal = await client.getERC20Balance(CONTRACT, myAddress);
const decimals = parseInt(info.decimals);
const readable = Number(bal.balance) / (10 ** decimals);
console.log(`${readable} ${info.symbol}`);
```

### Batch read multiple values
```javascript
const [name, symbol, decimals, supply] = await Promise.all([
  client.call({ to: CONTRACT, data: client.encodeFunctionCall('name()') }),
  client.call({ to: CONTRACT, data: client.encodeFunctionCall('symbol()') }),
  client.call({ to: CONTRACT, data: client.encodeFunctionCall('decimals()') }),
  client.call({ to: CONTRACT, data: client.encodeFunctionCall('totalSupply()') })
]);
```

## Contract Address
**0xDC6cA15395cE459C1a617721400588c5e7682351**

Copy: `0xDC6cA15395cE459C1a617721400588c5e7682351`

## Resources
- Full Guide: `examples/CONTRACT-INTERACTION-GUIDE.md`
- Example Code: `examples/contract-call-example.js`
- Module Docs: `src/ETH-CALL.md`
- Source Code: `src/eth-call.js`
