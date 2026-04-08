# Gavah Token

Gavah Token (GAVAH) is an ERC20 token with ownership capabilities, designed to be managed through the token manager system for flexible management of token operations and permissions.

## Overview

The Gavah Token implementation consists of:
- **GavahToken.sol**: Solidity smart contract (ERC20 + Ownable)
- **gavah-token.js**: JavaScript module for interacting with the token
- **gavah-token.test.js**: Test suite
- **gavah-token-example.js**: Usage examples

## Smart Contract

### Contract Details

- **Name**: Gavah Token
- **Symbol**: GAVAH
- **Decimals**: 18 (standard ERC20)
- **Standard**: ERC20 + Ownable
- **License**: MIT

### Features

1. **ERC20 Standard Compliance**
   - Standard token transfer functionality
   - Allowance and approval mechanisms
   - Balance and supply queries

2. **Ownership**
   - Owner-controlled minting
   - Owner-controlled burning
   - Transferable ownership

3. **Token Manager Integration**
   - Designed to work with the token manager system
   - Allows flexible permission management

### Contract Methods

#### Read Methods

- `name()`: Returns "Gavah Token"
- `symbol()`: Returns "GAVAH"
- `decimals()`: Returns 18
- `totalSupply()`: Returns total token supply
- `balanceOf(address)`: Returns balance of an address
- `allowance(address owner, address spender)`: Returns allowance
- `owner()`: Returns current owner address

#### Write Methods

- `transfer(address to, uint256 amount)`: Transfer tokens
- `approve(address spender, uint256 amount)`: Approve spending
- `transferFrom(address from, address to, uint256 amount)`: Transfer from approved address
- `mint(address to, uint256 amount)`: Mint new tokens (owner only)
- `burn(uint256 amount)`: Burn tokens from owner's balance (owner only)
- `transferOwnership(address newOwner)`: Transfer contract ownership (owner only)
- `renounceOwnership()`: Renounce contract ownership (owner only)

## JavaScript Module

### Installation

```javascript
const GavahToken = require('./src/gavah-token');
```

### Usage

#### Creating an Instance

```javascript
// With default RPC (Ethereum mainnet)
const gavah = new GavahToken('0xYourContractAddress');

// With custom RPC
const gavah = new GavahToken(
  '0xYourContractAddress',
  'https://custom.rpc.url'
);
```

#### Reading Token Information

```javascript
// Get token details
const name = await gavah.getName();        // "Gavah Token"
const symbol = await gavah.getSymbol();    // "GAVAH"
const decimals = await gavah.getDecimals(); // 18

// Get supply and balances
const totalSupply = await gavah.getTotalSupply();
const balance = await gavah.getBalance('0xUserAddress');

// Get owner
const owner = await gavah.getOwner();

// Get all token info at once
const info = await gavah.getTokenInfo();
console.log(info);
// {
//   contractAddress: '0x...',
//   name: 'Gavah Token',
//   symbol: 'GAVAH',
//   decimals: 18,
//   totalSupply: '1000000000000000000000000',
//   totalSupplyFormatted: '1000000.0',
//   owner: '0x...',
//   rpcUrl: 'https://ethereum.publicnode.com'
// }
```

#### Formatting Amounts

```javascript
// Parse human-readable to smallest unit
const amount = gavah.parseAmount('100.5'); // '100500000000000000000'

// Format smallest unit to human-readable
const formatted = gavah.formatAmount('100500000000000000000'); // '100.5'

// With custom decimals
const usdcAmount = gavah.parseAmount('100', 6); // '100000000'
const usdcFormatted = gavah.formatAmount('100000000', 6); // '100.0'
```

#### Checking Allowances

```javascript
const allowance = await gavah.getAllowance(
  '0xOwnerAddress',
  '0xSpenderAddress'
);
```

### API Reference

#### Constructor

```javascript
new GavahToken(contractAddress, rpcUrl)
```

**Parameters:**
- `contractAddress` (string, required): The deployed Gavah Token contract address
- `rpcUrl` (string, optional): RPC URL for blockchain network (default: Ethereum mainnet)

#### Methods

##### `getName()`
Returns the token name.
- **Returns**: `Promise<string>` - "Gavah Token"

##### `getSymbol()`
Returns the token symbol.
- **Returns**: `Promise<string>` - "GAVAH"

##### `getDecimals()`
Returns the token decimals.
- **Returns**: `Promise<number>` - 18

##### `getTotalSupply()`
Returns the total token supply.
- **Returns**: `Promise<string>` - Total supply in smallest unit

##### `getBalance(address)`
Returns the token balance of an address.
- **Parameters**: `address` (string) - The address to check
- **Returns**: `Promise<string>` - Balance in smallest unit

##### `getOwner()`
Returns the contract owner address.
- **Returns**: `Promise<string>` - Owner address

##### `getAllowance(owner, spender)`
Returns the allowance granted by owner to spender.
- **Parameters**: 
  - `owner` (string) - Owner address
  - `spender` (string) - Spender address
- **Returns**: `Promise<string>` - Allowance amount in smallest unit

##### `formatAmount(amount, decimals)`
Formats a token amount from smallest unit to human-readable.
- **Parameters**:
  - `amount` (string|number) - Amount in smallest unit
  - `decimals` (number, optional) - Token decimals (default: 18)
- **Returns**: `string` - Formatted amount

##### `parseAmount(amount, decimals)`
Parses a human-readable amount to smallest unit.
- **Parameters**:
  - `amount` (string) - Human-readable amount
  - `decimals` (number, optional) - Token decimals (default: 18)
- **Returns**: `string` - Amount in smallest unit

##### `getTokenInfo()`
Returns comprehensive token information.
- **Returns**: `Promise<object>` - Token info object with all details

## Token Manager Integration

The Gavah Token is designed to work with the token manager system in this repository.

### Adding to token-managers.json

```json
{
  "tokenAddress": "0xYourDeployedGavahTokenAddress",
  "managerAddress": "0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17",
  "metadata": {
    "tokenName": "Gavah Token",
    "tokenSymbol": "GAVAH",
    "network": "Ethereum Mainnet",
    "chainId": 1,
    "decimals": 18,
    "type": "Governance Token",
    "setBy": "yaketh.eth",
    "notes": "Gavah token managed by yaketh.eth"
  },
  "setAt": "2026-04-08T14:30:00.000Z",
  "updatedAt": "2026-04-08T14:30:00.000Z"
}
```

### Programmatic Management

```javascript
const TokenManager = require('./src/token-manager');
const GavahToken = require('./src/gavah-token');

// Create token manager
const manager = new TokenManager('Gavah Manager');

// Set manager for Gavah token
manager.setManager(
  '0xGavahTokenAddress',
  '0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17', // yaketh.eth
  {
    tokenName: 'Gavah Token',
    tokenSymbol: 'GAVAH',
    network: 'Ethereum Mainnet',
    chainId: 1,
    decimals: 18,
    type: 'Governance Token',
    setBy: 'yaketh.eth',
    notes: 'Gavah token manager assignment'
  }
);

// Create Gavah token instance
const gavah = new GavahToken('0xGavahTokenAddress');

// Get token info
const info = await gavah.getTokenInfo();
console.log(info);
```

## Deployment

### Prerequisites

1. Solidity compiler (solc) or Hardhat/Foundry
2. Node.js and npm
3. Ethereum wallet with ETH for gas
4. RPC endpoint for your target network

### Deployment Steps

1. **Compile the Contract**

```bash
# Using Foundry
forge build

# Or using Hardhat
npx hardhat compile
```

2. **Deploy the Contract**

Deploy with your preferred tool (Foundry, Hardhat, Remix, etc.).

Constructor parameters:
- `initialSupply`: Initial token supply in smallest unit (e.g., `1000000000000000000000000` for 1,000,000 tokens)

3. **Verify the Contract**

Verify on Etherscan or your chosen block explorer.

4. **Update Configuration**

- Update `token-managers.json` with the deployed contract address
- Run `node apply-token-managers.js` to verify configuration

## Testing

### Run Tests

```bash
npm run test:gavah-token
```

### Run Example

```bash
npm run gavah-token:demo
```

### Test Coverage

The test suite covers:
- ✅ Constructor validation
- ✅ Address validation and normalization
- ✅ RPC URL configuration
- ✅ ABI completeness
- ✅ Amount formatting and parsing
- ✅ Public method availability
- ✅ Private method encapsulation

## Security Considerations

1. **Ownership**: The contract owner has privileged access to mint and burn functions
2. **Minting**: Only the owner can mint new tokens - be careful with ownership management
3. **Burning**: Only the owner can burn tokens from their own balance
4. **Transfer Ownership**: Ownership can be transferred or renounced
5. **Standard ERC20**: Follows standard ERC20 security practices

## Integration with Other Contracts

The Gavah Token can be integrated with:
- DEXs (Uniswap, Sushiswap, etc.)
- Lending protocols (Aave, Compound, etc.)
- NFT marketplaces for payment
- Governance systems
- Staking contracts
- Any contract expecting standard ERC20 tokens

## Examples

See `gavah-token-example.js` for comprehensive usage examples including:
- Creating token instances
- Formatting and parsing amounts
- Fetching token information
- Checking balances
- Integration with Token Manager

## Support

For issues or questions:
- Repository: https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-
- Owner: Matthew Brace (kushmanmb)
- Email: mattbrace92@gmail.com

## License

MIT License - See LICENSE file for details
